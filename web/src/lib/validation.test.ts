import { describe, expect, test } from 'bun:test';
import { validatePrompt, validateApiKey } from './validation';

describe('validatePrompt', () => {
  test('accepts a normal prompt string', () => {
    const result = validatePrompt('A portrait of a woman in golden light');
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.sanitized).toBe('A portrait of a woman in golden light');
  });

  test('trims whitespace from valid prompt', () => {
    const result = validatePrompt('  spaced out  ');
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.sanitized).toBe('spaced out');
  });

  test('rejects null', () => {
    const result = validatePrompt(null);
    expect(result.valid).toBe(false);
  });

  test('rejects undefined', () => {
    const result = validatePrompt(undefined);
    expect(result.valid).toBe(false);
  });

  test('rejects number', () => {
    const result = validatePrompt(42);
    expect(result.valid).toBe(false);
  });

  test('rejects empty string', () => {
    const result = validatePrompt('');
    expect(result.valid).toBe(false);
  });

  test('rejects whitespace-only string', () => {
    const result = validatePrompt('   \t\n  ');
    expect(result.valid).toBe(false);
  });

  test('rejects prompt exceeding 10,000 characters', () => {
    const long = 'x'.repeat(10_001);
    const result = validatePrompt(long);
    expect(result.valid).toBe(false);
  });

  test('accepts prompt at exactly 10,000 characters', () => {
    const exact = 'x'.repeat(10_000);
    const result = validatePrompt(exact);
    expect(result.valid).toBe(true);
  });

  test('strips C0 control characters (null byte, bell, etc.)', () => {
    const result = validatePrompt('hello\x00world\x07!');
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.sanitized).toBe('helloworld!');
  });

  test('preserves newlines and tabs', () => {
    const result = validatePrompt('line1\nline2\ttab');
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.sanitized).toBe('line1\nline2\ttab');
  });

  test('strips C1 control characters (0x80-0x9F range)', () => {
    const result = validatePrompt('test\x85value\x8D');
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.sanitized).toBe('testvalue');
  });

  test('preserves unicode (emoji, CJK, Arabic)', () => {
    const result = validatePrompt('🎬 映画 الفيلم');
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.sanitized).toBe('🎬 映画 الفيلم');
  });

  test('rejects boolean', () => {
    const result = validatePrompt(true);
    expect(result.valid).toBe(false);
  });

  test('rejects object', () => {
    const result = validatePrompt({ text: 'hi' });
    expect(result.valid).toBe(false);
  });

  test('rejects array', () => {
    const result = validatePrompt(['a prompt']);
    expect(result.valid).toBe(false);
  });
});

describe('validateApiKey', () => {
  test('accepts a standard API key', () => {
    const result = validateApiKey('AIzaSyD-abc123_XYZ');
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.key).toBe('AIzaSyD-abc123_XYZ');
  });

  test('accepts key with dots and colons', () => {
    const result = validateApiKey('sk.live:key-123');
    expect(result.valid).toBe(true);
  });

  test('accepts key with slashes (JWT-style)', () => {
    const result = validateApiKey('abc/def+ghi=jkl');
    expect(result.valid).toBe(true);
  });

  test('trims whitespace from key', () => {
    const result = validateApiKey('  my-key  ');
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.key).toBe('my-key');
  });

  test('rejects null', () => {
    expect(validateApiKey(null).valid).toBe(false);
  });

  test('rejects undefined', () => {
    expect(validateApiKey(undefined).valid).toBe(false);
  });

  test('rejects empty string', () => {
    expect(validateApiKey('').valid).toBe(false);
  });

  test('rejects whitespace-only string', () => {
    expect(validateApiKey('   ').valid).toBe(false);
  });

  test('rejects key exceeding 256 characters', () => {
    expect(validateApiKey('a'.repeat(257)).valid).toBe(false);
  });

  test('accepts key at exactly 256 characters', () => {
    expect(validateApiKey('a'.repeat(256)).valid).toBe(true);
  });

  test('rejects key with spaces (injection risk)', () => {
    expect(validateApiKey('key with spaces').valid).toBe(false);
  });

  test('rejects key with special characters (semicolons, quotes)', () => {
    expect(validateApiKey('key;DROP TABLE').valid).toBe(false);
    expect(validateApiKey("key'OR'1").valid).toBe(false);
    expect(validateApiKey('key"value').valid).toBe(false);
  });

  test('rejects key with angle brackets (XSS attempt)', () => {
    expect(validateApiKey('<script>alert(1)</script>').valid).toBe(false);
  });

  test('rejects key with newlines (header injection)', () => {
    expect(validateApiKey('key\nX-Injected: true').valid).toBe(false);
  });

  test('rejects number type', () => {
    expect(validateApiKey(12345).valid).toBe(false);
  });
});
