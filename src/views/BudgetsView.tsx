// Vista de Presupuestos (Actual vs. Real)
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { db } from '../db/schema';
import type { BudgetLocal, CategoryLocal, TransactionLocal } from '../types';
import { formatMXN } from '../utils/finance';

interface BudgetsViewProps {
  budgets: BudgetLocal[];
  categories: CategoryLocal[];
  transactions: TransactionLocal[];
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({ budgets, categories, transactions }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !limit) return;

    const now = new Date().toISOString();
    await db.budgets.add({
      id: crypto.randomUUID(),
      user_id: 'user-financias-mx',
      category_id: categoryId,
      monthly_limit: parseFloat(limit),
      created_at: now,
      updated_at: now,
      sync_status: 'created',
    });

    setLimit('');
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    await db.budgets.delete(id);
  };

  // Calcular gasto real por categoría en el mes actual
  const currentMonth = new Date().toISOString().substring(0, 7);
  const getCategoryActualExpense = (catId: string) => {
    return transactions
      .filter((t) => t.category_id === catId && t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">MÓDULO DE PRESUPUESTOS</h2>
          <p className="text-xs text-slate-500">Comparativa de Presupuesto Asignado (Actual) vs. Gasto Efectivo (Real)</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'CANCELAR' : 'ASIGNAR PRESUPUESTO'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="app-card p-5 space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-slate-800">Definir Límite Mensual de Gastos</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Categoría</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Límite Mensual (MXN $)</label>
              <input
                type="number"
                step="0.01"
                placeholder="5000.00"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs uppercase rounded-xl transition"
          >
            GUARDAR PRESUPUESTO
          </button>
        </form>
      )}

      {/* Tabla de Presupuestos (Actual vs Real) */}
      <div className="app-card p-5 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">PRESUPUESTOS MENSUALES</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Categoría</th>
                <th className="py-2.5 px-4 text-right">Límite (Actual)</th>
                <th className="py-2.5 px-4 text-right bg-emerald-50 text-emerald-900">Gasto Real</th>
                <th className="py-2.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {budgets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400 font-normal">
                    No hay presupuestos definidos (Todo en 0 MXN)
                  </td>
                </tr>
              ) : (
                budgets.map((b) => {
                  const category = categories.find((c) => c.id === b.category_id);
                  const actualExpense = getCategoryActualExpense(b.category_id);
                  const isOverBudget = actualExpense > b.monthly_limit;

                  return (
                    <tr key={b.id}>
                      <td className="py-3 px-4 font-bold">{category?.name || 'Categoría Generica'}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">{formatMXN(b.monthly_limit)}</td>
                      <td
                        className={`py-3 px-4 text-right font-bold bg-emerald-50/50 ${
                          isOverBudget ? 'text-rose-600 font-extrabold' : 'text-emerald-700'
                        }`}
                      >
                        {formatMXN(actualExpense)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
