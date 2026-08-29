// Vista de Historial Completo de Movimientos con Detalle, Edición y Confirmación de Eliminación
import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Trash2, Pencil, Eye, X, Filter, ArrowRightLeft } from 'lucide-react';
import { db } from '../db/schema';
import type { TransactionLocal, AccountLocal, CategoryLocal, TransactionType } from '../types';
import { formatMXN } from '../utils/finance';

interface TransactionsViewProps {
  transactions: TransactionLocal[];
  accounts: AccountLocal[];
  categories: CategoryLocal[];
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  accounts,
  categories,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedTxDetail, setSelectedTxDetail] = useState<TransactionLocal | null>(null);
  const [editingTx, setEditingTx] = useState<TransactionLocal | null>(null);

  // Estados del Formulario de Edición
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editAccountId, setEditAccountId] = useState('');
  const [editType, setEditType] = useState<TransactionType>('expense');

  const startEdit = (tx: TransactionLocal) => {
    setEditingTx(tx);
    setEditDescription(tx.description);
    setEditAmount(String(tx.amount));
    setEditDate(tx.date);
    setEditCategoryId(tx.category_id || '');
    setEditAccountId(tx.account_id);
    setEditType(tx.type);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !editDescription || !editAmount || !editAccountId) return;

    const now = new Date().toISOString();
    const newAmount = parseFloat(editAmount);
    const amountDiff = newAmount - editingTx.amount;

    // 1. Actualizar la transacción
    await db.transactions.update(editingTx.id, {
      description: editDescription,
      amount: newAmount,
      date: editDate,
      category_id: editCategoryId || undefined,
      account_id: editAccountId,
      type: editType,
      updated_at: now,
      sync_status: 'updated',
    });

    // 2. Ajustar el saldo de la cuenta si el monto cambió
    if (amountDiff !== 0) {
      const acc = await db.accounts.get(editAccountId);
      if (acc) {
        let updatedBalance = acc.current_balance;
        if (editType === 'income') {
          updatedBalance += amountDiff;
        } else if (editType === 'expense') {
          if (acc.type === 'credit_card') {
            updatedBalance += amountDiff;
          } else {
            updatedBalance -= amountDiff;
          }
        }

        await db.accounts.update(editAccountId, {
          current_balance: updatedBalance,
          updated_at: now,
          sync_status: 'updated',
        });
      }
    }

    setEditingTx(null);
  };

  // Confirmación Estricta de Eliminación
  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este movimiento? Esta acción no se puede deshacer.')) {
      const tx = await db.transactions.get(id);
      if (tx) {
        // Revertir saldo en la cuenta al eliminar
        const acc = await db.accounts.get(tx.account_id);
        if (acc) {
          let revertedBalance = acc.current_balance;
          if (tx.type === 'income') {
            revertedBalance -= tx.amount;
          } else if (tx.type === 'expense') {
            if (acc.type === 'credit_card') {
              revertedBalance -= tx.amount;
            } else {
              revertedBalance += tx.amount;
            }
          }
          await db.accounts.update(tx.account_id, {
            current_balance: revertedBalance,
            updated_at: new Date().toISOString(),
            sync_status: 'updated',
          });
        }
      }
      await db.transactions.delete(id);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Modal de Detalle de Movimiento */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-150">
            <div className="blue-header-gradient p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base uppercase">DETALLE DEL MOVIMIENTO</h3>
                <span className="text-xs text-blue-100/90 font-medium">ID: {selectedTxDetail.id.slice(0, 8)}</span>
              </div>
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="p-1.5 rounded-full text-blue-100 hover:text-white bg-black/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Concepto / Descripción</span>
                <p className="font-extrabold text-sm text-slate-900">{selectedTxDetail.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Monto</span>
                  <span className="font-extrabold text-sm text-slate-900">{formatMXN(selectedTxDetail.amount)}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Tipo</span>
                  <span className="font-extrabold text-xs uppercase text-blue-700">{selectedTxDetail.type}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Cuenta / Instrumento</span>
                  <span className="font-bold text-slate-800">
                    {accounts.find((a) => a.id === selectedTxDetail.account_id)?.name || 'Cuenta'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Categoría</span>
                  <span className="font-bold text-slate-800">
                    {categories.find((c) => c.id === selectedTxDetail.category_id)?.name || 'Sin categoría'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Fecha de Registro</span>
                <span className="font-bold text-slate-900">{selectedTxDetail.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición de Movimiento */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-150">
            <div className="blue-header-gradient p-5 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-base uppercase">EDITAR MOVIMIENTO</h3>
              <button
                onClick={() => setEditingTx(null)}
                className="p-1.5 rounded-full text-blue-100 hover:text-white bg-black/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">Descripción / Concepto</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">Monto (MXN $)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">Fecha</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">Cuenta</label>
                <select
                  value={editAccountId}
                  onChange={(e) => setEditAccountId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px]">Categoría</label>
                <select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="">Sin Categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl transition shadow uppercase text-xs tracking-wider"
              >
                GUARDAR CAMBIOS
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Encabezado y Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">HISTORIAL DE MOVIMIENTOS</h2>
          <p className="text-xs text-slate-500">Registro detallado de todos los gastos, ingresos y transferencias</p>
        </div>

        {/* Filtro por tipo */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
          <Filter className="w-4 h-4 text-slate-400 ml-1" />
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg transition ${
              filterType === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1 rounded-lg transition ${
              filterType === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Gastos
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1 rounded-lg transition ${
              filterType === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Ingresos
          </button>
          <button
            onClick={() => setFilterType('transfer')}
            className={`px-3 py-1 rounded-lg transition ${
              filterType === 'transfer' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pagos / Trans.
          </button>
        </div>
      </div>

      <div className="app-card p-5 space-y-4">
        <div className="divide-y divide-slate-100">
          {filteredTransactions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-medium">
              No se encontraron movimientos registrados en este filtro.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const account = accounts.find((a) => a.id === tx.account_id);
              const category = categories.find((c) => c.id === tx.category_id);
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';

              return (
                <div key={tx.id} className="py-3 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        isIncome
                          ? 'bg-emerald-100 text-emerald-700'
                          : isTransfer
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : isTransfer ? (
                        <ArrowRightLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{tx.description}</h4>
                      <span className="text-slate-500 font-medium truncate block">
                        {account?.name || 'Cuenta'} • {category?.name || tx.type.toUpperCase()} • {tx.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`font-extrabold text-sm ${
                        isIncome ? 'text-emerald-600' : isTransfer ? 'text-blue-700' : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? `+ ${formatMXN(tx.amount)}` : `- ${formatMXN(tx.amount)}`}
                    </span>

                    {/* Acciones de Movimiento: Detalle, Editar y Eliminar */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedTxDetail(tx)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                        title="Ver detalle del movimiento"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startEdit(tx)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                        title="Editar movimiento"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Eliminar movimiento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
