/**
 * Licence of each prompt source, read from each repo's LICENSE on
 * 2026-11-16 (GitHub API `repos/<repo>` plus the LICENSE text where the API
 * said NOASSERTION). CC BY 4.0 requires a link to the licence and credit,
 * which the Sources page and every card's creator credit provide.
 * "none" means all rights reserved: shown with credit, never relicensed,
 * and a blocker if the site ever charges money.
 */
export interface SourceLicense {
  label: string;
  url: string | null;
  reusable: boolean;
}

export const SOURCE_LICENSES: Record<string, SourceLicense> = {
  'YouMind-OpenLab/awesome-nano-banana-pro-prompts': {
    label: 'CC BY 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/',
    reusable: true,
  },
  'ZeroLu/awesome-gpt-image': { label: 'MIT', url: 'https://opensource.org/license/mit', reusable: true },
  'ImgEdify/Awesome-GPT4o-Image-Prompts': { label: 'MIT', url: 'https://opensource.org/license/mit', reusable: true },
  'Anil-matcha/Awesome-GPT-Image-2-API-Prompts': { label: 'No licence', url: null, reusable: false },
  'songguoxs/gpt4o-image-prompts': { label: 'No licence', url: null, reusable: false },
  'songguoxs/awesome-video-prompts': { label: 'No licence', url: null, reusable: false },
};

export const LICENSES_CHECKED = '2026-11-16';
