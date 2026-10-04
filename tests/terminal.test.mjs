import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/data/terminal.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { parseEmailCommand, parsePaletteCommand, formatSkillsTree, getCommandSuggestion } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('parses quoted names, reordered flags and escaped quotes', () => {
  assert.deepEqual(parseEmailCommand('email -m "Let us build a \\"great\\" site" -e "hello@example.com" -n "Jane Doe"'), {
    name: 'Jane Doe', email: 'hello@example.com', message: 'Let us build a "great" site',
  });
});

test('supports unquoted values containing spaces and apostrophes inside quotes', () => {
  assert.deepEqual(parseEmailCommand('email -n Jane Doe -e jane@example.com -m "Let\'s work together"'), {
    name: 'Jane Doe', email: 'jane@example.com', message: "Let's work together",
  });
});

test('rejects missing, duplicate, malformed and unsupported fields', () => {
  for (const command of [
    'email -n Jane -e invalid -m Hi',
    'email -n Jane -e jane@example.com',
    'email -n "" -e jane@example.com -m Hi',
    'email -n Jane -e jane@example.com -m "  "',
    'email -n Jane -n John -e jane@example.com -m Hi',
    'email -n "Jane -e jane@example.com -m Hi',
    'email -x Jane -e jane@example.com -m Hi',
    'email Jane -e jane@example.com -m Hi',
  ]) assert.equal(parseEmailCommand(command), null, command);
});


test('prints branches on separate lines with correct final-group indentation', () => {
  assert.equal(formatSkillsTree([
    { title: 'UX/UI', items: [{ label: 'Figma' }] },
    { title: 'DevOps', items: [{ label: 'Docker' }, { label: 'Git' }] },
  ]), 'skills\n├── UX/UI\n│   └── Figma\n└── DevOps\n    ├── Docker\n    └── Git');
});

test('predicts command suffixes, multiword commands and project names', () => {
  assert.equal(getCommandSuggestion('he', []), 'lp');
  assert.equal(getCommandSuggestion('enable ', []), 'interface');
  assert.equal(getCommandSuggestion('visit a', ['Blog', 'Adech', 'Niki']), 'dech');
  assert.equal(getCommandSuggestion('WHO', []), 'is');
  assert.equal(getCommandSuggestion('email', []), ' -n "" -e "" -m ""');
});

test('does not suggest for empty, complete, unsupported or personal email input', () => {
  for (const value of ['', ' ', 'help', 'bogus', 'email -n "Jane"']) {
    assert.equal(getCommandSuggestion(value, ['Adech']), '', value);
  }
});

test('accepts supported palette selections and rejects unknown palettes or invalid flags', () => {
  assert.equal(parsePaletteCommand('palettes -e superior')?.name, 'Adech Superior');
  assert.equal(parsePaletteCommand('  PALETTES   -e SUPERIOR  ')?.id, 'superior');
  for (const command of ['palettes', 'palettes -e', 'palettes -e unknown', 'palettes -x superior', 'palettes -e superior extra', 'palettes -e superior -e superior']) {
    assert.equal(parsePaletteCommand(command), null);
  }
});

test('predicts palette commands and supported palette names', () => {
  assert.equal(getCommandSuggestion('pal', []), 'ettes');
  assert.equal(getCommandSuggestion('palettes -e ', []), 'superior');
  assert.equal(getCommandSuggestion('palettes -e su', []), 'perior');
  assert.equal(getCommandSuggestion('palettes -e unknown', []), '');
});
