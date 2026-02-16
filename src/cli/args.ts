import type { PackName, PresetPackName } from '../types';

export interface CliArgs {
  template?: string;
  load?: string;
  packs?: PackName[];
  preset?: PresetPackName;
  full?: boolean;
  quick?: boolean;
  help?: boolean;
  listTemplates?: boolean;
  analyze?: string;  // Image path to analyze
  favorites?: {
    action: 'add' | 'list' | 'remove';
    field?: string;
    value?: string;
  };
}

/** Maps CLI flags to their preset pack name. Add new presets here — no parser changes needed. */
const PRESET_FLAGS: Record<string, PresetPackName> = {
  '--quick': 'quick',
  '--standard': 'standard',
  '--full': 'full',
  '--fashion': 'fashion',
  '--street': 'street',
};

export function parseArgs(args: string[]): CliArgs {
  const result: CliArgs = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--list-templates' || arg === '-l') {
      result.listTemplates = true;
    } else if (arg === '--template' || arg === '-t') {
      result.template = args[++i];
    } else if (arg === '--load') {
      result.load = args[++i];
    } else if (arg === '--pack' || arg === '-p') {
      const packArg = args[++i] ?? '';
      result.packs = packArg.split(',') as PackName[];
    } else if (arg in PRESET_FLAGS) {
      result.preset = PRESET_FLAGS[arg];
    } else if (arg === '--analyze' || arg === '-a') {
      result.analyze = args[++i];
    } else if (arg === 'favorites') {
      const action = args[++i] as 'add' | 'list' | 'remove';
      result.favorites = { action };
      if (action === 'add' || action === 'remove') {
        result.favorites.field = args[++i];
        if (action === 'add') {
          result.favorites.value = args[++i];
        }
      }
    }
  }

  return result;
}

export function printHelp() {
  console.log(`
Ultimate Image Prompt Generator

Usage:
  prompt-gen [options]
  prompt-gen favorites <action> [field] [value]

Options:
  -t, --template <name>   Start with a built-in template
  --load <name>           Load a saved preset
  -p, --pack <packs>      Use specific packs (comma-separated)
  --quick                 Quick mode (core categories only)
  --standard              Standard mode (core + camera + lighting + atmosphere)
  --full                  Full mode (all categories)
  --fashion               Fashion-focused mode
  --street                Street photography mode
  -a, --analyze <image>   Analyze an image and generate a matching prompt
  -l, --list-templates    List available templates
  -h, --help              Show this help

Favorites Commands:
  favorites list                    List all favorites
  favorites add <field> <value>     Add a favorite value
  favorites remove <field> <value>  Remove a favorite value

Examples:
  prompt-gen --template street-photo
  prompt-gen --full
  prompt-gen --pack camera,lighting,film
  prompt-gen --load my-saved-preset
  prompt-gen --analyze ./photo.jpg
  prompt-gen favorites add camera.position "through window"

Environment Variables:
  GEMINI_API_KEY          Required for --analyze (or GOOGLE_API_KEY)
`);
}
