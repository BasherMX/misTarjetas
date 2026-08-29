// Vista Cuentas con Registro/Edición Completa y Botón Ver Detalle & Fluctuaciones por Tarjeta
import React, { useState } from 'react';
import { Plus, Trash2, Pencil, X, CreditCard, Landmark, Banknote, BarChart2 } from 'lucide-react';
import { db } from '../db/schema';
import type { AccountLocal, AccountType, CardBrand, LoanFrequency, MsiPlanLocal, LoanPaymentLocal, TransactionLocal, CategoryLocal } from '../types';
import { TdcCard } from '../components/TdcCard';
import { LoanCard } from '../components/LoanCard';
import { AccountDetailModal } from '../components/AccountDetailModal';
import { formatMXN } from '../utils/finance';

interface AccountsViewProps {
  accounts: AccountLocal[];
  msiPlans: MsiPlanLocal[];
  loanPayments: LoanPaymentLocal[];
  transactions: TransactionLocal[];
  categories: CategoryLocal[];
}

const PRESET_COLORS = [
  { id: '#1e3a8a', label: 'Azul Marino', bg: 'bg-blue-900' },
  { id: '#064e3b', label: 'Verde Esmeralda', bg: 'bg-emerald-900' },
  { id: '#881337', label: 'Vino / Borgoña', bg: 'bg-rose-950' },
  { id: '#0f172a', label: 'Negro Noche', bg: 'bg-slate-900' },
  { id: '#78350f', label: 'Oro / Dorado', bg: 'bg-amber-900' },
  { id: '#581c87', label: 'Púrpura', bg: 'bg-purple-900' },
  { id: '#334155', label: 'Gris Metálico', bg: 'bg-slate-700' },
];

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  msiPlans,
  loanPayments,
  transactions,
  categories,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [selectedDetailAccount, setSelectedDetailAccount] = useState<AccountLocal | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('credit_card');
  const [cardBrand, setCardBrand] = useState<CardBrand>('mastercard');
  const [colorHex, setColorHex] = useState('#1e3a8a');
  const [institution, setInstitution] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [cutoffDay, setCutoffDay] = useState('15');
  const [paymentDueDay, setPaymentDueDay] = useState('5');
  const [catRate, setCatRate] = useState('45');

  // Campos de Préstamos
  const [totalLoanAmount, setTotalLoanAmount] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('12');
  const [remainingInstallments, setRemainingInstallments] = useState('12');
  const [loanFrequency, setLoanFrequency] = useState<LoanFrequency>('mensual');
  const [loanInstallmentAmount, setLoanInstallmentAmount] = useState('');
  const [loanNextPaymentDate, setLoanNextPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const startEdit = (acc: AccountLocal) => {
    setEditingAccountId(acc.id);
    setName(acc.name);
    setType(acc.type);
    setCardBrand(acc.card_brand || 'mastercard');
    setColorHex(acc.color_hex || (acc.type === 'loan' ? '#78350f' : '#1e3a8a'));
    setInstitution(acc.institution || '');
    setCurrentBalance(acc.current_balance ? String(acc.current_balance) : '0');
    setCreditLimit(acc.credit_limit ? String(acc.credit_limit) : '0');
    setCutoffDay(acc.cutoff_day ? String(acc.cutoff_day) : '15');
    setPaymentDueDay(acc.payment_due_day ? String(acc.payment_due_day) : '5');
    setCatRate(acc.interest_rate_cat ? String(acc.interest_rate_cat) : '45');

    if (acc.type === 'loan') {
      setTotalLoanAmount(acc.total_loan_amount ? String(acc.total_loan_amount) : String(acc.current_balance));
      setTotalInstallments(acc.total_installments ? String(acc.total_installments) : '12');
      setRemainingInstallments(acc.remaining_installments ? String(acc.remaining_installments) : '12');
      setLoanFrequency(acc.loan_frequency || 'mensual');
      setLoanInstallmentAmount(acc.loan_installment_amount ? String(acc.loan_installment_amount) : '');
      setLoanNextPaymentDate(acc.loan_next_payment_date || new Date().toISOString().split('T')[0]);
    }

    setIsFormOpen(true);
  };

  const resetForm = () => {
    setEditingAccountId(null);
    setName('');
    setType('credit_card');
    setCardBrand('mastercard');
    setColorHex('#1e3a8a');
    setInstitution('');
    setCurrentBalance('');
    setCreditLimit('');
    setCutoffDay('15');
    setPaymentDueDay('5');
    setCatRate('45');
    setTotalLoanAmount('');
    setTotalInstallments('12');
    setRemainingInstallments('12');
    setLoanFrequency('mensual');
    setLoanInstallmentAmount('');
    setLoanNextPaymentDate(new Date().toISOString().split('T')[0]);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const now = new Date().toISOString();
    const isLoan = type === 'loan';
    const parsedTotalLoan = isLoan ? parseFloat(totalLoanAmount) || parseFloat(currentBalance) || 0 : undefined;
    const parsedTotalInst = isLoan ? parseInt(totalInstallments) || 12 : undefined;
    const parsedRemInst = isLoan ? parseInt(remainingInstallments) || parsedTotalInst || 12 : undefined;
    const parsedCuota = isLoan
      ? parseFloat(loanInstallmentAmount) || (parsedTotalLoan && parsedTotalInst ? parsedTotalLoan / parsedTotalInst : 0)
      : undefined;

    if (editingAccountId) {
      await db.accounts.update(editingAccountId, {
        name,
        type,
        institution: institution || 'Banco',
        color_hex: colorHex,
        card_brand: type === 'credit_card' ? cardBrand : undefined,
        current_balance: parseFloat(currentBalance) || parsedTotalLoan || 0,
        credit_limit: type === 'credit_card' ? parseFloat(creditLimit) || 0 : undefined,
        cutoff_day: type === 'credit_card' ? parseInt(cutoffDay) || 15 : undefined,
        payment_due_day: type === 'credit_card' ? parseInt(paymentDueDay) || 5 : undefined,
        interest_rate_cat: type === 'credit_card' ? parseFloat(catRate) || 0 : undefined,
        total_loan_amount: parsedTotalLoan,
        total_installments: parsedTotalInst,
        remaining_installments: parsedRemInst,
        loan_frequency: isLoan ? loanFrequency : undefined,
        loan_installment_amount: parsedCuota,
        loan_next_payment_date: isLoan ? loanNextPaymentDate : undefined,
        updated_at: now,
        sync_status: 'updated',
      });
    } else {
      const accountId = crypto.randomUUID();
      await db.accounts.add({
        id: accountId,
        user_id: 'user-mis-tarjetas',
        name,
        type,
        institution: institution || 'Banco',
        color_hex: colorHex,
        card_brand: type === 'credit_card' ? cardBrand : undefined,
        current_balance: parseFloat(currentBalance) || parsedTotalLoan || 0,
        credit_limit: type === 'credit_card' ? parseFloat(creditLimit) || 0 : undefined,
        cutoff_day: type === 'credit_card' ? parseInt(cutoffDay) || 15 : undefined,
        payment_due_day: type === 'credit_card' ? parseInt(paymentDueDay) || 5 : undefined,
        interest_rate_cat: type === 'credit_card' ? parseFloat(catRate) || 0 : undefined,
        total_loan_amount: parsedTotalLoan,
        total_installments: parsedTotalInst,
        remaining_installments: parsedRemInst,
        loan_frequency: isLoan ? loanFrequency : undefined,
        loan_installment_amount: parsedCuota,
        loan_next_payment_date: isLoan ? loanNextPaymentDate : undefined,
        created_at: now,
        updated_at: now,
        sync_status: 'created',
      });

      if (isLoan && parsedTotalInst && parsedTotalInst > 0) {
        const baseDate = new Date(loanNextPaymentDate || new Date());
        for (let i = 1; i <= parsedTotalInst; i++) {
          const paymentDueDate = new Date(baseDate);
          if (loanFrequency === 'semanal') {
            paymentDueDate.setDate(baseDate.getDate() + (i - 1) * 7);
          } else if (loanFrequency === 'quincenal') {
            paymentDueDate.setDate(baseDate.getDate() + (i - 1) * 15);
          } else {
            paymentDueDate.setMonth(baseDate.getMonth() + (i - 1));
          }

          await db.loan_payments.add({
            id: crypto.randomUUID(),
            user_id: 'user-mis-tarjetas',
            account_id: accountId,
            installment_number: i,
            due_date: paymentDueDate.toISOString().split('T')[0],
            amount: parsedCuota || 0,
            status: i <= (parsedTotalInst - (parsedRemInst || parsedTotalInst)) ? 'paid' : 'pending',
            created_at: now,
            updated_at: now,
            sync_status: 'created',
          });
        }
      }
    }

    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta tarjeta/cuenta?')) {
      await db.accounts.delete(id);
    }
  };

  const creditAndLoanAccounts = accounts.filter(
    (a) => ['credit_card', 'loan'].includes(a.type) && !a.deleted_at
  );
  const liquidAccounts = accounts.filter(
    (a) => ['debit', 'cash', 'savings'].includes(a.type) && !a.deleted_at
  );

  return (
    <div className="space-y-8">
      {/* Modal de Detalle & Estadísticas por Cuenta */}
      <AccountDetailModal
        isOpen={!!selectedDetailAccount}
        onClose={() => setSelectedDetailAccount(null)}
        account={selectedDetailAccount}
        transactions={transactions}
        categories={categories}
        msiPlans={msiPlans}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">GESTIÓN DE CUENTAS & TARJETAS</h2>
          <p className="text-xs text-slate-500">Administra tus Tarjetas de Crédito, Préstamos Personales y Cuentas</p>
        </div>

        <button
          onClick={() => {
            if (isFormOpen) {
              resetForm();
            } else {
              setIsFormOpen(true);
            }
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition"
        >
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isFormOpen ? 'CANCELAR' : 'REGISTRAR TARJETA / PRÉSTAMO'}</span>
        </button>
      </div>

      {/* Formulario de Registro / Edición */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="app-card p-5 space-y-4 animate-in fade-in duration-200 border-blue-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              {editingAccountId ? 'EDITAR INSTRUMENTO' : 'REGISTRAR NUEVO INSTRUMENTO'}
            </h3>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la Cuenta / Préstamo</label>
              <input
                type="text"
                placeholder="Ej. Banamex Clásica, Préstamo Personal HSBC"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Instrumento</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
              >
                <option value="credit_card">Tarjeta de Crédito (TDC)</option>
                <option value="loan">Préstamo Personal</option>
                <option value="debit">Cuenta de Débito</option>
                <option value="cash">Efectivo</option>
                <option value="savings">Ahorro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Institución / Banco / Entidad</label>
              <input
                type="text"
                placeholder="Ej. Banamex, BBVA, HSBC, Financiera"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
              />
            </div>

            {type !== 'loan' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Saldo Actual / Deuda (MXN $)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>
            )}
          </div>

          {type === 'loan' && (
            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-4">
              <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">DATOS DEL PRÉSTAMO PERSONAL</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">Monto Total Contratado (MXN $)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="120000"
                    value={totalLoanAmount}
                    onChange={(e) => setTotalLoanAmount(e.target.value)}
                    required
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">Monto por Cuota / Pago ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="3500"
                    value={loanInstallmentAmount}
                    onChange={(e) => setLoanInstallmentAmount(e.target.value)}
                    required
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">Frecuencia de Pago</label>
                  <select
                    value={loanFrequency}
                    onChange={(e) => setLoanFrequency(e.target.value as LoanFrequency)}
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="semanal">Semanal</option>
                    <option value="quincenal">Quincenal</option>
                    <option value="mensual">Mensual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">Número Total de Pagos</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
                    required
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">Pagos Pendientes Faltantes</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={remainingInstallments}
                    onChange={(e) => setRemainingInstallments(e.target.value)}
                    required
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">Próxima Fecha de Pago</label>
                  <input
                    type="date"
                    value={loanNextPaymentDate}
                    onChange={(e) => setLoanNextPaymentDate(e.target.value)}
                    required
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {type === 'credit_card' && (
            <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-950 mb-1">Marca de la Tarjeta</label>
                  <select
                    value={cardBrand}
                    onChange={(e) => setCardBrand(e.target.value as CardBrand)}
                    className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="mastercard">Mastercard (Círculos Rojo/Amarillo)</option>
                    <option value="visa">Visa (Estilizado)</option>
                    <option value="amex">American Express (AMEX)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-blue-950 mb-1">Color del Plástico</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setColorHex(c.id)}
                        className={`w-7 h-7 rounded-full ${c.bg} transition ${
                          colorHex === c.id ? 'ring-4 ring-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                        }`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-blue-900 mb-1">Límite de Crédito</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="w-full bg-white border border-blue-200 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-blue-900 mb-1">Día de Corte</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={cutoffDay}
                    onChange={(e) => setCutoffDay(e.target.value)}
                    className="w-full bg-white border border-blue-200 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-blue-900 mb-1">Día Límite Pago</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={paymentDueDay}
                    onChange={(e) => setPaymentDueDay(e.target.value)}
                    className="w-full bg-white border border-blue-200 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-blue-900 mb-1">CAT Anual (%)</label>
                  <input
                    type="number"
                    value={catRate}
                    onChange={(e) => setCatRate(e.target.value)}
                    className="w-full bg-white border border-blue-200 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase rounded-xl transition shadow"
          >
            {editingAccountId ? 'GUARDAR CAMBIOS' : 'GUARDAR TARJETA / PRÉSTAMO'}
          </button>
        </form>
      )}

      {/* SECCIÓN 1: TARJETAS DE CRÉDITO Y PRÉSTAMOS */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
            TARJETAS DE CRÉDITO & PRÉSTAMOS ({creditAndLoanAccounts.length})
          </h3>
        </div>

        <div className="space-y-4">
          {creditAndLoanAccounts.length === 0 ? (
            <div className="app-card p-6 text-center text-slate-400 font-medium text-xs">
              No hay tarjetas de crédito o préstamos registrados.
            </div>
          ) : (
            creditAndLoanAccounts.map((account) =>
              account.type === 'loan' ? (
                <LoanCard
                  key={account.id}
                  account={account}
                  loanPayments={loanPayments}
                  onEdit={() => startEdit(account)}
                  onDelete={() => handleDelete(account.id)}
                />
              ) : (
                <TdcCard
                  key={account.id}
                  account={account}
                  msiPlans={msiPlans}
                  defaultExpanded={false}
                  onOpenDetail={() => setSelectedDetailAccount(account)}
                  onEdit={() => startEdit(account)}
                  onDelete={() => handleDelete(account.id)}
                />
              )
            )
          )}
        </div>
      </section>

      {/* SEPARADOR VISUAL DIVIDER */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t-2 border-dashed border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#f0f4f9] px-3 text-[10px] uppercase font-extrabold text-slate-400 tracking-widest">
            SEPARADOR DE INSTRUMENTOS
          </span>
        </div>
      </div>

      {/* SECCIÓN 2: CUENTAS DE DÉBITO, AHORRO Y EFECTIVO */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Landmark className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
            CUENTAS DE DÉBITO, AHORRO & EFECTIVO ({liquidAccounts.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liquidAccounts.length === 0 ? (
            <div className="col-span-2 app-card p-6 text-center text-slate-400 font-medium text-xs">
              No hay cuentas de débito o efectivo registradas.
            </div>
          ) : (
            liquidAccounts.map((account) => (
              <div key={account.id} className="app-card p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2.5 rounded-xl text-white shadow-sm flex items-center justify-center shrink-0"
                      style={{ backgroundColor: account.color_hex || '#059669' }}
                    >
                      {account.type === 'cash' ? <Banknote className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{account.name}</h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {account.institution || 'Banco'} • {account.type.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <span className="font-extrabold text-base text-slate-900">{formatMXN(account.current_balance)}</span>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-2.5">
                  <button
                    onClick={() => setSelectedDetailAccount(account)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition active:scale-95"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Detalle & Fluctuaciones</span>
                  </button>
                  <button
                    onClick={() => startEdit(account)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition active:scale-95"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-lg text-xs font-bold transition active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
