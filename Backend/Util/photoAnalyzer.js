import { GoogleGenAI } from "@google/genai";

const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 1000;

export async function extractKWAndMeterNo(base64, mimeType) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const prompt = `
You are an AI that extracts data from electric meter images.

Extract ONLY these fields:

1. meterNo  → the “Property of EECO No”
2. kilowatt → the kWh reading (must be a NUMBER)

Important rules:
- Do NOT add explanations.
- Do NOT wrap numbers in quotes.
- If unreadable, return null.
- Respond ONLY in this JSON format:

{
  "meterNo": "string or null",
  "kilowatt": number or null
}
`;

  const contents = [
    { inlineData: { mimeType, data: base64 } },
    { text: prompt },
  ];

  let currentDelay = INITIAL_DELAY_MS;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
      });

      const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(`[Gemini] Attempt ${attempt} successful. Response: ${text}`);

      if (!text) {
        throw new Error("No response text from Gemini");
      }

      const cleanText = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      let result;
      try {
        result = JSON.parse(cleanText);
      } catch (parseError) {
        console.error(
          "Failed to parse Gemini JSON:",
          parseError,
          "Text:",
          cleanText
        );
        throw new Error("Gemini response is not valid JSON");
      }

      if (
        !result ||
        (result.meterNo !== null && typeof result.meterNo !== "string") ||
        (result.kilowatt !== null && typeof result.kilowatt !== "number")
      ) {
        console.error("Invalid data format from Gemini:", result);
        throw new Error("Invalid data extracted from meter image");
      }

      return result;
    } catch (error) {
      const is503Error =
        error?.status === 503 || error?.message?.includes("503");

      if (is503Error && attempt < MAX_RETRIES) {
        console.warn(
          `[Gemini] Attempt ${attempt} failed with 503 Service Unavailable. Retrying in ${currentDelay}ms...`
        );

        await new Promise((resolve) => setTimeout(resolve, currentDelay));

        currentDelay *= 2;
        continue;
      }

      console.error(`[Gemini] Fatal error on attempt ${attempt}:`, error);
      throw new Error(`Gemini extraction failed: ${error.message}`);
    }
  }
}
