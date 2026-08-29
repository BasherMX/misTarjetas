// Vista de Ajustes, Perfil y Limpieza de Datos
import React from 'react';
import { RefreshCw, Trash2, Database, Smartphone } from 'lucide-react';
import { seedRealisticDemoData } from '../db/seedData';
import { db } from '../db/schema';

interface SettingsViewProps {
  isOnline: boolean;
  isSyncing: boolean;
  onSync: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ isOnline, isSyncing, onSync }) => {
  const handleResetAndSeedDemoData = async () => {
    if (
      confirm(
        '¿Deseas reiniciar la base de datos y cargar el set de datos ficticios desde Enero 2026? (3 TDC, 2 Cuentas Ahorro/Débito, 1 Préstamo e historial completo de transacciones).'
      )
    ) {
      await seedRealisticDemoData();
      alert('Se han cargado 3 Tarjetas de Crédito, 2 Cuentas de Ahorro/Débito, 1 Préstamo e historial completo de transacciones.');
    }
  };

  const handleClearAll = async () => {
    if (confirm('¿Deseas vaciar completamente la base de datos a 0?')) {
      await db.accounts.clear();
      await db.categories.clear();
      await db.transactions.clear();
      await db.msi_plans.clear();
      await db.loan_payments.clear();
      await db.budgets.clear();
      alert('Base de datos vaciada por completo.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">CONFIGURACIÓN & AJUSTES</h2>
        <p className="text-xs text-slate-500">Gestión de perfil, sincronización Local-First y restablecimiento de datos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sincronización y Estado PWA */}
        <div className="app-card p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-teal-600" />
            ESTADO PWA & SYNC
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700">Estado de Conexión</span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded-full ${
                  isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isOnline ? 'En línea' : 'Modo Offline'}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700">Motor Local-First</span>
              <span className="font-bold text-teal-700">Dexie.js IndexedDB</span>
            </div>

            <button
              onClick={onSync}
              disabled={isSyncing || !isOnline}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase rounded-xl transition flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar con Supabase'}</span>
            </button>
          </div>
        </div>

        {/* Carga de Datos Ficticios & Limpieza */}
        <div className="app-card p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-600" />
            DATOS & RESTABLECIMIENTO
          </h3>

          <p className="text-xs text-slate-500">
            Puedes cargar una simulación completa con 3 Tarjetas de Crédito, 2 Cuentas de Débito/Ahorro, 1 Préstamo y transacciones históricas desde Enero de 2026.
          </p>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleResetAndSeedDemoData}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs uppercase rounded-xl transition flex items-center justify-center gap-2 shadow"
            >
              <Database className="w-4 h-4" />
              <span>CARGAR DATOS FICTICIOS (ENERO 2026 A LA FECHA)</span>
            </button>

            <button
              onClick={handleClearAll}
              className="w-full py-2 bg-slate-100 hover:bg-rose-50 text-rose-700 font-bold text-xs uppercase rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar Todo a 0</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
