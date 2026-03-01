import asyncio
from app.core.config import get_settings
from google import genai
import traceback

async def t():
    try:
        client = genai.Client(api_key=get_settings().gemini_api_key)
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents='test',
            config=genai.types.GenerateContentConfig(max_output_tokens=5)
        )
        print('Success:', response.text)
    except Exception as e:
        print('Error:', repr(e))
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(t())
