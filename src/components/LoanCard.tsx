// Componente de Préstamo Personal Colapsable con Historial de Amortizaciones y Marcado Manual de Pagos
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Landmark, Calendar, CheckCircle2, Clock, Pencil, Trash2 } from 'lucide-react';
import type { AccountLocal, LoanPaymentLocal } from '../types';
import { formatMXN } from '../utils/finance';
import { db } from '../db/schema';

interface LoanCardProps {
  account: AccountLocal;
  loanPayments: LoanPaymentLocal[];
  onEdit?: () => void;
  onDelete?: () => void;
}

export const LoanCard: React.FC<LoanCardProps> = ({
  account,
  loanPayments,
  onEdit,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const totalAmount = account.total_loan_amount || account.current_balance;
  const totalInstallments = account.total_installments || 1;
  const remainingInstallments = account.remaining_installments ?? totalInstallments;
  const completedInstallments = Math.max(0, totalInstallments - remainingInstallments);
  const progressPercent = (completedInstallments / totalInstallments) * 100;
  const installmentAmount = account.loan_installment_amount || (totalAmount / totalInstallments);

  // Filtrar pagos de amortizaciones para este préstamo
  const accountPayments = loanPayments
    .filter((p) => p.account_id === account.id && !p.deleted_at)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  // Función para marcar manualmente un pago como realizado
  const handleMarkPaymentAsPaid = async (payment: LoanPaymentLocal) => {
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];

    // 1. Actualizar estado del pago en IndexedDB
    await db.loan_payments.update(payment.id, {
      status: 'paid',
      paid_date: today,
      updated_at: now,
      sync_status: 'updated',
    });

    // 2. Descontar la cuota del saldo del préstamo y reducir pagos pendientes
    const newRemaining = Math.max(0, remainingInstallments - 1);
    const newBalance = Math.max(0, account.current_balance - payment.amount);

    await db.accounts.update(account.id, {
      current_balance: newBalance,
      remaining_installments: newRemaining,
      updated_at: now,
      sync_status: 'updated',
    });

    // 3. Registrar la transacción de abono al préstamo
    await db.transactions.add({
      id: crypto.randomUUID(),
      user_id: account.user_id,
      account_id: account.id,
      amount: payment.amount,
      type: 'expense',
      description: `Pago Cuota ${payment.installment_number}/${totalInstallments} - ${account.name}`,
      date: today,
      is_reconciled: true,
      created_at: now,
      updated_at: now,
      sync_status: 'created',
    });
  };

  return (
    <div className="app-card bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-200">
      {/* Encabezado Colapsado (Datos Mínimos + Progreso) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition select-none gap-2"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="p-2.5 rounded-xl text-white shadow-sm flex items-center justify-center shrink-0"
            style={{ backgroundColor: account.color_hex || '#78350f' }}
          >
            <Landmark className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{account.name}</h3>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0">
                PRÉSTAMO ({account.loan_frequency || 'mensual'})
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate block">
              {account.institution || 'Entidad'} • {completedInstallments}/{totalInstallments} pagos hechos
            </span>
          </div>
        </div>

        {/* Saldo a la Derecha + Flecha de Descolapso */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className="font-extrabold text-xs sm:text-sm text-slate-900 block">
              {formatMXN(account.current_balance)}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Deuda Pendiente
            </span>
          </div>

          <button
            type="button"
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition shrink-0 active:scale-95"
            aria-label={isExpanded ? 'Colapsar préstamo' : 'Descolapsar préstamo'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Detalle Descolapsado (Métricas, Historial de Cuotas y Marcado Manual) */}
      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in fade-in duration-150 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 text-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px]">Monto Original</span>
              <span className="font-bold text-slate-900">{formatMXN(totalAmount)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Monto por Cuota</span>
              <span className="font-extrabold text-amber-700">{formatMXN(installmentAmount)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Pagos Realizados</span>
              <span className="font-bold text-emerald-600">{completedInstallments} de {totalInstallments}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Pagos Pendientes</span>
              <span className="font-bold text-rose-600">{remainingInstallments} restantes</span>
            </div>
          </div>

          {/* Barra de Progreso de Amortización */}
          <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
              <span>Progreso de Pagos</span>
              <span>{progressPercent.toFixed(0)}% Completado</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Historial de Fechas y Amortizaciones */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-600" />
              HISTORIAL DE PAGOS DE AMORTIZACIÓN
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {accountPayments.length === 0 ? (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-[11px]">
                  No hay fechas de amortización registradas. Puedes marcar la siguiente cuota vencida.
                </div>
              ) : (
                accountPayments.map((p) => {
                  const isPaid = p.status === 'paid';
                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition ${
                        isPaid
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {isPaid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold text-xs block">
                            Cuota #{p.installment_number} de {totalInstallments} - {formatMXN(p.amount)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Vence: {p.due_date} {isPaid && `• Pagado el ${p.paid_date}`}
                          </span>
                        </div>
                      </div>

                      {!isPaid && (
                        <button
                          type="button"
                          onClick={() => handleMarkPaymentAsPaid(p)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-xl shadow transition active:scale-95"
                        >
                          Marcar Pago Realizado
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Botones de Acción Táctil Integrados Mobile-First */}
          {(onEdit || onDelete) && (
            <div className="flex items-center justify-end gap-2 border-t border-slate-200/80 pt-3">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold text-xs shadow-sm transition active:scale-95"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Editar Préstamo</span>
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold text-xs shadow-sm transition active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
