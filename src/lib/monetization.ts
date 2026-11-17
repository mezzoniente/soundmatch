import type { SubscriptionPlan } from '../data/mockData';

/** Limite de swipes por dia no plano gratuito. `Infinity` no plano pago. */
export const FREE_DAILY_SWIPES = 20;

/** Taxa de comissão da plataforma sobre sessões remuneradas (10%). */
export const PLATFORM_COMMISSION_RATE = 0.1;

/** Benefícios de cada plano, usados na UI do paywall. */
export interface PlanBenefits {
  dailySwipes: number;
  unlimitedRecommendations: boolean;
  featuredInFeed: boolean;
  accessPaidGigs: boolean;
}

export const PLAN_BENEFITS: Record<SubscriptionPlan, PlanBenefits> = {
  free: {
    dailySwipes: FREE_DAILY_SWIPES,
    unlimitedRecommendations: false,
    featuredInFeed: false,
    accessPaidGigs: false,
  },
  pro: {
    dailySwipes: Infinity,
    unlimitedRecommendations: true,
    featuredInFeed: true,
    accessPaidGigs: true,
  },
};

/** Retorna o limite diário de swipes para um plano. */
export function dailySwipeLimit(plan: SubscriptionPlan): number {
  return PLAN_BENEFITS[plan].dailySwipes;
}

/** Indica se o usuário ainda pode dar swipe hoje. */
export function canSwipe(plan: SubscriptionPlan, swipesToday: number): boolean {
  return swipesToday < dailySwipeLimit(plan);
}

/** Calcula a comissão da plataforma (em centavos) sobre um valor bruto. */
export function commissionCents(amountCents: number): number {
  return Math.round(amountCents * PLATFORM_COMMISSION_RATE);
}

/** Formata centavos como moeda BRL. */
export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
