import * as p from '@clack/prompts';
import pc from 'picocolors';
import { categoryMap, type CategoryDefinition, type FieldDefinition } from '../core/categories';
import { getFavoritesForField, addFavorite } from '../storage/favorites';
import { getNestedValue, setNestedValue } from '../lib/nested';
import type { ImagePrompt } from '../types';

/** Cancel the current operation and exit. Narrows cancelled prompts in one place. */
function exitIfCancelled<T>(value: T | symbol): asserts value is T {
  if (p.isCancel(value)) {
    p.cancel('Cancelled');
    process.exit(0);
  }
}

export async function promptForField(
  field: FieldDefinition,
  currentValue?: string
): Promise<string | undefined> {
  const favorites = getFavoritesForField(field.key);
  const defaultValue = currentValue || field.placeholder || '';

  // Build hint showing favorites if any
  let hint = '';
  if (favorites.length > 0) {
    hint = pc.dim(` (type ? for favorites)`);
  }

  const result = await p.text({
    message: `${field.label}${hint}`,
    placeholder: defaultValue,
    defaultValue: defaultValue,
  });

  exitIfCancelled(result);

  // Handle ? for favorites
  if (result === '?') {
    return await showFavoritesAndSuggestions(field, currentValue);
  }

  // Handle skip
  if (result === 'skip' || result === '') {
    return currentValue || undefined;
  }

  // Auto-add frequently used values to favorites
  if (result && result !== defaultValue) {
    addFavorite(field.key, result);
  }

  return result || undefined;
}

async function showFavoritesAndSuggestions(
  field: FieldDefinition,
  currentValue?: string
): Promise<string | undefined> {
  const favorites = getFavoritesForField(field.key);
  const suggestions = field.suggestions || [];

  const options: { value: string; label: string; hint?: string }[] = [];

  // Add favorites first
  if (favorites.length > 0) {
    for (const fav of favorites) {
      options.push({
        value: fav,
        label: `★ ${fav}`,
        hint: 'favorite'
      });
    }
  }

  // Add suggestions (excluding any that are already favorites)
  for (const sug of suggestions) {
    if (!favorites.includes(sug)) {
      options.push({
        value: sug,
        label: sug
      });
    }
  }

  // Add custom option
  options.push({
    value: '__custom__',
    label: 'Enter custom value...'
  });

  const selected = await p.select({
    message: `${field.label} - Choose or enter custom:`,
    options
  });

  exitIfCancelled(selected);

  if (selected === '__custom__') {
    return await promptForField(field, currentValue);
  }

  return selected as string;
}

async function promptForVibes(
  field: FieldDefinition,
  currentValue?: string[]
): Promise<string[] | undefined> {
  const favorites = getFavoritesForField(field.key);
  const suggestions = field.suggestions || [];

  const allOptions = [...new Set([...favorites, ...suggestions])];

  const selected = await p.multiselect({
    message: `${field.label} (select multiple with space, enter when done)`,
    options: allOptions.map(opt => ({
      value: opt,
      label: favorites.includes(opt) ? `★ ${opt}` : opt
    })),
    initialValues: currentValue || [],
    required: false
  });

  exitIfCancelled(selected);

  // Allow adding custom vibe
  const addCustom = await p.confirm({
    message: 'Add a custom vibe?',
    initialValue: false
  });

  exitIfCancelled(addCustom);

  let result = selected as string[];

  if (addCustom) {
    const custom = await p.text({
      message: 'Enter custom vibe:',
      placeholder: 'Artist or style reference'
    });

    if (!p.isCancel(custom) && custom) {
      result = [...result, custom];
      addFavorite(field.key, custom);
    }
  }

  return result.length > 0 ? result : undefined;
}

export async function promptForCategory(
  category: CategoryDefinition,
  currentPrompt: Partial<ImagePrompt>
): Promise<void> {
  p.log.step(pc.cyan(`${category.emoji} ${category.name.toUpperCase()}`));

  for (const field of category.fields) {
    const currentValue = getNestedValue(currentPrompt as Record<string, unknown>, field.key);

    // Special handling for vibes (array field)
    if (field.key === 'vibes') {
      const value = await promptForVibes(field, currentValue as string[] | undefined);
      if (value !== undefined) {
        setNestedValue(currentPrompt as Record<string, unknown>, field.key, value);
      }
    } else {
      const value = await promptForField(field, currentValue as string | undefined);
      if (value !== undefined) {
        setNestedValue(currentPrompt as Record<string, unknown>, field.key, value);
      }
    }
  }
}

export async function askToRefineCategory(categoryName: string): Promise<boolean> {
  const category = categoryMap.get(categoryName);
  if (!category) return false;

  const refine = await p.confirm({
    message: `Refine ${category.name} details?`,
    initialValue: false
  });

  exitIfCancelled(refine);

  return refine;
}

export async function runPromptWalkthrough(
  categoriesToShow: string[],
  initialPrompt: Partial<ImagePrompt> = {}
): Promise<ImagePrompt> {
  const prompt: Partial<ImagePrompt> = {
    prompt_type: 'generate',
    ...initialPrompt
  };

  for (const catName of categoriesToShow) {
    const category = categoryMap.get(catName);
    if (!category) continue;

    await promptForCategory(category, prompt);
  }

  return prompt as ImagePrompt;
}
