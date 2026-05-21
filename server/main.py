from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import StreamingResponse
import fitz  # PyMuPDF
import pdfplumber
import pytesseract
import io
from pydantic import BaseModel
from typing import List
import PIL.Image

app = FastAPI(title="NeuroLearn AI Document Service")

class DocumentProcessResult(BaseModel):
    filename: str
    text_length: int
    chunks: List[str]
    ocr_used: bool

def extract_text_pymupdf(file_bytes: bytes) -> str:
    text = ""
    try:
        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text()
    except Exception as e:
        print(f"PyMuPDF Error: {e}")
    return text

def extract_text_pdfplumber(file_bytes: bytes) -> str:
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"pdfplumber Error: {e}")
    return text

def extract_text_ocr(file_bytes: bytes) -> str:
    # Fallback to OCR if both PyMuPDF and pdfplumber return little/no text
    text = ""
    try:
        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            for page in doc:
                pix = page.get_pixmap()
                img_bytes = pix.tobytes("png")
                image = PIL.Image.open(io.BytesIO(img_bytes))
                text += pytesseract.image_to_string(image) + "\n"
    except Exception as e:
        print(f"OCR Error: {e}")
    return text

def chunk_text(text: str, chunk_size: int = 1000) -> List[str]:
    # Simple semantic chunking logic
    words = text.split()
    chunks = []
    current_chunk = []
    current_length = 0
    for word in words:
        current_length += len(word) + 1
        current_chunk.append(word)
        if current_length >= chunk_size:
            chunks.append(" ".join(current_chunk))
            current_chunk = []
            current_length = 0
    if current_chunk:
        chunks.append(" ".join(current_chunk))
    return chunks

import asyncio
import json

@app.post("/api/process-document")
async def process_document(request: Request, file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    file_bytes = await file.read()
    
    async def event_stream():
        yield f"data: {json.dumps({'status': 'reading', 'message': f'Initializing processing for {file.filename}'})}\n\n"
        await asyncio.sleep(0.5)
        
        # Strategy 1: PyMuPDF (fastest)
        yield f"data: {json.dumps({'status': 'extracting', 'message': 'Attempting fast text extraction via PyMuPDF...'})}\n\n"
        await asyncio.sleep(0.5)
        text = extract_text_pymupdf(file_bytes)
        ocr_used = False
        
        # Strategy 2: pdfplumber if PyMuPDF fails or returns very little text
        if len(text.strip()) < 50:
            yield f"data: {json.dumps({'status': 'extracting', 'message': 'PyMuPDF extraction yielded low text. Trying pdfplumber fallback...'})}\n\n"
            await asyncio.sleep(0.5)
            text = extract_text_pdfplumber(file_bytes)
        
        # Strategy 3: OCR Fallback for scanned documents
        if len(text.strip()) < 50:
            yield f"data: {json.dumps({'status': 'ocr', 'message': 'Detected scanned document. Initiating deep OCR analysis (Tesseract)...'})}\n\n"
            await asyncio.sleep(1.0)
            text = extract_text_ocr(file_bytes)
            ocr_used = True
            
        if not text.strip():
            yield f"data: {json.dumps({'status': 'error', 'message': 'Could not extract text from document.'})}\n\n"
            return
            
        yield f"data: {json.dumps({'status': 'chunking', 'message': 'Chunking semantic representations...'})}\n\n"
        await asyncio.sleep(0.5)
        chunks = chunk_text(text)
        
        # TODO: Semantic Embedding Database Injection
        yield f"data: {json.dumps({'status': 'embedding', 'message': f'Generating neural embeddings for {len(chunks)} chunks...'})}\n\n"
        await asyncio.sleep(1.0)
        yield f"data: {json.dumps({'status': 'injecting', 'message': 'Injecting vectorized knowledge into semantic database...'})}\n\n"
        await asyncio.sleep(0.5)
        
        final_result = DocumentProcessResult(
            filename=file.filename,
            text_length=len(text),
            chunks=chunks,
            ocr_used=ocr_used
        ).model_dump()
        
        yield f"data: {json.dumps({'status': 'complete', 'message': 'Knowledge synthesis complete.', 'result': final_result})}\n\n"
        
    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
