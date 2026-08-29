// Módulo de Sembrado Denso y Rico de Datos Ficticios (Enero 2026 a Agosto 2026)
import { db } from './schema';
import type { AccountLocal, TransactionLocal } from '../types';

export const seedRealisticDemoData = async () => {
  // 1. Limpiar todas las tablas
  await db.accounts.clear();
  await db.categories.clear();
  await db.transactions.clear();
  await db.msi_plans.clear();
  await db.loan_payments.clear();
  await db.budgets.clear();

  const now = new Date().toISOString();
  const userId = 'user-mis-tarjetas';

  // 2. Sembrar Categorías Base (Ingresos y Gastos)
  const categoriesData: { id: string; name: string; type: 'income' | 'expense'; icon: string; color: string }[] = [
    { id: 'cat-sueldo', name: 'Sueldo', type: 'income', icon: 'briefcase', color: '#10b981' },
    { id: 'cat-bono', name: 'Bono', type: 'income', icon: 'gift', color: '#059669' },
    { id: 'cat-servicios', name: 'Servicios', type: 'expense', icon: 'zap', color: '#10b981' },
    { id: 'cat-transporte', name: 'Transporte', type: 'expense', icon: 'car', color: '#eab308' },
    { id: 'cat-comida', name: 'Comida', type: 'expense', icon: 'utensils', color: '#3b82f6' },
    { id: 'cat-salidas', name: 'Salidas', type: 'expense', icon: 'party-popper', color: '#ec4899' },
    { id: 'cat-compras', name: 'Compras por internet', type: 'expense', icon: 'shopping-bag', color: '#a855f7' },
    { id: 'cat-impuestos', name: 'Impuestos', type: 'expense', icon: 'landmark', color: '#ef4444' },
    { id: 'cat-educacion', name: 'Educación', type: 'expense', icon: 'graduation-cap', color: '#06b6d4' },
    { id: 'cat-salud', name: 'Salud', type: 'expense', icon: 'heart-pulse', color: '#f97316' },
  ];

  for (const c of categoriesData) {
    await db.categories.add({
      id: c.id,
      user_id: userId,
      name: c.name,
      type: c.type,
      icon: c.icon,
      color_hex: c.color,
      created_at: now,
      updated_at: now,
      sync_status: 'created',
    });
  }

  // 3. Crear Cuentas: 3 Tarjetas de Crédito, 2 Cuentas Débito/Ahorro, 1 Préstamo
  const accBanamex: AccountLocal = {
    id: 'acc-tdc-banamex',
    user_id: userId,
    name: 'Banamex Clásica',
    type: 'credit_card',
    institution: 'Banamex',
    color_hex: '#1e3a8a',
    card_brand: 'visa',
    current_balance: 18450.0,
    credit_limit: 50000.0,
    cutoff_day: 15,
    payment_due_day: 5,
    interest_rate_cat: 48,
    created_at: now,
    updated_at: now,
    sync_status: 'created',
  };

  const accBbvaOro: AccountLocal = {
    id: 'acc-tdc-bbva',
    user_id: userId,
    name: 'BBVA Oro',
    type: 'credit_card',
    institution: 'BBVA',
    color_hex: '#881337',
    card_brand: 'mastercard',
    current_balance: 29800.0,
    credit_limit: 80000.0,
    cutoff_day: 20,
    payment_due_day: 10,
    interest_rate_cat: 42,
    created_at: now,
    updated_at: now,
    sync_status: 'created',
  };

  const accAmex: AccountLocal = {
    id: 'acc-tdc-amex',
    user_id: userId,
    name: 'American Express Platinum',
    type: 'credit_card',
    institution: 'American Express',
    color_hex: '#0f172a',
    card_brand: 'amex',
    current_balance: 41200.0,
    credit_limit: 120000.0,
    cutoff_day: 12,
    payment_due_day: 2,
    interest_rate_cat: 35,
    created_at: now,
    updated_at: now,
    sync_status: 'created',
  };

  const accDebito: AccountLocal = {
    id: 'acc-debito-bbva',
    user_id: userId,
    name: 'BBVA Débito Nómina',
    type: 'debit',
    institution: 'BBVA',
    color_hex: '#064e3b',
    current_balance: 54200.0,
    created_at: now,
    updated_at: now,
    sync_status: 'created',
  };

  const accAhorro: AccountLocal = {
    id: 'acc-ahorro-banorte',
    user_id: userId,
    name: 'Fondo de Reserva Ahorro',
    type: 'savings',
    institution: 'Banorte',
    color_hex: '#78350f',
    current_balance: 92000.0,
    created_at: now,
    updated_at: now,
    sync_status: 'created',
  };

  const accPrestamo: AccountLocal = {
    id: 'acc-prestamo-auto',
    user_id: userId,
    name: 'Préstamo Auto Santander',
    type: 'loan',
    institution: 'Santander',
    color_hex: '#581c87',
    current_balance: 93600.0,
    total_loan_amount: 150000.0,
    total_installments: 24,
    remaining_installments: 18,
    loan_frequency: 'mensual',
    loan_installment_amount: 5200.0,
    loan_next_payment_date: '2026-09-05',
    created_at: now,
    updated_at: now,
    sync_status: 'created',
  };

  await db.accounts.bulkAdd([accBanamex, accBbvaOro, accAmex, accDebito, accAhorro, accPrestamo]);

  // 4. Crear Plan MSI en TDC BBVA Oro
  await db.msi_plans.add({
    id: 'msi-laptop-apple',
    user_id: userId,
    account_id: 'acc-tdc-bbva',
    description: 'Laptop Mac Studio M3',
    total_amount: 36000.0,
    total_installments: 12,
    remaining_installments: 7,
    monthly_installment: 3000.0,
    purchase_date: '2026-03-15',
    first_cutoff_date: '2026-03-20',
    created_at: now,
    updated_at: now,
    sync_status: 'created',
  });

  // 5. Crear Amortizaciones del Préstamo Santander
  for (let i = 1; i <= 24; i++) {
    const pDate = new Date(2026, i - 1, 5).toISOString().split('T')[0];
    const isPaid = i <= 6;
    await db.loan_payments.add({
      id: `lp-auto-${i}`,
      user_id: userId,
      account_id: 'acc-prestamo-auto',
      installment_number: i,
      due_date: pDate,
      amount: 5200.0,
      status: isPaid ? 'paid' : 'pending',
      paid_date: isPaid ? pDate : null,
      created_at: now,
      updated_at: now,
      sync_status: 'created',
    });
  }

  // 6. Generar Conjunto Denso de Transacciones para TODOS los meses de 2026 (Enero a Agosto)
  const denseTransactions: TransactionLocal[] = [];

  const monthsList = [
    { year: 2026, month: 0, prefix: '2026-01' },
    { year: 2026, month: 1, prefix: '2026-02' },
    { year: 2026, month: 2, prefix: '2026-03' },
    { year: 2026, month: 3, prefix: '2026-04' },
    { year: 2026, month: 4, prefix: '2026-05' },
    { year: 2026, month: 5, prefix: '2026-06' },
    { year: 2026, month: 6, prefix: '2026-07' },
    { year: 2026, month: 7, prefix: '2026-08' },
  ];

  monthsList.forEach(({ prefix }) => {
    // Ingresos de Nómina Quincenal ($28,000 los días 01 y 15)
    denseTransactions.push(
      {
        id: crypto.randomUUID(),
        user_id: userId,
        account_id: 'acc-debito-bbva',
        category_id: 'cat-sueldo',
        amount: 28000,
        type: 'income',
        description: 'Nómina Quincena 1',
        date: `${prefix}-01`,
        is_reconciled: true,
        created_at: now,
        updated_at: now,
        sync_status: 'created',
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        account_id: 'acc-debito-bbva',
        category_id: 'cat-sueldo',
        amount: 28000,
        type: 'income',
        description: 'Nómina Quincena 2',
        date: `${prefix}-15`,
        is_reconciled: true,
        created_at: now,
        updated_at: now,
        sync_status: 'created',
      }
    );

    // Gastos Semanales de Supermercado (Banamex)
    denseTransactions.push(
      {
        id: crypto.randomUUID(),
        user_id: userId,
        account_id: 'acc-tdc-banamex',
        category_id: 'cat-comida',
        amount: 2400,
        type: 'expense',
        description: 'Supermercado Walmart Semana 1',
        date: `${prefix}-03`,
        is_reconciled: true,
        created_at: now,
        updated_at: now,
        sync_status: 'created',
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        account_id: 'acc-tdc-banamex',
        category_id: 'cat-comida',
        amount: 3100,
        type: 'expense',
        description: 'Supermercado Soriana Semana 2',
        date: `${prefix}-10`,
        is_reconciled: true,
        created_at: now,
        updated_at: now,
        sync_status: 'created',
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        account_id: 'acc-tdc-banamex',
        category_id: 'cat-comida',
        amount: 2800,
        type: 'expense',
        description: 'Supermercado Chedraui Semana 3',
        date: `${prefix}-17`,
        is_reconciled: true,
        created_at: now,
        updated_at: now,
        sync_status: 'created',
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        account_id: 'acc-tdc-banamex',
        category_id: 'cat-comida',
        amount: 3200,
        type: 'expense',
        description: 'Supermercado Costco Semana 4',
        date: `${prefix}-24`,
        is_reconciled: true,
        created_at: now,
        updated_at: now,
        sync_status: 'created',
      }
    );

    // Gasolina y Transporte (BBVA Oro)
    denseTransactions.push(
      {
        id: crypto.randomUUID(),
        user_id: userId,
        account_id: 'acc-tdc-bbva',
        category_id: 'cat-transporte',
        amount: 1400,
        type: 'expense',
        description: 'Gasolina Pemex',
        date: `${prefix}-05`,
        is_reconciled: true,
        created_at: now,
        updated_at: now,
        sync_status: 'created',
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        account_id: 'acc-tdc-bbva',
        category_id: 'cat-transporte',
        amount: 1500,
        type: 'expense',
        description: 'Gasolina Shell',
        date: `${prefix}-19`,
        is_reconciled: true,
        created_at: now,
        updated_at: now,
        sync_status: 'created',
      }
    );

    // Restantes de Restaurantes y Salidas (Amex)
    denseTransactions.push(
      {
        id: crypto.randomUUID(),
        user_id: userId,
        account_id: 'acc-tdc-amex',
        category_id: 'cat-salidas',
        amount: 2100,
        type: 'expense',
        description: 'Cena Restaurante Fin de Semana',
        date: `${prefix}-08`,
        is_reconciled: true,
        created_at: now,
        updated_at: now,
        sync_status: 'created',
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        account_id: 'acc-tdc-amex',
        category_id: 'cat-compras',
        amount: 3500,
        type: 'expense',
        description: 'Ropa y Accesorios Tienda',
        date: `${prefix}-14`,
        is_reconciled: true,
        created_at: now,
        updated_at: now,
        sync_status: 'created',
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        account_id: 'acc-tdc-amex',
        category_id: 'cat-salidas',
        amount: 1800,
        type: 'expense',
        description: 'Cine y Entretenimiento Familiar',
        date: `${prefix}-21`,
        is_reconciled: true,
        created_at: now,
        updated_at: now,
        sync_status: 'created',
      }
    );

    // Servicios del Hogar (Débito)
    denseTransactions.push(
      {
        id: crypto.randomUUID(),
        user_id: userId,
        account_id: 'acc-debito-bbva',
        category_id: 'cat-servicios',
        amount: 1200,
        type: 'expense',
        description: 'Recibo Luz CFE e Internet',
        date: `${prefix}-11`,
        is_reconciled: true,
        created_at: now,
        updated_at: now,
        sync_status: 'created',
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        account_id: 'acc-debito-bbva',
        category_id: 'cat-salud',
        amount: 2300,
        type: 'expense',
        description: 'Farmacia y Consulta Médica',
        date: `${prefix}-26`,
        is_reconciled: true,
        created_at: now,
        updated_at: now,
        sync_status: 'created',
      }
    );

    // Pagos a Tarjetas de Crédito desde Débito
    denseTransactions.push(
      {
        id: crypto.randomUUID(),
        user_id: userId,
        account_id: 'acc-debito-bbva',
        amount: 10000,
        type: 'transfer',
        description: 'Pago Abono TDC Banamex',
        date: `${prefix}-04`,
        is_reconciled: true,
        created_at: now,
        updated_at: now,
        sync_status: 'created',
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        account_id: 'acc-debito-bbva',
        amount: 8000,
        type: 'transfer',
        description: 'Pago Abono TDC BBVA Oro',
        date: `${prefix}-09`,
        is_reconciled: true,
        created_at: now,
        updated_at: now,
        sync_status: 'created',
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        account_id: 'acc-debito-bbva',
        amount: 7000,
        type: 'transfer',
        description: 'Pago Abono TDC Amex',
        date: `${prefix}-28`,
        is_reconciled: true,
        created_at: now,
        updated_at: now,
        sync_status: 'created',
      }
    );
  });

  // Agregar Bonos e Ingresos Extraordinarios
  denseTransactions.push(
    {
      id: crypto.randomUUID(),
      user_id: userId,
      account_id: 'acc-debito-bbva',
      category_id: 'cat-bono',
      amount: 16500,
      type: 'income',
      description: 'Bono Especial Trimestral Q1',
      date: '2026-03-31',
      is_reconciled: true,
      created_at: now,
      updated_at: now,
      sync_status: 'created',
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      account_id: 'acc-debito-bbva',
      category_id: 'cat-bono',
      amount: 22000,
      type: 'income',
      description: 'Bono Semestral por Resultados Q2',
      date: '2026-06-30',
      is_reconciled: true,
      created_at: now,
      updated_at: now,
      sync_status: 'created',
    }
  );

  await db.transactions.bulkAdd(denseTransactions);
};
