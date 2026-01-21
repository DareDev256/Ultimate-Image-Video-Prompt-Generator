#!/usr/bin/env python3
"""
Update image-prompts.json to include paths to locally generated images.
Adds a 'generatedImage' field to prompts that have generated images.
"""

import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
GENERATED_DIR = PROJECT_ROOT / "web" / "public" / "generated-inspiration"
PROMPTS_FILE = PROJECT_ROOT / "web" / "public" / "data" / "image-prompts.json"

def main():
    # Load prompts
    with open(PROMPTS_FILE) as f:
        prompts = json.load(f)

    # Find all generated images
    generated_images = {p.stem: p for p in GENERATED_DIR.glob("*.png")}
    print(f"Found {len(generated_images)} generated images")

    # Update prompts with generated image paths
    updated_count = 0
    for prompt in prompts:
        slug = prompt.get("slug")
        if slug and slug in generated_images:
            # Add local generated image path
            prompt["generatedImage"] = f"/generated-inspiration/{slug}.png"
            updated_count += 1

    print(f"Updated {updated_count} prompts with generated image paths")

    # Save updated prompts
    with open(PROMPTS_FILE, "w") as f:
        json.dump(prompts, f, indent=2, ensure_ascii=False)

    print(f"Saved to {PROMPTS_FILE}")

if __name__ == "__main__":
    main()
