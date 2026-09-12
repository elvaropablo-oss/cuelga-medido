const positive = (value, label) => {
  const number = Number(String(value ?? '').replace(',', '.'));
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} debe ser mayor que 0.`);
  return number;
};

export const WALL_TYPES = Object.freeze({
  unknown: 'No sé qué pared tengo',
  solid: 'Hormigón o ladrillo macizo',
  hollowBrick: 'Ladrillo hueco o perforado',
  aeratedConcrete: 'Hormigón celular',
  plasterboardSingle: 'Placa de yeso 12,5 mm (simple)',
  plasterboardDouble: 'Doble placa de yeso 2 × 12,5 mm',
  fiberGypsum: 'Placa de fibra de yeso 12,5 mm'
});

export const DEFAULT_SAFETY_FACTOR = 1.5;
export const MAX_AUTOMATIC_WEIGHT_KG = 25;

export function anchorCountFromSeparation(value) {
  const separation = Number(String(value ?? '0').replace(',', '.'));
  return Number.isFinite(separation) && separation > 0 ? 2 : 1;
}

export function evaluateFixings(products, {
  wallType,
  weightKg,
  anchorCount = 1,
  safetyFactor = DEFAULT_SAFETY_FACTOR,
  maxAutomaticWeightKg = MAX_AUTOMATIC_WEIGHT_KG
} = {}) {
  if (!wallType || wallType === 'unknown') return { status: 'needs-wall', rows: [], designLoadKg: null };
  const weight = positive(weightKg, 'El peso');
  const points = Math.max(1, Math.round(positive(anchorCount, 'Los anclajes')));
  const factor = Math.max(1, positive(safetyFactor, 'El margen de seguridad'));
  const designLoadKg = weight * factor;

  if (weight > maxAutomaticWeightKg) {
    return { status: 'too-heavy', rows: [], designLoadKg, weightKg: weight, anchorCount: points };
  }

  const compatible = products.flatMap((product) => {
    const capacityKg = Number(product?.loads?.[wallType]);
    if (!(capacityKg > 0) || capacityKg < designLoadKg) return [];
    const packSize = Math.max(1, Math.round(Number(product.packSize) || 1));
    const packCount = Math.ceil(points / packSize);
    const projectCost = packCount * Number(product.price);
    if (!Number.isFinite(projectCost) || projectCost < 0) return [];

    const capacityRatio = capacityKg / designLoadKg;
    const capacityScore = Math.min(100, 70 + Math.max(0, capacityRatio - 1) * 30);
    const kitScore = product.readyToHang ? 100 : product.includesScrew ? 65 : 35;
    const dedicatedScore = product.dedicatedWallTypes?.includes(wallType) ? 100 : 70;
    const technicalScore = capacityScore * 0.60 + kitScore * 0.25 + dedicatedScore * 0.15;

    return [{
      ...product,
      purchase: { packCount, projectCost, anchorsAvailable: packCount * packSize, anchorsNeeded: points },
      capacityKg,
      designLoadKg,
      capacityRatio,
      technicalScore
    }];
  });

  if (!compatible.length) return { status: 'no-match', rows: [], designLoadKg, weightKg: weight, anchorCount: points };

  const minCost = Math.min(...compatible.map((row) => row.purchase.projectCost));
  const rows = compatible.map((row) => {
    const economicScore = row.purchase.projectCost === 0 ? 100 : (minCost / row.purchase.projectCost) * 100;
    const valueScore = economicScore * 0.40 + row.technicalScore * 0.60;
    return { ...row, economicScore, valueScore };
  }).sort((a, b) => b.valueScore - a.valueScore || a.purchase.projectCost - b.purchase.projectCost);

  return { status: 'ok', rows, designLoadKg, weightKg: weight, anchorCount: points };
}
