/**
 * Code fences open with three or more backticks or tildes and close on a run
 * of the same character at least as long. What regresses: a `~~~` block read
 * as text; a tilde fence closed by backticks (or the reverse); a shorter run
 * closing a longer fence; a reference definition inside a tilde block resolved.
 */
import { describe, expect, test } from 'bun:test';
import { codeFenceCloseIndex, codeFenceOpen, markProtectedLines } from './markdown-structure';

describe('codeFenceOpen', () => {
  test('three or more backticks or tildes open a fence, with the info string after', () => {
    expect(codeFenceOpen('```ts')).toEqual({ char: '`', length: 3, info: 'ts' });
    expect(codeFenceOpen('  ~~~~ yaml title="x"')).toEqual({ char: '~', length: 4, info: 'yaml title="x"' });
    expect(codeFenceOpen('~~~')).toEqual({ char: '~', length: 3, info: '' });
  });

  test('two of either, or strikethrough text, is not a fence', () => {
    expect(codeFenceOpen('~~gone~~')).toBeNull();
    expect(codeFenceOpen('``')).toBeNull();
    expect(codeFenceOpen('text ~~~')).toBeNull();
  });
});

describe('codeFenceCloseIndex', () => {
  test('a tilde fence closes on tildes only: a backtick fence inside it is content', () => {
    const lines = ['~~~markdown', '```js', 'x', '```', '~~~', 'after'];
    expect(codeFenceCloseIndex(lines, 0)).toBe(4);
  });

  test('a backtick fence is not closed by tildes', () => {
    expect(codeFenceCloseIndex(['```', '~~~', '```'], 0)).toBe(2);
  });

  test('the close is at least as long as the open', () => {
    expect(codeFenceCloseIndex(['~~~~', '~~~', '~~~~~'], 0)).toBe(2);
  });
});

test('markProtectedLines protects a tilde block like a backtick one', () => {
  expect(markProtectedLines(['before', '~~~', '[ref]: https://example.com', '~~~', 'after'])).toEqual([false, true, true, true, false]);
});
