import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { url, manualText } = await req.json();
    let textToSummarize = "";

    // 1. Determine Source
    if (manualText) {
      textToSummarize = manualText;
    } else if (url) {
      const res = await fetch(
        `https://api.supadata.ai/v1/youtube/transcript?url=${encodeURIComponent(url)}&mode=native`,
        { headers: { "x-api-key": process.env.SUPADATA_API_KEY || "" } }
      );
      
      const data = await res.json();
      if (!data.content) {
        return NextResponse.json({ error: "No transcript found for this video. Try pasting it manually!" }, { status: 404 });
      }
      textToSummarize = data.content.map((s: any) => s.text).join(" ");
    } else {
      return NextResponse.json({ error: "No input provided" }, { status: 400 });
    }

    // 2. Gemini Analysis
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are an expert content analyst. 
      Summarize the following text provided below.
      
      STRICT RULES:
      - Always respond in English.
      - Header 1: '## The Bottom Line' (One powerful summary sentence).
      - Header 2: '## Key Takeaways' (Exactly 5 detailed bullet points covering the full length of the content).
      
      Text: ${textToSummarize}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ summary: responseText });

  } catch (error: any) {
    console.error("Summary Error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}