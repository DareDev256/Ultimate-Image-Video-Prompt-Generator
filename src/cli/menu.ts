import * as p from '@clack/prompts';
import pc from 'picocolors';
import clipboard from 'clipboardy';
import type { ImagePrompt } from '../types';
import { generateJSON } from '../generators/json';
import { generateNaturalLanguage } from '../generators/natural';
import { savePreset } from '../storage/presets';

export async function showPostGenerationMenu(prompt: ImagePrompt): Promise<'regenerate' | 'done'> {
  while (true) {
    const action = await p.select({
      message: 'What would you like to do?',
      options: [
        { value: 'copy-json', label: '[c] Copy JSON', hint: 'for Nano Banana' },
        { value: 'copy-natural', label: '[n] Copy Natural Language', hint: 'for ChatGPT' },
        { value: 'copy-both', label: '[b] Copy Both' },
        { value: 'save', label: '[s] Save as Preset' },
        { value: 'regenerate', label: '[r] Regenerate', hint: 'start over' },
        { value: 'done', label: '[d] Done', hint: 'exit' }
      ]
    });

    if (p.isCancel(action)) {
      return 'done';
    }

    switch (action) {
      case 'copy-json':
        await clipboard.write(generateJSON(prompt));
        p.log.success('JSON copied to clipboard!');
        continue;

      case 'copy-natural':
        await clipboard.write(generateNaturalLanguage(prompt));
        p.log.success('Natural language copied to clipboard!');
        continue;

      case 'copy-both': {
        const both = `JSON:\n${generateJSON(prompt)}\n\nNatural Language:\n${generateNaturalLanguage(prompt)}`;
        await clipboard.write(both);
        p.log.success('Both formats copied to clipboard!');
        continue;
      }

      case 'save': {
        const name = await p.text({
          message: 'Preset name:',
          placeholder: 'my-awesome-prompt'
        });
        if (!p.isCancel(name) && name) {
          savePreset(name, prompt);
          p.log.success(`Saved as "${name}"!`);
        }
        continue;
      }

      case 'regenerate':
        return 'regenerate';

      default:
        return 'done';
    }
  }
}
