// Modal de Detalle y Estadísticas de Fluctuación por Tarjeta / Cuenta con Rango Continuo de Días Completo
import React, { useState } from 'react';
import { X, TrendingDown, TrendingUp, BarChart2, Calendar, AlertTriangle, Filter } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { AccountLocal, TransactionLocal, CategoryLocal, MsiPlanLocal } from '../types';
import { calculateTdcMetrics, formatMXN } from '../utils/finance';

interface AccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountLocal | null;
  transactions: TransactionLocal[];
  categories: CategoryLocal[];
  msiPlans: MsiPlanLocal[];
}

export type TimeRangeOption = 'current_month' | 'last_month' | 'current_year' | 'custom';

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  isOpen,
  onClose,
  account,
  transactions,
  categories,
  msiPlans,
}) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [timeRange, setTimeRange] = useState<TimeRangeOption>('current_month');
  const [startDate, setStartDate] = useState<string>(
    new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(todayStr);

  if (!isOpen || !account) return null;

  const isCreditCard = account.type === 'credit_card';
  const metrics = calculateTdcMetrics(account, msiPlans);

  // Transacciones de esta cuenta
  const accountTxs = transactions.filter((t) => t.account_id === account.id && !t.deleted_at);

  // Determinar Rango de Fechas según la opción seleccionada
  let filterStart = startDate;
  let filterEnd = endDate;

  if (timeRange === 'current_month') {
    filterStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    filterEnd = todayStr;
  } else if (timeRange === 'last_month') {
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    filterStart = firstDayLastMonth.toISOString().split('T')[0];
    filterEnd = lastDayLastMonth.toISOString().split('T')[0];
  } else if (timeRange === 'current_year') {
    filterStart = `${today.getFullYear()}-01-01`;
    filterEnd = todayStr;
  }

  // Pre-poblar TODOS los días continuos del rango con $0.00 por defecto
  const dateMap: { [key: string]: { date: string; fullDate: string; gastos: number; pagos: number } } = {};
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
      dateMap[monthKey] = { date: monthKey, fullDate: monthKey, gastos: 0, pagos: 0 };
      mo++;
      if (mo > 11) {
        mo = 0;
        yr++;
      }
    }
  } else {
    while (cur <= end) {
      const dStr = cur.toISOString().split('T')[0];
      dateMap[dStr] = { date: dStr.slice(5), fullDate: dStr, gastos: 0, pagos: 0 };
      cur.setDate(cur.getDate() + 1);
    }
  }

  // Filtrar y vaciar transacciones en el mapa de fechas continuas
  const filteredTxs = accountTxs
    .filter((t) => t.date >= filterStart && t.date <= filterEnd)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  filteredTxs.forEach((tx) => {
    const key = groupByMonth ? tx.date.slice(0, 7) : tx.date;
    if (dateMap[key]) {
      if (tx.type === 'expense') {
        dateMap[key].gastos += tx.amount;
      } else if (tx.type === 'income' || tx.type === 'transfer') {
        dateMap[key].pagos += tx.amount;
      }
    }
  });

  const chartData = Object.values(dateMap).sort((a, b) => a.fullDate.localeCompare(b.fullDate));

  // Métricas del rango filtrado
  const totalIn = filteredTxs
    .filter((t) => t.type === 'income' || t.type === 'transfer')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOut = filteredTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200 my-8">
        {/* Banner de Encabezado Azul */}
        <div className="blue-header-gradient p-5 text-white relative flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-200" />
              <h2 className="text-xl font-black uppercase tracking-wide">{account.name}</h2>
            </div>
            <p className="text-xs text-blue-100/90 mt-0.5 font-medium">
              {account.institution || 'Banco'} • {account.type.toUpperCase()} • Historial & Fluctuaciones
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-blue-100 hover:text-white bg-black/20 hover:bg-black/30"
          >
            <X className="w-5 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">
          {/* Selector de Rango de Fechas */}
          <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-extrabold text-blue-950 uppercase tracking-wider text-[11px]">
                <Filter className="w-4 h-4 text-blue-600" />
                <span>FILTRAR RANGO DE FECHAS EN LA GRÁFICA</span>
              </div>

              {/* Botones de Rango */}
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setTimeRange('current_month')}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                    timeRange === 'current_month'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  Mes Actual
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('last_month')}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                    timeRange === 'last_month'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  Mes Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('current_year')}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                    timeRange === 'current_year'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  Todo el Año
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('custom')}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                    timeRange === 'custom'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  Personalizado
                </button>
              </div>
            </div>

            {/* Selector de Rango Personalizado */}
            {timeRange === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-blue-200/60 animate-in fade-in duration-150">
                <div>
                  <label className="block text-[10px] font-bold text-blue-900 mb-1">Fecha Inicial</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-blue-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-blue-900 mb-1">Fecha Final</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white border border-blue-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Métricas de Salud Financiera en el Rango */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL ENTRADAS / PAGOS</span>
              <div className="flex items-center gap-1.5 mt-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-base font-extrabold text-slate-900">{formatMXN(totalIn)}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL SALIDAS / GASTOS</span>
              <div className="flex items-center gap-1.5 mt-1">
                <TrendingDown className="w-4 h-4 text-rose-600" />
                <span className="text-base font-extrabold text-slate-900">{formatMXN(totalOut)}</span>
              </div>
            </div>
          </div>

          {/* Alerta de Uso si es TDC */}
          {isCreditCard && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                metrics.utilizationPercentage > 50
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : metrics.utilizationPercentage > 30
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-bold text-xs">
                  Uso del Límite de Crédito: <strong>{metrics.utilizationPercentage.toFixed(1)}%</strong>
                </span>
              </div>
              <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-white/70 shadow-2xs">
                {metrics.utilizationPercentage > 50
                  ? 'Uso Crítico (>50%)'
                  : metrics.utilizationPercentage > 30
                  ? 'Alerta Preventiva (>30%)'
                  : 'Saludable'}
              </span>
            </div>
          )}

          {/* Gráfica de Fluctuación por Fechas Continuas */}
          <div className="space-y-2 app-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                FLUCTUACIÓN DE ENTRADAS Y SALIDAS ({filterStart} AL {filterEnd})
              </h3>
            </div>

            <div className="w-full h-56 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPagos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
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
                    name="Gastos/Salidas"
                    stroke="#f43f5e"
                    fillOpacity={1}
                    fill="url(#colorGastos)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="pagos"
                    name="Pagos/Entradas"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorPagos)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historial de Movimientos de la Cuenta en el Rango */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
              HISTORIAL DE MOVIMIENTOS ({filteredTxs.length})
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {filteredTxs.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl border text-center text-slate-400 font-medium">
                  No hay movimientos registrados para este periodo.
                </div>
              ) : (
                filteredTxs.map((tx) => {
                  const category = categories.find((c) => c.id === tx.category_id);
                  const isExpense = tx.type === 'expense';
                  return (
                    <div
                      key={tx.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{tx.description}</span>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">
                            ({category?.name || tx.type})
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">{tx.date}</span>
                      </div>

                      <span
                        className={`font-extrabold ${
                          isExpense ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isExpense ? `- ${formatMXN(tx.amount)}` : `+ ${formatMXN(tx.amount)}`}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
