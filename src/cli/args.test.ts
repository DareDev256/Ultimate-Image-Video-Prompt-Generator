import { describe, test, expect } from 'bun:test';
import { parseArgs } from './args';

describe('parseArgs', () => {
  test('returns empty object for no arguments', () => {
    const result = parseArgs([]);
    expect(result).toEqual({});
  });

  // ─── Help & List ────────────────────────────────────────────────

  test('parses --help flag', () => {
    expect(parseArgs(['--help']).help).toBe(true);
  });

  test('parses -h shorthand', () => {
    expect(parseArgs(['-h']).help).toBe(true);
  });

  test('parses --list-templates flag', () => {
    expect(parseArgs(['--list-templates']).listTemplates).toBe(true);
  });

  test('parses -l shorthand', () => {
    expect(parseArgs(['-l']).listTemplates).toBe(true);
  });

  // ─── Template ───────────────────────────────────────────────────

  test('parses --template with value', () => {
    const result = parseArgs(['--template', 'cinematic']);
    expect(result.template).toBe('cinematic');
  });

  test('parses -t shorthand', () => {
    const result = parseArgs(['-t', 'street-photo']);
    expect(result.template).toBe('street-photo');
  });

  // ─── Load Preset ────────────────────────────────────────────────

  test('parses --load with value', () => {
    const result = parseArgs(['--load', 'my-saved']);
    expect(result.load).toBe('my-saved');
  });

  // ─── Pack Selection ─────────────────────────────────────────────

  test('parses --pack with comma-separated values', () => {
    const result = parseArgs(['--pack', 'camera,lighting,film']);
    expect(result.packs).toEqual(['camera', 'lighting', 'film']);
  });

  test('parses -p shorthand', () => {
    const result = parseArgs(['-p', 'atmosphere']);
    expect(result.packs).toEqual(['atmosphere']);
  });

  // ─── Preset Flags ───────────────────────────────────────────────

  test('parses --quick as preset', () => {
    expect(parseArgs(['--quick']).preset).toBe('quick');
  });

  test('parses --standard as preset', () => {
    expect(parseArgs(['--standard']).preset).toBe('standard');
  });

  test('parses --full as preset', () => {
    expect(parseArgs(['--full']).preset).toBe('full');
  });

  test('parses --fashion as preset', () => {
    expect(parseArgs(['--fashion']).preset).toBe('fashion');
  });

  test('parses --street as preset', () => {
    expect(parseArgs(['--street']).preset).toBe('street');
  });

  // ─── Analyze ────────────────────────────────────────────────────

  test('parses --analyze with image path', () => {
    const result = parseArgs(['--analyze', './photo.jpg']);
    expect(result.analyze).toBe('./photo.jpg');
  });

  test('parses -a shorthand', () => {
    const result = parseArgs(['-a', '/path/to/image.png']);
    expect(result.analyze).toBe('/path/to/image.png');
  });

  // ─── Favorites ──────────────────────────────────────────────────

  test('parses favorites list command', () => {
    const result = parseArgs(['favorites', 'list']);
    expect(result.favorites).toEqual({ action: 'list' });
  });

  test('parses favorites add command with field and value', () => {
    const result = parseArgs(['favorites', 'add', 'camera.position', 'through window']);
    expect(result.favorites).toEqual({
      action: 'add',
      field: 'camera.position',
      value: 'through window',
    });
  });

  test('parses favorites remove command with field', () => {
    const result = parseArgs(['favorites', 'remove', 'lighting']);
    expect(result.favorites).toEqual({
      action: 'remove',
      field: 'lighting',
    });
  });

  // ─── Combined Flags ─────────────────────────────────────────────

  test('handles multiple flags together', () => {
    const result = parseArgs(['-t', 'cinematic', '--full']);
    expect(result.template).toBe('cinematic');
    expect(result.preset).toBe('full');
  });

  test('last preset flag wins', () => {
    const result = parseArgs(['--quick', '--full']);
    expect(result.preset).toBe('full');
  });
});
