// Tipos principales para el sistema de finanzas personales Mis Tarjetas

export type SyncStatus = 'synced' | 'created' | 'updated' | 'deleted';
export type AccountType = 'credit_card' | 'debit' | 'savings' | 'cash' | 'loan';
export type CardBrand = 'visa' | 'mastercard' | 'amex';
export type LoanFrequency = 'semanal' | 'quincenal' | 'mensual';
export type TransactionType = 'income' | 'expense' | 'transfer' | 'msi_monthly_charge';

export interface LocalBaseModel {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  sync_status: SyncStatus;
}

export interface AccountLocal extends LocalBaseModel {
  name: string;
  type: AccountType;
  institution?: string;
  color_hex?: string;
  card_brand?: CardBrand;
  current_balance: number; // Saldo deudor o saldo disponible
  credit_limit?: number;
  cutoff_day?: number;
  payment_due_day?: number;
  interest_rate_cat?: number;
  
  // Campos extendidos para Préstamos Personales
  total_loan_amount?: number; // Monto total original del préstamo
  total_installments?: number; // Número total de pagos contratados
  remaining_installments?: number; // Pagos pendientes
  loan_frequency?: LoanFrequency; // Frecuencia: semanal, quincenal, mensual
  loan_installment_amount?: number; // Monto exacto de cada cuota
  loan_next_payment_date?: string; // Próxima fecha límite de pago
}

export interface LoanPaymentLocal extends LocalBaseModel {
  account_id: string;
  installment_number: number;
  due_date: string;
  amount: number;
  status: 'pending' | 'paid';
  paid_date?: string | null;
}

export interface CategoryLocal extends LocalBaseModel {
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color_hex?: string;
  parent_id?: string | null;
}

export interface MsiPlanLocal extends LocalBaseModel {
  account_id: string;
  description: string;
  total_amount: number;
  total_installments: number;
  remaining_installments: number;
  monthly_installment: number;
  purchase_date: string;
  first_cutoff_date: string;
}

export interface TransactionLocal extends LocalBaseModel {
  account_id: string;
  category_id?: string | null;
  msi_plan_id?: string | null;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  is_reconciled: boolean;
}

export interface ReconciliationLocal extends LocalBaseModel {
  account_id: string;
  period: string;
  bank_statement_balance: number;
  app_calculated_balance: number;
  difference: number;
  is_balanced: boolean;
  notes?: string;
}

export interface BudgetLocal extends LocalBaseModel {
  category_id: string;
  monthly_limit: number;
}

export interface TdcMetrics {
  currentBalance: number;
  creditLimit: number;
  availableCredit: number;
  msiReservedCredit: number;
  utilizationPercentage: number;
  utilizationStatus: 'normal' | 'warning' | 'critical';
  payToAvoidInterest: number;
  minimumPayment: number;
}

export interface UpcomingPaymentAlert {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  dueDate: string;
  daysRemaining: number;
  type: 'tdc' | 'loan';
}
