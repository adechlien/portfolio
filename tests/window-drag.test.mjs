import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/scripts/window-drag.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { constrainWindowPosition } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('keeps a dragged window inside all four viewport edges with its padding', () => {
  const size = { width: 600, height: 400 };
  const viewport = { width: 1440, height: 900 };
  assert.deepEqual(constrainWindowPosition({ x: -200, y: -100 }, size, viewport, 20), { x: 20, y: 20 });
  assert.deepEqual(constrainWindowPosition({ x: 2000, y: 1000 }, size, viewport, 20), { x: 820, y: 480 });
  assert.deepEqual(constrainWindowPosition({ x: 300, y: 200 }, size, viewport, 20), { x: 300, y: 200 });
});

test('repositions the window when switching to a narrower mobile viewport', () => {
  assert.deepEqual(constrainWindowPosition({ x: 800, y: 600 }, { width: 366, height: 404 }, { width: 390, height: 844 }, 12), { x: 12, y: 428 });
});

test('reduces padding when the viewport cannot accommodate both insets', () => {
  assert.deepEqual(constrainWindowPosition({ x: 80, y: 80 }, { width: 390, height: 844 }, { width: 390, height: 844 }, 12), { x: 0, y: 0 });
});
