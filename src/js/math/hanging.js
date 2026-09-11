export function positive(value, label = 'El valor') {
  const number = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} debe ser mayor que cero.`);
  return number;
}

export function nonNegative(value, label = 'El valor') {
  const number = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(number) || number < 0) throw new Error(`${label} no puede ser negativo.`);
  return number;
}

export function hookPosition({ wallWidth, frameWidth, frameHeight, centerHeight, hangerDrop, hookSeparation = 0 }) {
  const wall = positive(wallWidth, 'El ancho de pared');
  const width = positive(frameWidth, 'El ancho del marco');
  const height = positive(frameHeight, 'El alto del marco');
  const centerY = positive(centerHeight, 'La altura del centro');
  const drop = nonNegative(hangerDrop, 'La distancia del anclaje');
  const separation = nonNegative(hookSeparation, 'La separación de anclajes');
  if (drop > height) throw new Error('La distancia del anclaje no puede superar el alto del marco.');
  if (separation >= width) throw new Error('La separación de anclajes debe ser menor que el ancho del marco.');
  const centerX = wall / 2;
  const top = centerY + height / 2;
  const bottom = centerY - height / 2;
  if (bottom < 0) throw new Error('El marco quedaría por debajo del suelo con esa altura de centro.');
  const hookHeight = top - drop;
  const hooks = separation > 0 ? [centerX - separation / 2, centerX + separation / 2] : [centerX];
  return { centerX, centerY, top, bottom, hookHeight, hooks, frameLeft: centerX - width / 2, frameRight: centerX + width / 2 };
}

export function rowLayout({ availableWidth, frameWidth, count, gap = 0, mode = 'compact' }) {
  const wall = positive(availableWidth, 'El ancho disponible');
  const width = positive(frameWidth, 'El ancho de cada marco');
  const qty = positive(count, 'La cantidad');
  if (!Number.isInteger(qty) || qty > 100) throw new Error('La cantidad debe ser un entero entre 1 y 100.');
  let spacing = nonNegative(gap, 'La separación');
  if (mode === 'balanced') spacing = (wall - qty * width) / (qty + 1);
  if (spacing < 0) throw new Error('Los marcos ocupan más que el ancho disponible.');
  const totalWidth = mode === 'balanced' ? wall - spacing * 2 : qty * width + (qty - 1) * spacing;
  if (totalWidth > wall + 1e-9) throw new Error('La fila no cabe en el ancho disponible.');
  const outerMargin = mode === 'balanced' ? spacing : (wall - totalWidth) / 2;
  const centers = Array.from({ length: qty }, (_, index) => outerMargin + width / 2 + index * (width + spacing));
  return { wall, width, count: qty, gap: spacing, totalWidth, outerMargin, centers, mode };
}

export function gridLayout({ wallWidth, wallHeight, frameWidth, frameHeight, columns, rows, gapX, gapY, centerHeight, hangerDrop }) {
  const wall = [positive(wallWidth, 'El ancho de pared'), positive(wallHeight, 'El alto de pared')];
  const frame = [positive(frameWidth, 'El ancho del marco'), positive(frameHeight, 'El alto del marco')];
  const cols = positive(columns, 'Las columnas');
  const rowCount = positive(rows, 'Las filas');
  if (!Number.isInteger(cols) || !Number.isInteger(rowCount) || cols > 20 || rowCount > 20) throw new Error('Filas y columnas deben ser enteros entre 1 y 20.');
  const gaps = [nonNegative(gapX, 'La separación horizontal'), nonNegative(gapY, 'La separación vertical')];
  const centerY = positive(centerHeight, 'La altura del centro del conjunto');
  const drop = nonNegative(hangerDrop, 'La distancia del anclaje');
  if (drop > frame[1]) throw new Error('La distancia del anclaje no puede superar el alto del marco.');
  const footprint = [cols * frame[0] + (cols - 1) * gaps[0], rowCount * frame[1] + (rowCount - 1) * gaps[1]];
  const left = (wall[0] - footprint[0]) / 2;
  const bottom = centerY - footprint[1] / 2;
  if (left < 0 || bottom < 0 || bottom + footprint[1] > wall[1]) throw new Error('La cuadrícula no cabe en la pared con ese centro y separaciones.');
  const positions = [];
  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < cols; column += 1) {
      const centerX = left + frame[0] / 2 + column * (frame[0] + gaps[0]);
      const frameCenterY = bottom + footprint[1] - frame[1] / 2 - row * (frame[1] + gaps[1]);
      positions.push({ number: positions.length + 1, row: row + 1, column: column + 1, centerX, centerY: frameCenterY, hookHeight: frameCenterY + frame[1] / 2 - drop });
    }
  }
  return { wall, frame, columns: cols, rows: rowCount, gaps, centerHeight: centerY, footprint, left, bottom, positions };
}
