try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

import io

async def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """Extract text from supported file types."""
    text = ""
    if filename.lower().endswith(".pdf"):
        if fitz is None:
            raise ValueError("PyMuPDF (fitz) is not installed. PDF processing is disabled.")
        pdf_document = fitz.open(stream=file_content, filetype="pdf")
        for page_num in range(len(pdf_document)):
            page = pdf_document.load_page(page_num)
            text += page.get_text()
        pdf_document.close()
    elif filename.lower().endswith(".txt"):
        text = file_content.decode("utf-8")
    else:
        raise ValueError(f"Unsupported file format: {filename}")
    
    return text.strip()
