import { Decimal } from '@prisma/client/runtime/library';

export function decimalToNumber(value: Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  return Number(value.toString());
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export interface JobEconomics {
  revenue: number;
  laborCost: number;
  materialCost: number;
  margin: number;
  marginPercent: number;
}

export function computeJobEconomics(params: {
  items: Array<{ quantity: Decimal | number; unitPrice: Decimal | number }>;
  activities: Array<{ hours: Decimal | number; hourlyCost: Decimal | number }>;
  materialUsages: Array<{ quantity: Decimal | number; unitCost: Decimal | number }>;
}): JobEconomics {
  const revenue = params.items.reduce(
    (sum, item) => sum + decimalToNumber(item.quantity) * decimalToNumber(item.unitPrice),
    0,
  );
  const laborCost = params.activities.reduce(
    (sum, a) => sum + decimalToNumber(a.hours) * decimalToNumber(a.hourlyCost),
    0,
  );
  const materialCost = params.materialUsages.reduce(
    (sum, m) => sum + decimalToNumber(m.quantity) * decimalToNumber(m.unitCost),
    0,
  );
  const totalCost = laborCost + materialCost;
  const margin = revenue - totalCost;
  const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;

  return { revenue, laborCost, materialCost, margin, marginPercent };
}
