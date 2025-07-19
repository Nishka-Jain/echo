import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    // Get the original text and the target language from the request
    const { text, targetLanguage } = await req.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing text or target language." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Create a clear, direct prompt for translation
const prompt = `TASK: Translate the entire text block below into a single, cohesive ${targetLanguage} translation.

RULES:
- The source text may contain multiple languages.
- Your entire output must be ONLY in ${targetLanguage}.
- Do not leave any part of the original text untranslated, even if it's already in English or another language.
- Do not add any extra words, introductory phrases, or explanations.

SOURCE TEXT:
"${text}"`;

    // Send the request to the Gemini API
    const result = await model.generateContent(prompt);
    const response = result.response;
    const translatedText = response.text();

    // Send the translated text back to the frontend
    return NextResponse.json({ translatedText });

  } catch (error) {
    console.error("Error in translation API route:", error);
    return NextResponse.json(
      { error: "Failed to translate text." },
      { status: 500 }
    );
  }
}
