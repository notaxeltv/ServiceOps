import { computeJobEconomics } from './economics.util';

describe('computeJobEconomics', () => {
  it('calculates revenue, costs and margin', () => {
    const result = computeJobEconomics({
      items: [{ quantity: 2, unitPrice: 100 }],
      activities: [{ hours: 3, hourlyCost: 25 }],
      materialUsages: [{ quantity: 4, unitCost: 10 }],
    });

    expect(result.revenue).toBe(200);
    expect(result.laborCost).toBe(75);
    expect(result.materialCost).toBe(40);
    expect(result.margin).toBe(85);
    expect(result.marginPercent).toBe(42.5);
  });

  it('handles zero revenue', () => {
    const result = computeJobEconomics({
      items: [],
      activities: [{ hours: 1, hourlyCost: 20 }],
      materialUsages: [],
    });
    expect(result.revenue).toBe(0);
    expect(result.marginPercent).toBe(0);
  });
});
