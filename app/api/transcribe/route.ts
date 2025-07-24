
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Helper to fetch audio from Firebase Storage URL and return as base64
async function fetchAudioAsBase64(url: string): Promise<{ base64: string, mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch audio from Firebase Storage");
  const arrayBuffer = await res.arrayBuffer();
  // Try to get mimeType from response headers, fallback to 'audio/mpeg'
  const mimeType = res.headers.get('content-type') || 'audio/mpeg';
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return { base64, mimeType };
}


export async function POST(req: NextRequest) {
  try {
    // Accept JSON body with audioUrl and mimeType
    const { audioUrl, mimeType } = await req.json();
    if (!audioUrl || !mimeType) {
      return NextResponse.json({ error: "Missing audioUrl or mimeType." }, { status: 400 });
    }

    // Download audio from Firebase Storage
    const { base64, mimeType: detectedMimeType } = await fetchAudioAsBase64(audioUrl);

    // Prepare Gemini API call
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const audioPart = {
      inlineData: {
        mimeType: mimeType || detectedMimeType,
        data: base64,
      },
    };
    const prompt = `TASK: Transcribe the user-provided audio VERBATIM.

    RULES:
    - OUTPUT ONLY THE TRANSCRIBED TEXT.
    - DO NOT add any extra words, introductory phrases, or explanations.
    - DO NOT generate a story or summarize the content.
    - IGNORE all non-verbal sounds (coughs, background noise, clicks, etc.).
    - Format the output as clean, readable paragraphs with correct punctuation.
    - Ensure the output is a clean, literal transcription of the spoken words.`;

    // Send to Gemini
    const result = await model.generateContent([prompt, audioPart]);
    const response = result.response;
    const transcription = response.text();

    return NextResponse.json({ transcription });
  } catch (error) {
    console.error("Error in transcription API route:", error);
    return NextResponse.json({ error: "Failed to transcribe audio." }, { status: 500 });
  }
}
