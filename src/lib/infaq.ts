export const INFAQ_MONTHS = [1, 6, 12] as const;

export type InfaqMonths = (typeof INFAQ_MONTHS)[number];

export type InfaqPackage = {
  months: InfaqMonths;
  monthlyRate: number;
  price: number;
  savings: number;
};

const TIER_MONTHLY_RATES: Record<InfaqMonths, number | null> = {
  1: null,
  6: 45000,
  12: 35000,
};

export function isInfaqMonths(value: number | null | undefined): value is InfaqMonths {
  return value === 1 || value === 6 || value === 12;
}

export function getInfaqPackage(baseMonthly: number, months: InfaqMonths): InfaqPackage {
  const tier = TIER_MONTHLY_RATES[months];
  // Jangan sampai tarif paket lebih mahal dari tarif bulanan dasar.
  const monthlyRate = tier === null ? baseMonthly : Math.min(tier, baseMonthly);
  const price = monthlyRate * months;
  return { months, monthlyRate, price, savings: baseMonthly * months - price };
}

export function listInfaqPackages(baseMonthly: number): InfaqPackage[] {
  return INFAQ_MONTHS.map((months) => getInfaqPackage(baseMonthly, months));
}
