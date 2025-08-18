from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import io
from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend at localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client with API key from .env
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.post("/ask")
async def ask_question(file: UploadFile = File(...), question: str = Form(...)):
    try:
        # Read PDF content
        pdf_content = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
        text = ""
        for page in pdf_reader.pages:
            extracted_text = page.extract_text()
            if extracted_text:
                text += extracted_text + "\n"
        
        if not text:
            return {"error": "No text could be extracted from the PDF."}

        # Prepare prompt for OpenAI (RAG simulation: context + question)
        prompt = (
            "You are a helpful assistant. Use the following document content to answer the user's question.\n\n"
            f"Document Content:\n{text[:4000]}\n\n"  # Limit context to avoid token limits
            f"Question: {question}\n\n"
            "Provide a concise and accurate answer based on the document content."
        )

        # Call OpenAI API
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.7
        )

        answer = response.choices[0].message.content.strip()
        return {"answer": answer}

    except Exception as e:
        return {"error": f"Error processing request: {str(e)}"}