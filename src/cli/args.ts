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
  favorites?: {
    action: 'add' | 'list' | 'remove';
    field?: string;
    value?: string;
  };
}

const presetFlags: PresetPackName[] = ['quick', 'standard', 'full', 'fashion', 'street'];

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
    } else if (arg === '--full') {
      result.preset = 'full';
    } else if (arg === '--quick') {
      result.preset = 'quick';
    } else if (arg === '--standard') {
      result.preset = 'standard';
    } else if (arg === '--fashion') {
      result.preset = 'fashion';
    } else if (arg === '--street') {
      result.preset = 'street';
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
  prompt-gen favorites add camera.position "through window"
`);
}
