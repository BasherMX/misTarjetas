// Componente de Tarjeta de Crédito / Cuenta Colapsable con Acciones Mobile-First Integradas
import React, { useState } from 'react';
import { Wifi, TrendingUp, ChevronDown, ChevronUp, CreditCard, Pencil, Trash2, BarChart2 } from 'lucide-react';
import type { AccountLocal, MsiPlanLocal } from '../types';
import { calculateTdcMetrics, formatMXN } from '../utils/finance';

interface TdcCardProps {
  account: AccountLocal;
  msiPlans: MsiPlanLocal[];
  defaultExpanded?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onOpenDetail?: () => void;
}

export const TdcCard: React.FC<TdcCardProps> = ({
  account,
  msiPlans,
  defaultExpanded = false,
  onEdit,
  onDelete,
  onOpenDetail,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const metrics = calculateTdcMetrics(account, msiPlans);

  const cardMsiPlans = msiPlans.filter(
    (p) => p.account_id === account.id && p.remaining_installments > 0 && !p.deleted_at
  );

  const getBadgeStyle = () => {
    switch (metrics.utilizationStatus) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const renderCardBrandLogo = () => {
    const brand = account.card_brand || 'mastercard';
    if (brand === 'visa') {
      return (
        <span className="font-extrabold italic text-lg tracking-tighter text-white drop-shadow">
          VISA
        </span>
      );
    }
    if (brand === 'amex') {
      return (
        <span className="font-black text-xs px-1.5 py-0.5 bg-blue-400 text-slate-950 rounded tracking-wider">
          AMEX
        </span>
      );
    }
    return (
      <div className="flex items-center -space-x-2">
        <div className="w-5 h-5 rounded-full bg-rose-600 opacity-90 shadow-sm" />
        <div className="w-5 h-5 rounded-full bg-amber-400 opacity-90 shadow-sm" />
      </div>
    );
  };

  const isCreditCard = account.type === 'credit_card';

  return (
    <div className="app-card bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-200">
      {/* Encabezado Colapsado (Datos Mínimos + Acciones Táctiles Integradas) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition select-none gap-2"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="p-2.5 rounded-xl text-white shadow-sm flex items-center justify-center shrink-0"
            style={{ backgroundColor: account.color_hex || '#1e3a8a' }}
          >
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{account.name}</h3>
              {isCreditCard && (
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">
                  {account.card_brand || 'mastercard'}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate block">
              {account.institution || 'Banco'} • {account.type.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Resumen a la Derecha + Flecha de Descolapso */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className="font-extrabold text-xs sm:text-sm text-slate-900 block">
              {formatMXN(account.current_balance)}
            </span>
            {isCreditCard && (
              <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle()}`}>
                {metrics.utilizationPercentage.toFixed(0)}% uso
              </span>
            )}
          </div>

          <button
            type="button"
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition shrink-0 active:scale-95"
            aria-label={isExpanded ? 'Colapsar tarjeta' : 'Descolapsar tarjeta'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Detalle Descolapsado (Información Completa + Botones de Edición Integrados Mobile-First) */}
      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in fade-in duration-150">
          {isCreditCard ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Plástico Personalizable */}
                <div
                  className="md:col-span-5 text-white rounded-2xl p-4 shadow-lg relative overflow-hidden h-40 flex flex-col justify-between border border-white/20"
                  style={{ backgroundColor: account.color_hex || '#1e3a8a' }}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-base tracking-wider text-white">
                      {account.institution || 'Banco'}
                    </span>
                    <Wifi className="w-4 h-4 text-white/80 rotate-90" />
                  </div>

                  <div className="flex items-center gap-3 my-1">
                    <div className="credit-card-chip shadow" />
                    <span className="text-xs font-mono tracking-widest text-white/90">•••• •••• •••• 4892</span>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-white/70 block">Titular</span>
                      <span className="text-xs font-bold tracking-wide">ULISES G.</span>
                    </div>
                    <div>{renderCardBrandLogo()}</div>
                  </div>
                </div>

                {/* Panel de Métricas */}
                <div className="md:col-span-7 space-y-2.5 text-xs text-slate-700">
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Límite de Crédito</span>
                      <span className="font-extrabold text-base text-slate-900">{formatMXN(metrics.creditLimit)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 text-[11px] font-semibold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Disp: {formatMXN(metrics.availableCredit)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Deuda Revolvente</span>
                      <span className="font-bold text-slate-900">{formatMXN(metrics.currentBalance)}</span>
                    </div>

                    <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-emerald-800 block text-[10px] font-medium">Pago No Generar Intereses</span>
                      <span className="font-extrabold text-emerald-700">{formatMXN(metrics.payToAvoidInterest)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200 text-[11px]">
                    <span className="text-slate-600 font-medium">
                      Fecha Corte: <strong>Día {account.cutoff_day || 15}</strong> / Pago: <strong>Día {account.payment_due_day || 5}</strong>
                    </span>
                    <span className="text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded">
                      CAT {account.interest_rate_cat || 45}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Pagos Diferidos (MSI) */}
              {cardMsiPlans.length > 0 && (
                <div className="border-t border-slate-200 pt-3 space-y-2">
                  <h4 className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">COMPRAS A MESES SIN INTERESES (MSI)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cardMsiPlans.map((plan) => {
                      const completed = plan.total_installments - plan.remaining_installments;
                      const pct = (completed / plan.total_installments) * 100;
                      return (
                        <div key={plan.id} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800">{plan.description}</span>
                            <span className="text-[10px] font-bold text-blue-700">
                              {plan.remaining_installments} / {plan.total_installments} Rest.
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex justify-between items-center">
              <span className="text-slate-600 font-medium">Saldo Líquido Registrado</span>
              <span className="font-extrabold text-sm text-slate-900">{formatMXN(account.current_balance)}</span>
            </div>
          )}

          {/* Botones de Acción Táctil Integrados en la Tarjeta Descolapsada */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-200/80 pt-3">
            {onOpenDetail && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetail();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl font-bold text-xs shadow-sm transition active:scale-95"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Ver Detalle & Fluctuaciones</span>
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs shadow-sm transition active:scale-95"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Editar Tarjeta</span>
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
        </div>
      )}
    </div>
  );
};
