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

1. meterNo → the “Property of EEPCo No”
2. kilowatt → the kWh reading

Meter reading rules (VERY IMPORTANT):
- Black digits are whole numbers.
- Red digit represents the decimal (0.1).
- Combine black digits + red digit as ONE decimal number.
- Example: black digits "27728" and red digit "5" → 27728.5
- Do NOT add or duplicate digits.
- If unsure, return null.

Important rules:
- Do NOT add explanations.
- Do NOT wrap numbers in quotes.
- Respond ONLY in this JSON format:

{
  "meterNo": string or null,
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

      // Existing JSON parsing logic
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
      // Check if it's an error we can retry
      const status = error.status || 500; // Use 500 as a default if status is missing
      let retryDelay = currentDelay;

      // --- CRUCIAL: Handle 429 Quota Exceeded and 503 Server Error ---
      if (status === 429 || status === 503 || status === 500) {

        // Log the full error to see if we can extract the delay
        console.warn(`[Gemini] Retriable Error encountered (Status: ${status}).`);

        // If the error object contains the specific retry delay (from the API's JSON body), use it.
        // The API returns the delay in the 'details' section, which may be accessible via the error.message.
        // Since we can't reliably parse the message here, we stick to the exponential backoff for safety,
        // but we make 429 a retriable error.
        
        if (attempt < MAX_RETRIES) {
          
          if (status === 429) {
             // For a 429, you should ideally extract the specific delay (e.g., 17s).
             // Since the library doesn't expose it directly, we'll use a longer fixed delay
             // for 429 errors or just let the exponential backoff handle it.
             // Sticking to exponential backoff for simplicity and safety:
             retryDelay = currentDelay; 
          } else {
             // 500/503 errors use standard exponential backoff
             retryDelay = currentDelay;
          }

          console.warn(
            `[Gemini] Attempt ${attempt} failed with Status ${status}. Retrying in ${retryDelay}ms...`
          );

          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          
          // Double the delay for the next attempt (Exponential Backoff)
          currentDelay *= 2; 
          continue; // Go to the next iteration (attempt)
        }
      }
      
      // --- FINAL CATCH: If max retries reached or it's a non-retriable error (e.g., 400 Bad Request) ---
      console.error(`[Gemini] Fatal error on attempt ${attempt}. Max retries reached or non-retriable error:`, error);
      throw new Error(`Gemini extraction failed: ${error.message}`);
    }
  }
}