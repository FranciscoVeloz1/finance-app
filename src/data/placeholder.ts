/**
 * Local stand-in for the finance read models.
 *
 * The UI specs (10–15) cover composition only; the API client and cache land in
 * the integration specs (16–20). This module exists so every visual state is
 * reachable today and is meant to be deleted once the real client is wired —
 * only `hooks/useFinanceData.ts` imports it.
 */
import type {
  Account,
  Category,
  Movement,
  PeriodSummary,
  PeriodId,
  RecurringRule,
  TimelineEntry,
} from '../types/finance';
import { currentPeriodId, shiftPeriod } from '../utils/dates';

/** Deterministic per period so navigating months does not shuffle the layout. */
function seedOf(periodId: PeriodId): number {
  return [...periodId].reduce((total, character) => {
    return total + character.charCodeAt(0);
  }, 0);
}

const ACCOUNTS: Account[] = [
  {
    id: 'acc-debit',
    label: 'Cuenta de nómina',
    type: 'debit',
    active: true,
    openingBalance: 18400,
    derivedBalance: 21350,
    includedInProjections: true,
  },
  {
    id: 'acc-cash',
    label: 'Efectivo',
    type: 'cash',
    active: true,
    openingBalance: 1250,
    derivedBalance: 3820,
    includedInProjections: true,
  },
  {
    id: 'acc-credit',
    label: 'Tarjeta principal',
    type: 'credit',
    active: true,
    openingBalance: 0,
    derivedBalance: -7480,
    includedInProjections: true,
    creditLimit: 45000,
    creditDebt: 7480,
    statementDay: 5,
    paymentDay: 24,
  },
  {
    id: 'acc-fund',
    label: 'Fondo de ahorro',
    type: 'savings-fund',
    active: true,
    openingBalance: 32000,
    derivedBalance: 36500,
    includedInProjections: true,
  },
  {
    id: 'acc-old',
    label: 'Cuenta anterior',
    type: 'other',
    active: false,
    openingBalance: 0,
    derivedBalance: 0,
    includedInProjections: false,
  },
];

function movementsFor(periodId: PeriodId): Movement[] {
  const month = periodId.slice(5);

  return [
    {
      id: `${periodId}-m1`,
      date: `${periodId}-03`,
      concept: 'Nómina quincenal',
      kind: 'income',
      status: 'realized',
      amount: 21500,
      accountId: 'acc-debit',
      accountLabel: 'Cuenta de nómina',
    },
    {
      id: `${periodId}-m2`,
      date: `${periodId}-04`,
      concept: 'Internet',
      kind: 'expense',
      status: 'realized',
      amount: 649,
      accountId: 'acc-debit',
      accountLabel: 'Cuenta de nómina',
      categoryId: 'services',
      categoryLabel: 'Servicios mensuales',
    },
    {
      id: `${periodId}-m3`,
      date: `${periodId}-05`,
      concept: 'Retiro para gastos del mes',
      kind: 'transfer',
      status: 'realized',
      amount: 6250,
      accountId: 'acc-debit',
      accountLabel: 'Cuenta de nómina',
    },
    {
      id: `${periodId}-m4`,
      date: `${periodId}-08`,
      concept: 'Mandado semana 1',
      kind: 'expense',
      status: 'realized',
      amount: 2140,
      accountId: 'acc-cash',
      accountLabel: 'Efectivo',
      categoryId: 'groceries',
      categoryLabel: 'Mandado',
      overridden: true,
    },
    {
      id: `${periodId}-m5`,
      date: `${periodId}-12`,
      concept: 'Cena de fin de semana',
      kind: 'expense',
      status: 'realized',
      amount: 780,
      accountId: 'acc-credit',
      accountLabel: 'Tarjeta principal',
      categoryId: 'outings',
      categoryLabel: 'Salidas',
    },
    {
      id: `${periodId}-m6`,
      date: `${periodId}-18`,
      concept: 'Mandado semana 3',
      kind: 'expense',
      status: 'planned',
      amount: 2000,
      accountId: 'acc-cash',
      accountLabel: 'Efectivo',
      categoryId: 'groceries',
      categoryLabel: 'Mandado',
    },
    {
      id: `${periodId}-m7`,
      date: `${periodId}-20`,
      concept: 'Suscripción cancelada',
      kind: 'expense',
      status: 'cancelled',
      amount: 199,
      accountId: 'acc-debit',
      accountLabel: 'Cuenta de nómina',
      categoryId: 'services',
      categoryLabel: 'Servicios mensuales',
    },
    {
      id: `${periodId}-m8`,
      date: `${periodId}-24`,
      concept: `Pago de tarjeta ${month}`,
      kind: 'credit-payment',
      status: 'planned',
      amount: 7480,
      accountId: 'acc-debit',
      accountLabel: 'Cuenta de nómina',
    },
  ];
}

