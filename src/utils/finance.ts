// Utilidades puras para cálculos financieros de TDC, MSI, Préstamos y Presupuesto Real en MXN
import type { AccountLocal, MsiPlanLocal, TdcMetrics } from '../types';

// Calcula las métricas financieras clave para una Tarjeta de Crédito (TDC)
export function calculateTdcMetrics(
  account: AccountLocal,
  msiPlans: MsiPlanLocal[]
): TdcMetrics {
  const creditLimit = account.credit_limit || 0;
  const currentBalance = account.current_balance || 0;

  // Suma del saldo retenido por compras activas a Meses Sin Intereses (MSI)
  const activeMsiPlans = msiPlans.filter(
    (plan) => plan.account_id === account.id && plan.remaining_installments > 0 && !plan.deleted_at
  );
  const msiReservedCredit = activeMsiPlans.reduce(
    (acc, plan) => acc + plan.monthly_installment * plan.remaining_installments,
    0
  );

  // Crédito total comprometido y disponible
  const totalCommittedCredit = currentBalance + msiReservedCredit;
  const availableCredit = Math.max(0, creditLimit - totalCommittedCredit);

  // Porcentaje de utilización sobre el límite asignado
  const utilizationPercentage = creditLimit > 0 ? (totalCommittedCredit / creditLimit) * 100 : 0;

  // Estado de alerta visual preventivo (<30% normal, 30%-50% warning, >50% critical)
  let utilizationStatus: 'normal' | 'warning' | 'critical' = 'normal';
  if (utilizationPercentage >= 50) {
    utilizationStatus = 'critical';
  } else if (utilizationPercentage >= 30) {
    utilizationStatus = 'warning';
  }

  // Suma mensualidades exigibles de MSI para el periodo actual
  const currentMsiMonthlySum = activeMsiPlans.reduce((acc, plan) => acc + plan.monthly_installment, 0);

  // Pago para no generar intereses = Saldo revolvente + Mensualidades MSI del ciclo
  const payToAvoidInterest = currentBalance + currentMsiMonthlySum;

  // Pago mínimo bancario estimado (aprox. 2.5% del saldo revolvente + mensualidades MSI)
  const minimumPayment = Math.max(200, currentBalance * 0.025) + currentMsiMonthlySum;

  return {
    currentBalance,
    creditLimit,
    availableCredit,
    msiReservedCredit,
    utilizationPercentage,
    utilizationStatus,
    payToAvoidInterest,
    minimumPayment,
  };
}

// Formateador estándar de moneda mexicana (MXN)
export function formatMXN(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Calcula el balance de solvencia neta líquida (Efectivo + Débito + Ahorro)
export function calculateNetLiquidSolvency(accounts: AccountLocal[]): number {
  return accounts
    .filter(
      (acc) =>
        ['debit', 'savings', 'cash'].includes(acc.type) && !acc.deleted_at
    )
    .reduce((sum, acc) => sum + acc.current_balance, 0);
}

// Calcula el presupuesto real disponible basado en ingresos recibidos menos compromisos fijos
export function calculateRealIncomeBudget(
  actualIncomes: number,
  msiTotalCommitments: number,
  loansCommitments: number,
  fixedExpenses: number
): {
  totalIncomes: number;
  totalFixedCommitments: number;
  netAvailableBudget: number;
  budgetStatus: 'healthy' | 'tight' | 'deficit';
} {
  const totalFixedCommitments = msiTotalCommitments + loansCommitments + fixedExpenses;
  const netAvailableBudget = actualIncomes - totalFixedCommitments;

  let budgetStatus: 'healthy' | 'tight' | 'deficit' = 'healthy';
  if (netAvailableBudget < 0) {
    budgetStatus = 'deficit';
  } else if (netAvailableBudget < actualIncomes * 0.2) {
    budgetStatus = 'tight';
  }

  return {
    totalIncomes: actualIncomes,
    totalFixedCommitments,
    netAvailableBudget,
    budgetStatus,
  };
}
