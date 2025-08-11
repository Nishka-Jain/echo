import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  const { transcription } = await request.json();

  if (!transcription) {
    return NextResponse.json({ error: "Transcription is required." }, { status: 400 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
      Analyze the following story transcript. Your task is to:
      1. Generate a concise, one-line summary of the story. The summary should capture the main essence and emotion.
      2. Suggest between 5 and 8 relevant tags that categorize the content. Tags should be single words or short two-word phrases (e.g., "Family Recipe", "Childhood Memory").

      Transcript:
      """
      ${transcription}
      """

      Please provide the output strictly in the following JSON format:
      {
        "summary": "Your one-line summary here.",
        "tags": ["Tag1", "Tag2", "Tag3"]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean the response to ensure it's valid JSON
    const cleanedJsonString = responseText.replace(/```json\n|```/g, '').trim();
    const parsedResponse = JSON.parse(cleanedJsonString);

    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    return NextResponse.json({ error: "Failed to generate AI suggestions." }, { status: 500 });
  }
}