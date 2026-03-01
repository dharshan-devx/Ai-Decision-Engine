import os
from dotenv import load_dotenv
load_dotenv()
key = os.getenv('GEMINI_API_KEY')
print('Key starts with:', key[:6] if key else None)
print('Key ends with:', key[-4:] if key else None)
print('Length:', len(key) if key else 0)
print('Contains whitespace:', any(c.isspace() for c in key) if key else False)
print('Contains quotes:', '"' in key or "'" in key if key else False)
