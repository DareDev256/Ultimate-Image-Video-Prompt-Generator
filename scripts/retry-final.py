#!/usr/bin/env python3
"""
Final retry for remaining failed generations.
"""

import os
import re
import json
import time
from pathlib import Path

from google import genai
from google.genai import types

PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = PROJECT_ROOT / "web" / "public" / "generated-inspiration"
PROMPTS_FILE = PROJECT_ROOT / "web" / "public" / "data" / "image-prompts.json"

# Still missing
RETRY_IDS = [10015, 10024, 10073]

def clean_prompt(prompt: str) -> str:
    pattern = r'\{argument\s+name="[^"]+"\s+default="([^"]+)"\}'
    return re.sub(pattern, r'\1', prompt)

def generate_image(client, prompt: str, output_path: Path, aspect_ratio: str = "1:1"):
    try:
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE'],
                image_config=types.ImageConfig(
                    aspect_ratio=aspect_ratio,
                    image_size="1K"
                )
            )
        )
        for part in response.parts:
            if part.inline_data:
                image = part.as_image()
                image.save(str(output_path))
                return True
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

    with open(PROMPTS_FILE) as f:
        all_prompts = json.load(f)

    for prompt_id in RETRY_IDS:
        prompt_data = next((p for p in all_prompts if p.get("id") == prompt_id), None)
        if not prompt_data:
            continue

        slug = prompt_data["slug"]
        raw_prompt = prompt_data["prompts"][0]
        cleaned = clean_prompt(raw_prompt)
        output_path = OUTPUT_DIR / f"{slug}.png"

        print(f"Retrying {slug}...")
        if generate_image(client, cleaned, output_path):
            print(f"  ✓ Success!")
        else:
            print(f"  ✗ Failed")
        time.sleep(5)

if __name__ == "__main__":
    main()
