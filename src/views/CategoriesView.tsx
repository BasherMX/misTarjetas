// Vista de Gestión de Categorías con Selector de Icono y Color
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { db } from '../db/schema';
import type { CategoryLocal } from '../types';
import { CategoryIcon, AVAILABLE_ICONS, AVAILABLE_COLORS } from '../components/CategoryIcon';

interface CategoriesViewProps {
  categories: CategoryLocal[];
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ categories }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedIcon, setSelectedIcon] = useState('zap');
  const [selectedColor, setSelectedColor] = useState('#2563eb');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const now = new Date().toISOString();
    await db.categories.add({
      id: crypto.randomUUID(),
      user_id: 'user-mis-tarjetas',
      name,
      type,
      icon: selectedIcon,
      color_hex: selectedColor,
      created_at: now,
      updated_at: now,
      sync_status: 'created',
    });

    setName('');
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      await db.categories.delete(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">GESTIÓN DE CATEGORÍAS</h2>
          <p className="text-xs text-slate-500">Selecciona icono y color personalizado para cada categoría de gastos e ingresos</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'CANCELAR' : 'NUEVA CATEGORÍA'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="app-card p-5 space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-slate-800">Agregar Nueva Categoría</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nombre de la Categoría</label>
              <input
                type="text"
                placeholder="Ej. Sueldo, Bono, Servicios, Comida"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Tipo de Categoría</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
              >
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
              </select>
            </div>
          </div>

          {/* Selector de Iconos */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Selecciona un Icono</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedIcon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedIcon(item.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-[9px] truncate max-w-full">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de Color */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Selecciona un Color</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_COLORS.map((c) => {
                const isSelected = selectedColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    className={`w-8 h-8 rounded-full ${c.bg} transition flex items-center justify-center ${
                      isSelected ? 'ring-4 ring-slate-800 scale-110' : 'opacity-85 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase rounded-xl transition shadow"
          >
            GUARDAR CATEGORÍA
          </button>
        </form>
      )}

      {/* Lista de categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {categories.length === 0 ? (
          <div className="col-span-4 app-card p-8 text-center text-slate-400 font-medium text-xs">
            No hay categorías configuradas actualmente. Presiona "NUEVA CATEGORÍA" para agregar una.
          </div>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="app-card p-3.5 flex justify-between items-center text-xs font-bold shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className="p-2.5 rounded-xl text-white shadow-sm"
                  style={{ backgroundColor: c.color_hex || '#2563eb' }}
                >
                  <CategoryIcon name={c.icon} className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-900 text-sm block font-extrabold">{c.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{c.type.toUpperCase()}</span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(c.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
