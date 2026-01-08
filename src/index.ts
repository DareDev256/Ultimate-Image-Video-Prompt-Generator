#!/usr/bin/env bun
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { parseArgs, printHelp } from './cli/args';
import { listTemplates, getTemplate, builtInTemplates } from './core/templates';
import { getCategoriesForPreset, getCategoriesForPacks } from './core/packs';
import { runPromptWalkthrough } from './cli/prompts';
import { displayOutput } from './cli/display';
import { showPostGenerationMenu } from './cli/menu';
import { loadPreset } from './storage/presets';
import { loadFavorites, addFavorite, removeFavorite } from './storage/favorites';
import { analyzeImage } from './analyzer';
import type { ImagePrompt, PresetPackName } from './types';

async function main() {
  const args = parseArgs(process.argv.slice(2));

  // Handle help
  if (args.help) {
    printHelp();
    return;
  }

  // Handle list templates
  if (args.listTemplates) {
    console.log('\nAvailable Templates:\n');
    for (const t of listTemplates()) {
      console.log(`  ${pc.cyan(t.name.padEnd(20))} ${pc.dim(t.description)}`);
    }
    console.log('');
    return;
  }

  // Handle favorites commands
  if (args.favorites) {
    const { action, field, value } = args.favorites;
    if (action === 'list') {
      const favorites = loadFavorites();
      console.log('\nYour Favorites:\n');
      for (const [f, values] of Object.entries(favorites)) {
        console.log(`  ${pc.cyan(f)}:`);
        for (const v of values) {
          console.log(`    ★ ${v}`);
        }
      }
      console.log('');
    } else if (action === 'add' && field && value) {
      addFavorite(field, value);
      console.log(pc.green(`Added favorite for ${field}`));
    } else if (action === 'remove' && field && value) {
      removeFavorite(field, value);
      console.log(pc.green(`Removed favorite from ${field}`));
    }
    return;
  }

  // Handle image analysis
  if (args.analyze) {
    p.intro(pc.bgMagenta(pc.black(' Image Analyzer ')));

    const spinner = p.spinner();
    spinner.start(`Analyzing ${args.analyze}...`);

    try {
      const prompt = await analyzeImage(args.analyze);
      spinner.stop('Analysis complete!');

      // Display output
      displayOutput(prompt);

      // Show menu
      await showPostGenerationMenu(prompt);

      p.outro(pc.green('Happy prompting!'));
    } catch (error) {
      spinner.stop('Analysis failed');
      p.log.error(error instanceof Error ? error.message : String(error));
    }
    return;
  }

  // Start main flow
  p.intro(pc.bgCyan(pc.black(' Ultimate Image Prompt Generator ')));

  let shouldContinue = true;

  while (shouldContinue) {
    // Determine initial prompt and categories
    let initialPrompt: Partial<ImagePrompt> = {};
    let categories: string[] = [];

    // Load from preset if specified
    if (args.load) {
      const loaded = loadPreset(args.load);
      if (loaded) {
        initialPrompt = loaded;
        p.log.info(`Loaded preset: ${args.load}`);
      } else {
        p.log.warn(`Preset "${args.load}" not found`);
      }
    }

    // Load template if specified
    if (args.template) {
      const template = getTemplate(args.template);
      if (template) {
        initialPrompt = { ...initialPrompt, ...template };
        p.log.info(`Using template: ${args.template}`);
      } else {
        p.log.warn(`Template "${args.template}" not found`);
      }
    }

    // If no template specified via args, ask user
    if (!args.template && !args.load) {
      const templateChoice = await p.select({
        message: 'Start with a template?',
        options: [
          { value: 'none', label: 'Blank (start from scratch)' },
          ...builtInTemplates.map(t => ({
            value: t.name,
            label: t.name,
            hint: t.description
          }))
        ]
      });

      if (p.isCancel(templateChoice)) {
        p.cancel('Cancelled');
        return;
      }

      if (templateChoice !== 'none') {
        const template = getTemplate(templateChoice as string);
        if (template) {
          initialPrompt = template;
        }
      }
    }

    // Determine categories based on args or ask user
    if (args.preset) {
      categories = getCategoriesForPreset(args.preset);
    } else if (args.packs) {
      categories = getCategoriesForPacks(args.packs);
    } else {
      // Ask user which mode
      const mode = await p.select({
        message: 'Which mode?',
        options: [
          { value: 'quick', label: 'Quick', hint: 'Core categories only' },
          { value: 'standard', label: 'Standard', hint: 'Core + Camera + Lighting + Atmosphere' },
          { value: 'full', label: 'Full', hint: 'All categories' },
          { value: 'fashion', label: 'Fashion', hint: 'Fashion-focused' },
          { value: 'street', label: 'Street', hint: 'Street photography' }
        ]
      });

      if (p.isCancel(mode)) {
        p.cancel('Cancelled');
        return;
      }

      categories = getCategoriesForPreset(mode as PresetPackName);
    }

    // Run the walkthrough
    const prompt = await runPromptWalkthrough(categories, initialPrompt);

    // Display output
    displayOutput(prompt);

    // Show menu
    const menuResult = await showPostGenerationMenu(prompt);

    if (menuResult === 'done') {
      shouldContinue = false;
    }
    // If regenerate, loop continues
  }

  p.outro(pc.green('Happy prompting!'));
}

main().catch(console.error);
