// Componente Compacto de Alertas de Pagos Próximos (Deduplicado y Frecuencia Diaria de Notificaciones del Sistema)
import React, { useEffect } from 'react';
import { AlertCircle, Bell, ChevronRight } from 'lucide-react';
import type { AccountLocal, LoanPaymentLocal, UpcomingPaymentAlert } from '../types';
import { formatMXN } from '../utils/finance';

interface PaymentAlertBannerProps {
  accounts: AccountLocal[];
  loanPayments: LoanPaymentLocal[];
  onOpenNewTransaction: () => void;
}

export const PaymentAlertBanner: React.FC<PaymentAlertBannerProps> = ({
  accounts,
  loanPayments,
  onOpenNewTransaction,
}) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentDay = today.getDate();

  const alertsMap = new Map<string, UpcomingPaymentAlert>();

  // 1. Detectar tarjetas de crédito únicas con fecha límite de pago cercana (próximos 7 días)
  accounts
    .filter((a) => a.type === 'credit_card' && !a.deleted_at && a.payment_due_day)
    .forEach((a) => {
      const dueDay = a.payment_due_day || 5;
      let daysRemaining = dueDay - currentDay;
      if (daysRemaining < 0) {
        daysRemaining += 30;
      }

      if (daysRemaining <= 7) {
        alertsMap.set(`tdc-${a.id}`, {
          id: a.id,
          title: `TDC ${a.name}`,
          subtitle: `Corte: Día ${a.cutoff_day || 15} • Límite pago: Día ${dueDay}`,
          amount: a.current_balance,
          dueDate: `Día ${dueDay}`,
          daysRemaining,
          type: 'tdc',
        });
      }
    });

  // 2. Detectar amortizaciones de préstamos pendientes cercanas
  loanPayments
    .filter((p) => p.status === 'pending' && !p.deleted_at)
    .forEach((p) => {
      const account = accounts.find((a) => a.id === p.account_id);
      if (!account) return;

      const dueDate = new Date(p.due_date);
      const diffTime = dueDate.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 7 && daysRemaining >= -30) {
        alertsMap.set(`loan-${p.id}`, {
          id: p.id,
          title: `Préstamo ${account.name}`,
          subtitle: `Cuota #${p.installment_number} por vencer`,
          amount: p.amount,
          dueDate: p.due_date,
          daysRemaining,
          type: 'loan',
        });
      }
    });

  const upcomingAlerts = Array.from(alertsMap.values());

  // Emitir Notificación Web del Sistema Máximo 1 Vez al Día
  useEffect(() => {
    if (upcomingAlerts.length === 0 || !('Notification' in window)) return;

    const lastNotifiedDate = localStorage.getItem('last_payment_alert_notification_date');
    
    // Si no se ha notificado hoy
    if (lastNotifiedDate !== todayStr) {
      if (Notification.permission === 'granted') {
        const topAlert = upcomingAlerts[0];
        new Notification(`Alerta Mis Tarjetas: ${topAlert.title}`, {
          body: `Vence pronto (${topAlert.dueDate}). Monto: $${topAlert.amount.toLocaleString()} MXN`,
          icon: '/pwa-192x192.png',
        });
        localStorage.setItem('last_payment_alert_notification_date', todayStr);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, [upcomingAlerts.length, todayStr]);

  if (upcomingAlerts.length === 0) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-[11px] uppercase tracking-wider">
          <Bell className="w-3.5 h-3.5 text-amber-600" />
          <span>PAGOS PRÓXIMOS POR VENCER ({upcomingAlerts.length})</span>
        </div>
        <button
          onClick={onOpenNewTransaction}
          className="text-[10px] font-bold text-amber-900 hover:text-amber-700 flex items-center gap-1 bg-amber-200/80 px-2 py-0.5 rounded-lg transition"
        >
          <span>Pagar</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Lista Compacta de Alertas en 1 o 2 Columnas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {upcomingAlerts.map((alert) => (
          <div
            key={alert.id}
            className="p-2.5 bg-white rounded-xl border border-amber-200/80 flex items-center justify-between text-xs shadow-2xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-xs truncate">{alert.title}</h4>
                <span className="text-[10px] text-slate-500 font-medium truncate block">{alert.subtitle}</span>
              </div>
            </div>

            <div className="text-right shrink-0 ml-2">
              <span className="font-extrabold text-xs text-slate-900 block">{formatMXN(alert.amount)}</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                  alert.daysRemaining <= 2
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {alert.daysRemaining <= 0 ? 'Vence hoy' : `En ${alert.daysRemaining}d`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
