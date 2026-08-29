// Vista de Calendario de Fechas de Corte y Límites de Pago de TDC
import React from 'react';
import { Calendar as CalendarIcon, CreditCard, AlertCircle } from 'lucide-react';
import type { AccountLocal } from '../types';

interface CalendarViewProps {
  accounts: AccountLocal[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ accounts }) => {
  const tdcAccounts = accounts.filter((a) => a.type === 'credit_card' && !a.deleted_at);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">CALENDARIO DE FECHAS CLAVE TDC</h2>
        <p className="text-xs text-slate-500">Programación de días de corte y fechas límite de pago</p>
      </div>

      {tdcAccounts.length === 0 ? (
        <div className="app-card p-8 text-center text-slate-400 font-medium">
          No hay tarjetas de crédito registradas para mostrar fechas de corte.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tdcAccounts.map((account) => (
            <div key={account.id} className="app-card p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{account.name}</h3>
                  <span className="text-xs text-slate-500">{account.institution}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Día de Corte</span>
                    <span className="font-extrabold text-slate-800 text-sm">Cada día {account.cutoff_day || 15}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Límite de Pago</span>
                    <span className="font-extrabold text-slate-800 text-sm">Cada día {account.payment_due_day || 5}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-amber-50/70 p-2.5 rounded-lg border border-amber-100">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Recuerda realizar tu pago para no generar intereses antes del día {account.payment_due_day || 5}.
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
