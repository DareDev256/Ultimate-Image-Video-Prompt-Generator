#!/usr/bin/env python3
"""
Retry failed image generations.
"""

import os
import re
import json
import time
from pathlib import Path

from google import genai
from google.genai import types

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = PROJECT_ROOT / "web" / "public" / "generated-inspiration"
PROMPTS_FILE = PROJECT_ROOT / "web" / "public" / "data" / "image-prompts.json"

# Failed IDs to retry
FAILED_IDS = [10118, 10014, 10015, 10021, 10024, 10068, 10072, 10073, 10084, 10092]

def clean_prompt(prompt: str) -> str:
    """Replace argument placeholders with default values."""
    pattern = r'\{argument\s+name="[^"]+"\s+default="([^"]+)"\}'
    cleaned = re.sub(pattern, r'\1', prompt)
    return cleaned

def get_aspect_ratio(prompt: str) -> str:
    """Determine aspect ratio based on prompt content."""
    prompt_lower = prompt.lower()
    if "16:9" in prompt_lower or "horizontal" in prompt_lower or "landscape" in prompt_lower:
        return "16:9"
    elif "9:16" in prompt_lower or "vertical" in prompt_lower or "portrait ratio" in prompt_lower:
        return "9:16"
    elif "1:1" in prompt_lower or "square" in prompt_lower:
        return "1:1"
    elif "4:3" in prompt_lower:
        return "4:3"
    elif "3:4" in prompt_lower:
        return "3:4"
    return "1:1"

def generate_image(client, prompt: str, output_path: Path, aspect_ratio: str = "1:1"):
    """Generate a single image using Gemini."""
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
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not set")
        return

    client = genai.Client(api_key=api_key)

    # Load prompts
    with open(PROMPTS_FILE) as f:
        all_prompts = json.load(f)

    # Find failed prompts
    failed_prompts = [p for p in all_prompts if p.get("id") in FAILED_IDS]

    print(f"Retrying {len(failed_prompts)} failed generations...")

    for i, prompt_data in enumerate(failed_prompts):
        prompt_id = prompt_data["id"]
        slug = prompt_data["slug"]
        title = prompt_data.get("title", "untitled")
        raw_prompt = prompt_data["prompts"][0]

        cleaned_prompt = clean_prompt(raw_prompt)
        aspect = get_aspect_ratio(cleaned_prompt)
        output_path = OUTPUT_DIR / f"{slug}.png"

        print(f"[{i+1}/{len(failed_prompts)}] Retrying {slug}: {title[:50]}...")

        success = generate_image(client, cleaned_prompt, output_path, aspect)

        if success:
            print(f"  ✓ Saved to {output_path}")
        else:
            print(f"  ✗ Failed again")

        time.sleep(3)  # Longer delay for retries

    print("\nDone!")

if __name__ == "__main__":
    main()
