import mapping from '../../data/portfolio/use-cases.json';
import type {PortfolioData, Sku} from './portfolio-facts';

export const useCaseSource = mapping;
export const readinessLabels = ['Design', 'Shuttle', 'Datasheet', 'Unit cost', 'Approval funded', 'Plan line'];
export type UseCase = typeof mapping.cases[number] & {
  chip: Sku; approval: PortfolioData['approvals'][number]; costed?: PortfolioData['unitCost'][number];
  funded: boolean; criteria: number[]; score: number;
};

/** Six equally weighted document-coverage criteria, 0 missing, 1 partial, 2 documented. Not a qualification score. */
export function useCases(d: PortfolioData): UseCase[] {
  return mapping.cases.flatMap(c => {
    const chip = d.skus.find(s => s.sku === c.sku), approval = d.approvals.find(a => a.market === c.market);
    if (!chip || !approval) return [];
    const costed = d.unitCost.find(u => u.chip === c.cost);
    const funded = d.tranche.some(t => t.cr > 0 && /approval/i.test(t.use) &&
      (c.sku === 'SKU-6' ? /SKU-6/i.test(t.delivers) : c.sku === 'SKU-2' && /meter certification/i.test(t.delivers)));
    const design = /RTL.*analog/i.test(chip.readiness) ? 2 : /RTL/i.test(chip.readiness) ? 1 : 0;
    const criteria = [design, chip.shuttle ? 2 : 0, c.datasheet ? 2 : 0, costed ? 2 : 0, funded ? 2 : 0, chip.planCr != null ? 2 : 0];
    return [{...c, chip, approval, costed, funded, criteria, score: criteria.reduce((a, n) => a + n, 0)}];
  });
}
