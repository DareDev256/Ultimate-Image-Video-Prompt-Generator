#!/usr/bin/env python3
"""
Batch generate inspiration images using Gemini 3 Pro Image model.
Processes prompts from image-prompts.json and saves generated images.
"""

import os
import sys
import json
import re
import time
from pathlib import Path

from google import genai
from google.genai import types

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = PROJECT_ROOT / "web" / "public" / "generated-inspiration"
PROMPTS_FILE = PROJECT_ROOT / "web" / "public" / "data" / "image-prompts.json"

# Ensure output directory exists
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def clean_prompt(prompt: str) -> str:
    """Replace argument placeholders with default values."""
    # Pattern: {argument name="xxx" default="yyy"}
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
    return "1:1"  # Default to square

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
        print(f"Error generating image: {e}")
        return False

def main():
    # Parse arguments
    if len(sys.argv) < 3:
        print("Usage: python batch-generate-inspiration.py <start_index> <end_index>")
        print("Example: python batch-generate-inspiration.py 0 25")
        sys.exit(1)

    start_idx = int(sys.argv[1])
    end_idx = int(sys.argv[2])

    # Initialize Gemini client
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not set")
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    # Load prompts
    with open(PROMPTS_FILE) as f:
        all_prompts = json.load(f)

    # Filter to nano-banana prompts (id >= 10001) that don't require uploads
    nb_prompts = [
        p for p in all_prompts
        if p.get("id", 0) >= 10001
        and p.get("prompts")
        and not any(kw in p["prompts"][0].lower() for kw in ["uploaded", "reference image", "attached image", "attached photo"])
    ]

    # Slice to requested range
    prompts_batch = nb_prompts[start_idx:end_idx]

    print(f"Processing {len(prompts_batch)} prompts (indices {start_idx}-{end_idx})")
    print(f"Output directory: {OUTPUT_DIR}")

    results = []
    for i, prompt_data in enumerate(prompts_batch):
        prompt_id = prompt_data["id"]
        slug = prompt_data["slug"]
        title = prompt_data.get("title", "untitled")
        raw_prompt = prompt_data["prompts"][0]

        # Clean prompt
        cleaned_prompt = clean_prompt(raw_prompt)
        aspect = get_aspect_ratio(cleaned_prompt)

        # Output filename
        output_path = OUTPUT_DIR / f"{slug}.png"

        # Skip if already exists
        if output_path.exists():
            print(f"[{i+1}/{len(prompts_batch)}] Skipping {slug} (already exists)")
            results.append({"id": prompt_id, "slug": slug, "status": "skipped", "path": str(output_path)})
            continue

        print(f"[{i+1}/{len(prompts_batch)}] Generating {slug}: {title[:50]}...")

        success = generate_image(client, cleaned_prompt, output_path, aspect)

        if success:
            print(f"  ✓ Saved to {output_path}")
            results.append({"id": prompt_id, "slug": slug, "status": "success", "path": str(output_path)})
        else:
            print(f"  ✗ Failed to generate")
            results.append({"id": prompt_id, "slug": slug, "status": "failed"})

        # Rate limiting - be gentle with the API
        time.sleep(2)

    # Summary
    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    success_count = sum(1 for r in results if r["status"] == "success")
    skip_count = sum(1 for r in results if r["status"] == "skipped")
    fail_count = sum(1 for r in results if r["status"] == "failed")
    print(f"Success: {success_count}")
    print(f"Skipped: {skip_count}")
    print(f"Failed: {fail_count}")

    # Save results log
    log_path = OUTPUT_DIR / f"batch-{start_idx}-{end_idx}-results.json"
    with open(log_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nResults saved to {log_path}")

if __name__ == "__main__":
    main()
