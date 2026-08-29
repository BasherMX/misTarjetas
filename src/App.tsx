// Aplicación Principal FINANCIAS MX (Mobile-First, Rutas Funcionales, Datos Iniciales en 0 y FAB Gasto Accesible)
import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

import { db } from './db/schema';
import { seedRealisticDemoData } from './db/seedData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { TransactionModal } from './components/TransactionModal';
import { ReconciliationModal } from './components/ReconciliationModal';
import { PaymentAlertBanner } from './components/PaymentAlertBanner';
import { SyncEngine } from './services/syncEngine';
import { exportToExcel, exportToPdf } from './utils/export';
import { formatMXN } from './utils/finance';

import { AccountsView } from './views/AccountsView';
import { CategoriesView } from './views/CategoriesView';
import { BudgetsView } from './views/BudgetsView';
import { CalendarView } from './views/CalendarView';
import { TransactionsView } from './views/TransactionsView';
import { SettingsView } from './views/SettingsView';

import type { TransactionType } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [isReconciliationModalOpen, setIsReconciliationModalOpen] = useState<boolean>(false);

  // Estados de filtro de fecha para la gráfica global del Home (Por defecto: Mes Actual)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const [globalTimeRange, setGlobalTimeRange] = useState<'current_month' | 'last_month' | 'current_year' | 'custom'>('current_month');
  const [globalStartDate, setGlobalStartDate] = useState<string>(
    new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  );
  const [globalEndDate, setGlobalEndDate] = useState<string>(todayStr);

  // Consultas reactivas de Dexie.js
  const accounts = useLiveQuery(() => db.accounts.toArray(), []) || [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];
  const msiPlans = useLiveQuery(() => db.msi_plans.toArray(), []) || [];
  const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray(), []) || [];
  const budgets = useLiveQuery(() => db.budgets.toArray(), []) || [];
  const loanPayments = useLiveQuery(() => db.loan_payments.toArray(), []) || [];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

      return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Inicializa los datos demostrativos densos semana a semana (Enero a Agosto 2026)
  useEffect(() => {
    seedRealisticDemoData();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await SyncEngine.syncAll('user-financias-mx');
    setIsSyncing(false);
  };

  const handleCreateTransaction = async (data: {
    accountId: string;
    toAccountId?: string;
    categoryId?: string;
    amount: number;
    type: TransactionType;
    description: string;
    date: string;
    isMsi: boolean;
    msiInstallments?: number;
  }) => {
    const now = new Date().toISOString();
    const demoUserId = 'user-mis-tarjetas';
    const txId = crypto.randomUUID();

    let msiPlanId: string | undefined = undefined;

    if (data.isMsi && data.msiInstallments && data.msiInstallments > 1) {
      msiPlanId = crypto.randomUUID();
      const monthlyAmount = data.amount / data.msiInstallments;

      await db.msi_plans.add({
        id: msiPlanId,
        user_id: demoUserId,
        account_id: data.accountId,
        description: data.description,
        total_amount: data.amount,
        total_installments: data.msiInstallments,
        remaining_installments: data.msiInstallments,
        monthly_installment: monthlyAmount,
        purchase_date: data.date,
        first_cutoff_date: data.date,
        created_at: now,
        updated_at: now,
        sync_status: 'created',
      });
    }

    // Registrar transacción
    await db.transactions.add({
      id: txId,
      user_id: demoUserId,
      account_id: data.accountId,
      category_id: data.categoryId,
      msi_plan_id: msiPlanId,
      amount: data.amount,
      type: data.type,
      description: data.description,
      date: data.date,
      is_reconciled: false,
      created_at: now,
      updated_at: now,
      sync_status: 'created',
    });

    // Procesar afectación de saldos según el tipo de movimiento
    if (data.type === 'transfer' && data.toAccountId) {
      // 1. Descontar de cuenta de origen (ej. Débito o Efectivo)
      const fromAccount = await db.accounts.get(data.accountId);
      if (fromAccount) {
        const fromNewBalance = fromAccount.current_balance - data.amount;
        await db.accounts.update(data.accountId, {
          current_balance: fromNewBalance,
          updated_at: now,
          sync_status: 'updated',
        });
      }

      // 2. Aplicar pago o abono a cuenta de destino (ej. Pagar Tarjeta de Crédito)
      const toAccount = await db.accounts.get(data.toAccountId);
      if (toAccount) {
        const isDebtAccount = ['credit_card', 'loan'].includes(toAccount.type);
        // Si es TDC o Préstamo, reducir la deuda; si es Débito/Efectivo, sumar el saldo
        const toNewBalance = isDebtAccount
          ? Math.max(0, toAccount.current_balance - data.amount)
          : toAccount.current_balance + data.amount;

        await db.accounts.update(data.toAccountId, {
          current_balance: toNewBalance,
          updated_at: now,
          sync_status: 'updated',
        });
      }
    } else {
      // Gastos o Ingresos individuales
      const account = await db.accounts.get(data.accountId);
      if (account) {
        let newBalance = account.current_balance;

        if (data.type === 'income') {
          // Ingreso directo a Débito o Efectivo
          newBalance += data.amount;
        } else if (data.type === 'expense' && !data.isMsi) {
          if (account.type === 'credit_card') {
            // Gasto revolvente con TDC incrementa la deuda
            newBalance += data.amount;
          } else {
            // Gasto con Débito o Efectivo resta saldo líquido
            newBalance -= data.amount;
          }
        }

        await db.accounts.update(data.accountId, {
          current_balance: newBalance,
          updated_at: now,
          sync_status: 'updated',
        });
      }
    }
  };

  const handleSaveReconciliation = async (data: {
    accountId: string;
    period: string;
    bankStatementBalance: number;
    appCalculatedBalance: number;
    isBalanced: boolean;
  }) => {
    const now = new Date().toISOString();
    await db.reconciliations.add({
      id: crypto.randomUUID(),
      user_id: 'user-financias-mx',
      account_id: data.accountId,
      period: data.period,
      bank_statement_balance: data.bankStatementBalance,
      app_calculated_balance: data.appCalculatedBalance,
      difference: data.bankStatementBalance - data.appCalculatedBalance,
      is_balanced: data.isBalanced,
      created_at: now,
      updated_at: now,
      sync_status: 'created',
    });
  };

  // Cálculos dinámicos (Valores reales derivados de la BD local)
  const liquidBalance = accounts
    .filter((a) => ['debit', 'savings', 'cash'].includes(a.type) && !a.deleted_at)
    .reduce((sum, a) => sum + a.current_balance, 0);

  const tdcAccounts = accounts.filter((a) => a.type === 'credit_card' && !a.deleted_at);
  const totalCreditLimit = tdcAccounts.reduce((sum, a) => sum + (a.credit_limit || 0), 0);
  const totalTdcBalance = tdcAccounts.reduce((sum, a) => sum + a.current_balance, 0);
  const availableCredit = Math.max(0, totalCreditLimit - totalTdcBalance);
  const globalUtilizationPercent = totalCreditLimit > 0 ? (totalTdcBalance / totalCreditLimit) * 100 : 0;

  // Donut chart de categorías de gasto (Usa solo categorías de tipo expense)
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const pieCategoryData = expenseCategories.map((cat) => {
    const catExpense = transactions
      .filter((t) => t.category_id === cat.id && t.type === 'expense' && !t.deleted_at)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      name: cat.name,
      value: catExpense,
      color: cat.color_hex || '#3b82f6',
      icon: cat.icon,
    };
  });

  const totalExpenseSum = pieCategoryData.reduce((acc, item) => acc + item.value, 0);

  // Rodaja para Recharts (Si es 0 MXN, muestra anillo neutro elegante)
  const chartPieSlices =
    totalExpenseSum > 0
      ? pieCategoryData.filter((item) => item.value > 0)
      : [{ name: 'Sin Gastos Registrados', value: 1, color: '#cbd5e1' }];

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex flex-col font-sans">
      {/* Navbar Superior */}
      <Navbar
        isOnline={isOnline}
        isSyncing={isSyncing}
        onSync={handleSync}
        onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
        onExportExcel={() => exportToExcel(accounts, transactions, msiPlans)}
        onExportPdf={() => exportToPdf(accounts, transactions)}
      />

      <div className="flex flex-1 items-stretch">
        {/* Sidebar Lateral para pantallas medianas/grandes */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Contenido Principal según la pestaña activa */}
        <main className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full pb-20 md:pb-8">
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="blue-header-gradient rounded-2xl p-5 text-white shadow-md flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-wide uppercase">RESUMEN GENERAL</h2>
                  <p className="text-xs text-blue-100/90 font-medium">Mis Tarjetas - Personal Finance PWA (MXN)</p>
                </div>

                <button
                  onClick={() => setIsTransactionModalOpen(true)}
                  className="hidden sm:flex items-center gap-2 bg-white text-blue-800 font-extrabold px-4 py-2 rounded-xl shadow hover:bg-blue-50 transition text-xs"
                >
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span>REGISTRAR</span>
                </button>
              </div>

              {/* Grid de 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="app-card p-4 flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SALDO NETO</span>
                  <div className="text-xl font-black text-slate-900 mt-2">{formatMXN(liquidBalance)}</div>
                </div>

                <div className="rounded-2xl p-4 bg-[#e6f4ea] border border-emerald-200/60 flex flex-col justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">CRÉDITO DISPONIBLE</span>
                  <div className="text-xl font-black text-emerald-700 mt-2">{formatMXN(availableCredit)}</div>
                </div>

                <div className="rounded-2xl p-4 bg-[#fef3c7] border border-amber-200 flex flex-col justify-between">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    CRÉDITO TDC ({globalUtilizationPercent.toFixed(0)}%)
                  </span>
                  <div className="text-xl font-black text-amber-800 mt-2">{formatMXN(totalTdcBalance)}</div>
                </div>

                <div className="rounded-2xl p-4 bg-[#ffe4e6] border border-rose-200 flex flex-col justify-between">
                  <span className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    ALERTA TDC (&gt;30%)
                  </span>
                  <div className="text-xs text-rose-700 font-semibold mt-2">
                    {globalUtilizationPercent > 30 ? 'Uso preventivo detectado' : 'Sin Alerta Activa'}
                  </div>
                </div>
              </div>

              {/* Grafico Dona & Cuentas */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 app-card p-5 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">GASTOS POR CATEGORÍA</h3>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-44 h-44 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartPieSlices}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={totalExpenseSum > 0 ? 4 : 0}
                            dataKey="value"
                          >
                            {chartPieSlices.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val: any) => formatMXN(Number(val))} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Total Gastos</span>
                        <span className="text-xs font-black text-slate-900">{formatMXN(totalExpenseSum)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs font-semibold text-slate-700 w-full sm:w-auto">
                      {pieCategoryData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="flex-1">{item.name}</span>
                          <span className="text-slate-500 font-mono">{formatMXN(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 app-card p-5 space-y-4 flex flex-col justify-between">
                  <PaymentAlertBanner
                    accounts={accounts}
                    loanPayments={loanPayments}
                    onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
                  />
                </div>
              </div>

              {/* Gráfica General de Fluctuaciones Globales e Historial (Todo el Sistema) */}
              <div className="app-card p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      HISTORIAL & FLUCTUACIONES GENERALES (TODO EL SISTEMA)
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Evolución de Entradas (Ingresos/Pagos) vs Salidas (Gastos) por fechas
                    </p>
                  </div>

                  {/* Controles de Filtro de Fechas */}
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setGlobalTimeRange('current_month')}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                        globalTimeRange === 'current_month'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Mes Actual
                    </button>
                    <button
                      type="button"
                      onClick={() => setGlobalTimeRange('last_month')}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                        globalTimeRange === 'last_month'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Mes Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() => setGlobalTimeRange('current_year')}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                        globalTimeRange === 'current_year'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Todo el Año
                    </button>
                    <button
                      type="button"
                      onClick={() => setGlobalTimeRange('custom')}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                        globalTimeRange === 'custom'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Rango Personalizado
                    </button>
                  </div>
                </div>

                {/* Si es Personalizado, mostrar inputs de fecha */}
                {globalTimeRange === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Fecha Inicial</label>
                      <input
                        type="date"
                        value={globalStartDate}
                        onChange={(e) => setGlobalStartDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Fecha Final</label>
                      <input
                        type="date"
                        value={globalEndDate}
                        onChange={(e) => setGlobalEndDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold"
                      />
                    </div>
                  </div>
                )}

                {/* Área del Gráfico Global */}
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={(() => {
                        let filterStart = globalStartDate;
                        let filterEnd = globalEndDate;

                        if (globalTimeRange === 'current_month') {
                          filterStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                          filterEnd = todayStr;
                        } else if (globalTimeRange === 'last_month') {
                          const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                          const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                          filterStart = firstDayLastMonth.toISOString().split('T')[0];
                          filterEnd = lastDayLastMonth.toISOString().split('T')[0];
                        } else if (globalTimeRange === 'current_year') {
                          filterStart = `${today.getFullYear()}-01-01`;
                          filterEnd = todayStr;
                        }

                        const map: { [dateStr: string]: { date: string; fullDate: string; gastos: number; ingresos: number } } = {};
                        const cur = new Date(filterStart + 'T00:00:00');
                        const end = new Date(filterEnd + 'T00:00:00');

                        const diffDays = Math.ceil((end.getTime() - cur.getTime()) / (1000 * 60 * 60 * 24));
                        const groupByMonth = diffDays > 60;

                        if (groupByMonth) {
                          let yr = cur.getFullYear();
                          let mo = cur.getMonth();
                          const endYr = end.getFullYear();
                          const endMo = end.getMonth();

                          while (yr < endYr || (yr === endYr && mo <= endMo)) {
                            const monthKey = `${yr}-${String(mo + 1).padStart(2, '0')}`;
                            map[monthKey] = { date: monthKey, fullDate: monthKey, gastos: 0, ingresos: 0 };
                            mo++;
                            if (mo > 11) {
                              mo = 0;
                              yr++;
                            }
                          }
                        } else {
                          while (cur <= end) {
                            const dStr = cur.toISOString().split('T')[0];
                            map[dStr] = { date: dStr.slice(5), fullDate: dStr, gastos: 0, ingresos: 0 };
                            cur.setDate(cur.getDate() + 1);
                          }
                        }

                        transactions.forEach((tx) => {
                          if (!tx.deleted_at && tx.date >= filterStart && tx.date <= filterEnd) {
                            const key = groupByMonth ? tx.date.slice(0, 7) : tx.date;
                            if (map[key]) {
                              if (tx.type === 'expense') {
                                map[key].gastos += tx.amount;
                              } else if (tx.type === 'income' || tx.type === 'transfer') {
                                map[key].ingresos += tx.amount;
                              }
                            }
                          }
                        });

                        return Object.values(map).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
                      })()}
                    >
                      <defs>
                        <linearGradient id="globalGastos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="globalIngresos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <Tooltip formatter={(val: any) => formatMXN(Number(val))} />
                      <Area
                        type="monotone"
                        dataKey="gastos"
                        name="Salidas / Gastos"
                        stroke="#f43f5e"
                        fillOpacity={1}
                        fill="url(#globalGastos)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="ingresos"
                        name="Entradas / Ingresos"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#globalIngresos)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cuentas' && (
            <AccountsView
              accounts={accounts}
              msiPlans={msiPlans}
              loanPayments={loanPayments}
              transactions={transactions}
              categories={categories}
            />
          )}
          {activeTab === 'categoria' && <CategoriesView categories={categories} />}
          {activeTab === 'presupuestos' && (
            <BudgetsView budgets={budgets} categories={categories} transactions={transactions} />
          )}
          {activeTab === 'fecha' && <CalendarView accounts={accounts} />}
          {activeTab === 'gasto' && (
            <TransactionsView transactions={transactions} accounts={accounts} categories={categories} />
          )}
          {activeTab === 'settings' && (
            <SettingsView isOnline={isOnline} isSyncing={isSyncing} onSync={handleSync} />
          )}
        </main>
      </div>

      {/* Navegación Inferior Móvil y Botón Flotante FAB (+) Siempre Accesible */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
      />

      {/* Modales de Transacción y Conciliación */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        accounts={accounts}
        categories={categories}
        onSubmit={handleCreateTransaction}
      />

      <ReconciliationModal
        isOpen={isReconciliationModalOpen}
        onClose={() => setIsReconciliationModalOpen(false)}
        accounts={accounts}
        transactions={transactions}
        onSaveReconciliation={handleSaveReconciliation}
      />
    </div>
  );
}

export default App;
