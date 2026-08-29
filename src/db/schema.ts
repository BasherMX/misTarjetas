// Configuración del esquema de IndexedDB mediante Dexie.js
import Dexie, { type Table } from 'dexie';
import type {
  AccountLocal,
  CategoryLocal,
  MsiPlanLocal,
  TransactionLocal,
  ReconciliationLocal,
  BudgetLocal,
  LoanPaymentLocal,
} from '../types';

export class MisTarjetasDB extends Dexie {
  accounts!: Table<AccountLocal, string>;
  categories!: Table<CategoryLocal, string>;
  msi_plans!: Table<MsiPlanLocal, string>;
  transactions!: Table<TransactionLocal, string>;
  reconciliations!: Table<ReconciliationLocal, string>;
  budgets!: Table<BudgetLocal, string>;
  loan_payments!: Table<LoanPaymentLocal, string>;

  constructor() {
    super('MisTarjetasDB');
    
    this.version(3).stores({
      accounts: 'id, user_id, type, updated_at, sync_status',
      categories: 'id, user_id, type, parent_id, updated_at, sync_status',
      msi_plans: 'id, user_id, account_id, updated_at, sync_status',
      transactions: 'id, user_id, account_id, category_id, date, updated_at, sync_status',
      reconciliations: 'id, user_id, account_id, period, updated_at, sync_status',
      budgets: 'id, user_id, category_id, updated_at, sync_status',
      loan_payments: 'id, user_id, account_id, status, due_date, updated_at, sync_status',
    });
  }
}

export const db = new MisTarjetasDB();
