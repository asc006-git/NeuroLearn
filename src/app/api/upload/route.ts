import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Forward the file to the FastAPI microservice
    const fastApiUrl = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
    
    // Create new FormData for FastAPI
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const response = await fetch(`${fastApiUrl}/api/process-document`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Backend processing failed", details: errorText },
        { status: response.status }
      );
    }

    // Proxy the Server-Sent Events stream from FastAPI directly to the client
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