export function buildPeriodSummary(periodId: PeriodId): PeriodSummary {
  const drift = seedOf(periodId) % 7;
  const movements = movementsFor(periodId);
  const expectedSavings = 8600 - drift * 350;

  return {
    periodId,
    expectedSavings,
    realSavings: expectedSavings - 1240,
    availableCash: 25170,
    income: { expected: 43000, real: 21500 },
    expense: { expected: 34400 + drift * 350, real: 16219 },
    categories: [
      {
        id: 'services',
        label: 'Servicios mensuales',
        planned: 4800,
        real: 3210,
        limit: 5200,
        remainingReal: 1990,
        remainingProjected: 400,
      },
      {
        id: 'groceries',
        label: 'Mandado',
        planned: 6000,
        real: 4140,
        limit: 6000,
        remainingReal: 1860,
        remainingProjected: -140,
      },
      {
        id: 'outings',
        label: 'Salidas',
        planned: 2000,
        real: 1780,
        limit: 2000,
        remainingReal: 220,
        remainingProjected: 220,
      },
      {
        id: 'extras',
        label: 'Extras',
        planned: 1400,
        real: 460,
        limit: 1400,
        remainingReal: 940,
        remainingProjected: null,
      },
    ],
    accounts: ACCOUNTS,
    credit: [
      {
        accountId: 'acc-credit',
        label: 'Tarjeta principal',
        limit: 45000,
        debt: 7480,
        used: 7480,
        available: 37520,
        availableProjected: 35100,
        purchases: movements.filter((movement) => {
          return movement.accountId === 'acc-credit';
        }),
        payments: movements.filter((movement) => {
          return movement.kind === 'credit-payment';
        }),
      },
    ],
    savingsFund: {
      accountId: 'acc-fund',
      label: 'Fondo de ahorro',
      accumulatedBalance: 36500,
      movements: [
        {
          id: `${periodId}-f1`,
          date: `${periodId}-06`,
          concept: 'Depósito mensual',
          kind: 'transfer',
          status: 'realized',
          amount: 4500,
          accountId: 'acc-fund',
          accountLabel: 'Fondo de ahorro',
        },
      ],
    },
    withdrawal: {
      amount: 6250,
      sourceAccountLabel: 'Cuenta de nómina',
      targetAccountLabel: 'Efectivo',
      coverage: drift > 4 ? 'insufficient' : 'sufficient',
      cashRemaining: 3820,
      overridden: drift > 4,
    },
    alerts:
      drift > 4
        ? [
            {
              id: 'alert-budget',
              level: 'warning',
              title: 'Mandado cerca del límite',
              detail: 'El consumo proyectado supera el presupuesto de la categoría.',
            },
            {
              id: 'alert-coverage',
              level: 'negative',
              title: 'Retiro insuficiente',
              detail: 'El efectivo retirado no cubre el consumo planeado del periodo.',
            },
          ]
        : [
            {
              id: 'alert-budget',
              level: 'warning',
              title: 'Mandado cerca del límite',
              detail: 'El consumo proyectado supera el presupuesto de la categoría.',
            },
          ],
    suggestions: [
      {
        id: 'sug-1',
        title: 'Ajusta el retiro de efectivo',
        explanation:
          'El consumo en efectivo de los últimos periodos quedó por debajo del retiro planeado.',
        origin: 'Comparación de retiro contra consumo de Mandado y Salidas.',
      },
      {
        id: 'sug-2',
        title: 'Revisa el presupuesto de Salidas',
        explanation: 'El gasto real superó al planeado en dos de los últimos tres periodos.',
        origin: 'Historial de la categoría Salidas.',
      },
    ],
  };
}

export function buildTimeline(reference: PeriodId = currentPeriodId()): TimelineEntry[] {
  return Array.from({ length: 7 }, (_unused, index) => {
    const periodId = shiftPeriod(reference, index - 4);
    const summary = buildPeriodSummary(periodId);

    return {
      periodId,
      expectedSavings: summary.expectedSavings,
      hasAlert: summary.alerts.some((alert) => {
        return alert.level !== 'info';
      }),
    };
  });
}

export function buildMovements(periodId: PeriodId): Movement[] {
  return movementsFor(periodId);
}

export const PLACEHOLDER_CATEGORIES: Category[] = [
  { id: 'cat-1', label: 'Internet', group: 'services', custom: false, active: true, usageCount: 12 },
  { id: 'cat-2', label: 'Luz', group: 'services', custom: false, active: true, usageCount: 12 },
  { id: 'cat-3', label: 'Streaming', group: 'services', custom: false, active: false, usageCount: 4 },
  { id: 'cat-4', label: 'Despensa', group: 'groceries', custom: false, active: true, usageCount: 36 },
  { id: 'cat-5', label: 'Restaurantes', group: 'outings', custom: false, active: true, usageCount: 18 },
  { id: 'cat-6', label: 'Regalos', group: 'extras', custom: true, active: true, usageCount: 3 },
  { id: 'cat-7', label: 'Mascota', group: 'extras', custom: true, active: true, usageCount: 7 },
];

export const PLACEHOLDER_RULES: RecurringRule[] = [
  {
    id: 'rule-1',
    label: 'Internet',
    group: 'services',
    kind: 'service',
    baseAmount: 649,
    effectiveFrom: '2026-01',
    paused: false,
  },
  {
    id: 'rule-2',
    label: 'Presupuesto base de Mandado',
    group: 'groceries',
    kind: 'base-budget',
    baseAmount: 2000,
    effectiveFrom: '2026-01',
    paused: false,
  },
  {
    id: 'rule-3',
    label: 'Retiro mensual de efectivo',
    group: 'groceries',
    kind: 'withdrawal',
    baseAmount: 6250,
    effectiveFrom: '2026-01',
    paused: false,
  },
  {
    id: 'rule-4',
    label: 'Streaming',
    group: 'services',
    kind: 'service',
    baseAmount: 199,
    effectiveFrom: '2026-03',
    paused: true,
  },
];

export const PLACEHOLDER_ACCOUNTS = ACCOUNTS;
