import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// This helper function converts the audio stream into a format the API can use
async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  try {
    // Get the audio file from the request sent by the frontend
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided." },
        { status: 400 }
      );
    }

    // Convert the audio file to a Base64 string
    const audioBuffer = await streamToBuffer(audioFile.stream());
    const audioBase64 = audioBuffer.toString("base64");

    // Prepare the audio data and a prompt for the Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const audioPart = {
      inlineData: {
        mimeType: audioFile.type,
        data: audioBase64,
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

    // Send the request to Gemini
    const result = await model.generateContent([prompt, audioPart]);
    const response = result.response;
    const transcription = response.text();

    // Send the final text transcription back to the frontend
    return NextResponse.json({ transcription });

  } catch (error) {
    console.error("Error in transcription API route:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio." },
      { status: 500 }
    );
  }
}
