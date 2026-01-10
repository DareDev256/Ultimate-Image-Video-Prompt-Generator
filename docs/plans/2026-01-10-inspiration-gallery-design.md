# Inspiration Gallery Design

**Date:** 2026-01-10
**Status:** Approved

## Overview

Integrate 1,050+ image prompts and 50+ video prompts from songguoxs's GitHub repos into an inspiration panel accessible during prompt creation.

## Data Sources

- [gpt4o-image-prompts](https://github.com/songguoxs/gpt4o-image-prompts) - 1,050+ image prompts
- [awesome-video-prompts](https://github.com/songguoxs/awesome-video-prompts) - 50+ video prompts

## Features

1. **Inspiration Panel** - Slide-out panel in create flow with search, tags, favorites
2. **Pattern Library** - Extracted style patterns as clickable suggestions in generator fields
3. **Sync Strategy** - Bundled locally + weekly background sync for new prompts
4. **Full Attribution** - Credit to songguoxs in app and README

## Data Architecture

```
/web/public/data/
├── image-prompts.json      # 1,050+ from songguoxs
├── video-prompts.json      # 50+ from songguoxs
├── patterns.json           # Extracted style patterns
└── meta.json               # Sync metadata
```

### Image Prompt Schema
```typescript
interface ImagePrompt {
  id: number;
  title: string;
  source: { name: string; url: string };
  prompts: string[];
  tags: string[];
  coverImage: string;
  model: string;
}
```

### Pattern Library Schema
```typescript
interface PatternLibrary {
  lighting: string[];
  cameras: string[];
  moods: string[];
  colorGrades: string[];
  styles: string[];
}
```

## UI Design

### Inspiration Panel
- Slide-out from right side on `/create` pages
- Floating "Inspiration" button trigger
- Tabs: Images | Videos | Saved
- Full-text search + tag filters
- Masonry grid of thumbnails
- Click to expand: copy, use as template, save, view original

### Pattern Integration
- Popular patterns shown below each generator field
- Click to auto-fill field value
- Categories: lighting, cameras, moods, colors, styles

## File Structure

```
/web/src/components/inspiration/
├── InspirationPanel.tsx
├── InspirationButton.tsx
├── PromptCard.tsx
├── PromptDetail.tsx
├── TagFilter.tsx
└── SearchBar.tsx

/web/src/hooks/
├── useInspirationData.ts
├── useFavorites.ts
└── usePatterns.ts

/web/src/lib/inspiration/
├── sync.ts
└── search.ts

/scripts/
├── fetch-prompts.ts
├── extract-patterns.ts
└── build-inspiration-data.ts
```

## Attribution

Credit songguoxs in:
- README.md with links to both repos
- Inspiration panel footer
- Any documentation referencing community prompts
