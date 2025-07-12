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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a clear, direct prompt for translation
    const prompt = `Translate the following text into ${targetLanguage}. Provide only the translated text, without any additional comments, formatting, or conversational text.

Text to translate:
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
