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
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      { text: prompt },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(
      text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim()
    );
  } catch (error) {
    console.error("Gemini error:", error);
    return {
      error: true,
      message: error.message || "Unknown error from Gemini",
      details: error,
    };
  }
}
