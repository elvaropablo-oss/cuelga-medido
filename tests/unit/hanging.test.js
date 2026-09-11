import test from 'node:test';
import assert from 'node:assert/strict';
import { gridLayout, hookPosition, rowLayout } from '../../src/js/math/hanging.js';

test('calcula el clavo desde el centro visual y la caída', () => {
  const result = hookPosition({ wallWidth: 300, frameWidth: 60, frameHeight: 80, centerHeight: 145, hangerDrop: 10 });
  assert.equal(result.hookHeight, 175);
  assert.deepEqual(result.hooks, [150]);
  assert.equal(result.frameLeft, 120);
});

test('coloca dos anclajes simétricos', () => {
  const result = hookPosition({ wallWidth: 300, frameWidth: 60, frameHeight: 80, centerHeight: 145, hangerDrop: 10, hookSeparation: 40 });
  assert.deepEqual(result.hooks, [130, 170]);
});

test('centra una fila compacta con separación fija', () => {
  const result = rowLayout({ availableWidth: 300, frameWidth: 40, count: 3, gap: 10 });
  assert.equal(result.totalWidth, 140);
  assert.equal(result.outerMargin, 80);
  assert.deepEqual(result.centers, [100, 150, 200]);
});

test('reparte el mismo hueco en bordes e interiores', () => {
  const result = rowLayout({ availableWidth: 300, frameWidth: 40, count: 3, mode: 'balanced' });
  assert.equal(result.gap, 45);
  assert.deepEqual(result.centers, [65, 150, 235]);
});

test('genera posiciones de una cuadrícula desde suelo e izquierda', () => {
  const result = gridLayout({ wallWidth: 300, wallHeight: 240, frameWidth: 40, frameHeight: 50, columns: 3, rows: 2, gapX: 10, gapY: 10, centerHeight: 140, hangerDrop: 5 });
  assert.deepEqual(result.footprint, [140, 110]);
  assert.equal(result.positions.length, 6);
  assert.deepEqual(result.positions[0], { number: 1, row: 1, column: 1, centerX: 100, centerY: 170, hookHeight: 190 });
  assert.deepEqual(result.positions[5], { number: 6, row: 2, column: 3, centerX: 200, centerY: 110, hookHeight: 130 });
});

test('rechaza diseños que no caben', () => {
  assert.throws(() => rowLayout({ availableWidth: 100, frameWidth: 40, count: 3, gap: 10 }), /no cabe/);
  assert.throws(() => gridLayout({ wallWidth: 100, wallHeight: 100, frameWidth: 60, frameHeight: 60, columns: 2, rows: 2, gapX: 10, gapY: 10, centerHeight: 50, hangerDrop: 5 }), /no cabe/);
});
