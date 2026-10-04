import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/scripts/terminal-history.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { restoreTerminalHistory, readTerminalHistory, saveTerminalHistory, terminalHistoryKey } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('round-trips ordered commands and their results, including errors and project links', () => {
  const entries = [
    { command: 'help', results: [{ type: 'template', name: 'help' }] },
    { command: 'palettes', results: [{ type: 'template', name: 'palettes' }] },
    { command: 'visit Adech', results: [{ type: 'project', name: 'Adech' }] },
    { command: '<script>bad()</script>', results: [{ type: 'text', message: 'Unsupported command', error: true }] },
    { command: 'enable interface', results: [{ type: 'text', message: 'Opening interface…', error: false }] },
  ];
  assert.deepEqual(restoreTerminalHistory(JSON.stringify(entries)), entries);
});

test('restores interrupted email as an unconfirmed result without retrying delivery', () => {
  const entries = [{ command: 'email -n Jane -e jane@example.com -m Hello', results: [{ type: 'text', message: 'Sending…', error: false, pending: true }] }];
  const restored = restoreTerminalHistory(JSON.stringify(entries));
  assert.equal(restored[0].command, entries[0].command);
  assert.equal(restored[0].results[0].error, true);
  assert.match(restored[0].results[0].message, /not been resent/);
  assert.equal(restored[0].results[0].pending, undefined);
});

test('rejects malformed saved data and unknown output types', () => {
  for (const serialized of [null, '{', '{}', '[null]', '[{"command":"help","results":[null]}]', '[{"command":"help","results":[{"type":"template","name":"arbitrary"}]}]', '[{"command":"help","results":[{"type":"html","message":"<script>"}]}]']) {
    assert.deepEqual(restoreTerminalHistory(serialized), []);
  }
});

test('persists across reads and removes saved commands when cleared', () => {
  const data = new Map();
  globalThis.window = { localStorage: {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key),
  } };
  const entries = [{ command: 'skills', results: [{ type: 'template', name: 'skills' }] }];
  saveTerminalHistory(entries);
  assert.deepEqual(readTerminalHistory(), entries);
  saveTerminalHistory([]);
  assert.equal(data.has(terminalHistoryKey), false);
  assert.deepEqual(readTerminalHistory(), []);
  delete globalThis.window;
});

test('unavailable browser storage does not prevent using the terminal', () => {
  globalThis.window = { get localStorage() { throw new Error('Storage disabled'); } };
  assert.deepEqual(readTerminalHistory(), []);
  assert.doesNotThrow(() => saveTerminalHistory([{ command: 'help', results: [] }]));
  assert.doesNotThrow(() => saveTerminalHistory([]));
  delete globalThis.window;
});
