import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const text = await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser();
      
      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        const text = pdfData.Pages
          .map((page: any) => 
            page.Texts
              .map((t: any) => decodeURIComponent(t.R[0].T))
              .join(" ")
          )
          .join("\n");
        resolve(text);
      });

      pdfParser.on("pdfParser_dataError", reject);
      pdfParser.parseBuffer(buffer);
    });

    if (!text.trim()) {
      return NextResponse.json({ error: "No text found" }, { status: 400 });
    }

    return NextResponse.json({ text: text.trim() });
  } catch (error: any) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: "Failed to extract text" }, { status: 500 });
  }
}