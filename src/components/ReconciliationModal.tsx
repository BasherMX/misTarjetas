// Módulo de Conciliación Mensual (Cotejo de transacciones vs. Saldo de Estado de Cuenta)
import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import type { AccountLocal, TransactionLocal } from '../types';
import { formatMXN } from '../utils/finance';

interface ReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountLocal[];
  transactions: TransactionLocal[];
  onSaveReconciliation: (data: {
    accountId: string;
    period: string;
    bankStatementBalance: number;
    appCalculatedBalance: number;
    isBalanced: boolean;
  }) => void;
}

export const ReconciliationModal: React.FC<ReconciliationModalProps> = ({
  isOpen,
  onClose,
  accounts,
  transactions,
  onSaveReconciliation,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [period, setPeriod] = useState<string>(new Date().toISOString().substring(0, 7));
  const [bankBalance, setBankBalance] = useState<string>('');

  if (!isOpen) return null;

  const account = accounts.find((a) => a.id === selectedAccountId);

  // Filtrar transacciones del periodo seleccionado para la cuenta
  const filteredTransactions = transactions.filter(
    (t) =>
      t.account_id === selectedAccountId &&
      t.date.startsWith(period) &&
      !t.deleted_at
  );

  const appCalculatedBalance = account ? account.current_balance : 0;
  const numericBankBalance = bankBalance ? parseFloat(bankBalance) : 0;
  const difference = numericBankBalance - appCalculatedBalance;
  const isBalanced = Math.abs(difference) < 0.01;

  const handleSave = () => {
    if (!selectedAccountId || !period || !bankBalance) return;
    onSaveReconciliation({
      accountId: selectedAccountId,
      period,
      bankStatementBalance: numericBankBalance,
      appCalculatedBalance,
      isBalanced,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card rounded-2xl w-full max-w-2xl p-6 border border-slate-700 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-2">Conciliación Mensual de Cuentas</h2>
        <p className="text-xs text-slate-400 mb-4">
          Coteja el saldo final de tu app bancaria con las transacciones registradas en MisTarjetas.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Cuenta / Tarjeta</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
            >
              <option value="">Selecciona cuenta...</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Periodo (Año-Mes)</label>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
            />
          </div>
        </div>

        {selectedAccountId && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-xs text-slate-400 block">Saldo en App</span>
                <span className="text-lg font-bold text-slate-100">{formatMXN(appCalculatedBalance)}</span>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Saldo Estado de Cuenta</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={bankBalance}
                  onChange={(e) => setBankBalance(e.target.value)}
                  className="w-full text-center bg-slate-800 border border-slate-700 rounded-lg py-1 font-bold text-blue-400 text-sm focus:outline-none"
                />
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Diferencia</span>
                <span
                  className={`text-lg font-bold ${
                    isBalanced ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatMXN(difference)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
              <div className="flex items-center gap-2">
                {isBalanced ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
                <span className={isBalanced ? 'text-emerald-300 font-semibold' : 'text-rose-300 font-semibold'}>
                  {isBalanced
                    ? '¡Cuenta conciliada perfectamente!'
                    : `Existe un descuadre de ${formatMXN(Math.abs(difference))}. Revisa tus movimientos.`}
                </span>
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-800 rounded-xl p-2 bg-slate-950/40">
              <span className="text-xs text-slate-400 block mb-1 font-medium">
                Movimientos en el periodo ({filteredTransactions.length}):
              </span>
              {filteredTransactions.length === 0 ? (
                <p className="text-xs text-slate-500 py-2 text-center">No hay transacciones en este periodo</p>
              ) : (
                filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center text-xs p-2 rounded bg-slate-900 border border-slate-800"
                  >
                    <div>
                      <span className="text-slate-200 font-medium">{tx.description}</span>
                      <span className="text-slate-500 block text-[10px]">{tx.date}</span>
                    </div>
                    <span
                      className={`font-semibold ${
                        tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}{formatMXN(tx.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={!bankBalance}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition"
            >
              Guardar Conciliación
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
