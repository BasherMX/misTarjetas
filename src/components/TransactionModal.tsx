// Modal de Transacciones (Gastos, Ingresos, Pagos a TDC y Transferencias entre Cuentas)
import React, { useState } from 'react';
import { X, ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react';
import type { AccountLocal, CategoryLocal, TransactionType } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountLocal[];
  categories: CategoryLocal[];
  onSubmit: (data: {
    accountId: string;
    toAccountId?: string;
    categoryId?: string;
    amount: number;
    type: TransactionType;
    description: string;
    date: string;
    isMsi: boolean;
    msiInstallments?: number;
  }) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  accounts,
  categories,
  onSubmit,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [accountId, setAccountId] = useState<string>(''); // Cuenta Origen
  const [toAccountId, setToAccountId] = useState<string>(''); // Cuenta Destino (para Transferencias / Pagos)
  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isMsi, setIsMsi] = useState<boolean>(false);
  const [msiInstallments, setMsiInstallments] = useState<number>(3);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !amount || !description) return;
    if (type === 'transfer' && !toAccountId) return;

    onSubmit({
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      categoryId: categoryId || undefined,
      amount: parseFloat(amount),
      type,
      description,
      date,
      isMsi: type === 'expense' ? isMsi : false,
      msiInstallments: isMsi ? msiInstallments : undefined,
    });

    setAmount('');
    setDescription('');
    setToAccountId('');
    setIsMsi(false);
    onClose();
  };

  const selectedAccount = accounts.find((acc) => acc.id === accountId);
  const isCreditCard = selectedAccount?.type === 'credit_card';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
        {/* Banner de Encabezado Azul */}
        <div className="blue-header-gradient p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-blue-100 hover:text-white bg-black/20 hover:bg-black/30"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-extrabold tracking-wider uppercase">REGISTRAR MOVIMIENTO</h2>
          <p className="text-xs text-blue-100/90 mt-0.5">Mis Tarjetas Finanzas Personales</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selector de Tipo de Movimiento (Gasto, Ingreso, Pago a TDC / Transferencia) */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setIsMsi(false);
              }}
              className={`py-2 px-1 text-[11px] font-extrabold rounded-lg flex items-center justify-center gap-1 transition ${
                type === 'expense' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>GASTO</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('income');
                setIsMsi(false);
              }}
              className={`py-2 px-1 text-[11px] font-extrabold rounded-lg flex items-center justify-center gap-1 transition ${
                type === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>INGRESO</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('transfer');
                setIsMsi(false);
              }}
              className={`py-2 px-1 text-[11px] font-extrabold rounded-lg flex items-center justify-center gap-1 transition ${
                type === 'transfer' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>PAGO / TRANS.</span>
            </button>
          </div>

          {/* Monto (MXN $) */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Monto (MXN $)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Si es Transferencia o Pago a TDC */}
          {type === 'transfer' ? (
            <div className="space-y-3 p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200">
              <div>
                <label className="block text-xs font-bold text-blue-950 mb-1">Desde Cuenta Origen (Retirar de:)</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                  className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <option value="">Selecciona Cuenta de Origen (Débito/Efectivo)</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type.toUpperCase()}) - ${acc.current_balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-950 mb-1">A Cuenta Destino / TDC (Pagar o Depositar a:)</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  required
                  className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <option value="">Selecciona Cuenta / TDC Destino</option>
                  {accounts
                    .filter((acc) => acc.id !== accountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.type === 'credit_card' ? 'PAGAR TARJETA' : acc.type.toUpperCase()})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ) : (
            /* Para Gastos o Ingresos */
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                {type === 'income' ? 'Depositar en Cuenta (Débito / Efectivo)' : 'Cuenta / Tarjeta Origen'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  {type === 'income'
                    ? 'Selecciona Cuenta de Débito o Efectivo'
                    : 'Selecciona Cuenta / TDC'}
                </option>
                {accounts
                  .filter((acc) =>
                    type === 'income' ? ['debit', 'cash', 'savings'].includes(acc.type) : true
                  )
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type === 'credit_card' ? 'TDC' : acc.type.toUpperCase()})
                    </option>
                  ))}
              </select>
              {type === 'income' && (
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  * Los ingresos únicamente se pueden depositar en cuentas líquidas (Débito, Efectivo o Ahorro).
                </p>
              )}
            </div>
          )}

          {/* Categoría (Opcional para Transferencias) */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Categoría</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona categoría...</option>
                {categories
                  .filter((c) => c.type === type)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Fecha */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Descripción / Concepto</label>
            <input
              type="text"
              placeholder={
                type === 'transfer'
                  ? 'Ej. Pago mensual de tarjeta Banamex'
                  : type === 'income'
                  ? 'Ej. Depósito de nómina o efectivo'
                  : 'Ej. Despensa, Gasolina'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Opción Meses Sin Intereses si es Gasto con TDC */}
          {type === 'expense' && isCreditCard && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMsi}
                  onChange={(e) => setIsMsi(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-blue-900">Diferir a Meses Sin Intereses (MSI)</span>
              </label>

              {isMsi && (
                <select
                  value={msiInstallments}
                  onChange={(e) => setMsiInstallments(parseInt(e.target.value))}
                  className="w-full bg-white border border-blue-300 rounded-lg p-2 text-xs font-semibold text-slate-800"
                >
                  {[3, 6, 9, 12, 18, 24].map((m) => (
                    <option key={m} value={m}>
                      {m} Pagos Mensuales Sin Intereses
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Botón de Acción según Tipo */}
          <button
            type="submit"
            className={`w-full py-3 text-white font-extrabold rounded-xl shadow-md transition uppercase tracking-wider text-sm mt-2 ${
              type === 'income'
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : type === 'transfer'
                ? 'bg-blue-600 hover:bg-blue-500'
                : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            {type === 'income' ? 'REGISTRAR INGRESO' : type === 'transfer' ? 'REALIZAR PAGO / TRANSFERENCIA' : 'REGISTRAR GASTO'}
          </button>
        </form>
      </div>
    </div>
  );
};
