import { GoogleGenAI } from "@google/genai";

export async function extractKWAndMeterNo(base64, mimeType) {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const prompt = `
You are an AI that extracts data from electric meter images.

Extract ONLY these fields:

1. meterNo  → the “Property of EECO No”
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(text);

    if (!text) {
      throw new Error("No response text from Gemini");
    }

    const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    let result;
    try {
      result = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON:", parseError, "Text:", cleanText);
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
    console.error("Gemini extraction error:", error);
    throw new Error(`Gemini extraction failed: ${error.message}`);
  }
}
