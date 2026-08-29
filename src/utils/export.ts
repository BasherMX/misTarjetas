// Servicios de exportación cliente a Excel (SheetJS) y PDF (jsPDF) con Descarga Robusta de Blobs
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AccountLocal, TransactionLocal, MsiPlanLocal } from '../types';
import { formatMXN } from './finance';

// Helper robusto para forzar descarga de archivos Blob en navegadores de Escritorio y Móviles
function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

export function exportToExcel(
  accounts: AccountLocal[],
  transactions: TransactionLocal[],
  msiPlans: MsiPlanLocal[]
) {
  try {
    const wb = XLSX.utils.book_new();

    // Hoja 1: Cuentas e Instrumentos
    const accountsData = accounts.map((acc) => ({
      Nombre: acc.name,
      Tipo: acc.type.toUpperCase(),
      Banco: acc.institution || 'N/A',
      'Saldo Actual (MXN)': acc.current_balance,
      'Límite Crédito (MXN)': acc.credit_limit || 0,
      'Día Corte': acc.cutoff_day || 'N/A',
      'Día Límite Pago': acc.payment_due_day || 'N/A',
    }));
    const wsAccounts = XLSX.utils.json_to_sheet(accountsData);
    XLSX.utils.book_append_sheet(wb, wsAccounts, 'Cuentas');

    // Hoja 2: Transacciones
    const txData = transactions.map((t) => ({
      Fecha: t.date,
      Tipo: t.type.toUpperCase(),
      Concepto: t.description,
      'Monto (MXN)': t.amount,
      Conciliado: t.is_reconciled ? 'SI' : 'NO',
    }));
    const wsTx = XLSX.utils.json_to_sheet(txData);
    XLSX.utils.book_append_sheet(wb, wsTx, 'Transacciones');

    // Hoja 3: Meses Sin Intereses (MSI)
    const msiData = msiPlans.map((m) => ({
      Descripción: m.description,
      'Monto Total (MXN)': m.total_amount,
      'Cuota Mensual (MXN)': m.monthly_installment,
      'Pagos Faltantes': `${m.remaining_installments} / ${m.total_installments}`,
      'Fecha Compra': m.purchase_date,
    }));
    const wsMsi = XLSX.utils.json_to_sheet(msiData);
    XLSX.utils.book_append_sheet(wb, wsMsi, 'Planes MSI');

    // Generar buffer de array en formato XLSX real
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    const dateStr = new Date().toISOString().split('T')[0];
    triggerBlobDownload(blob, `MisTarjetas_Reporte_${dateStr}.xlsx`);
  } catch (error) {
    console.error('Error exportando Excel:', error);
    alert('Ocurrió un error al generar el archivo Excel.');
  }
}

export function exportToPdf(
  accounts: AccountLocal[],
  transactions: TransactionLocal[]
) {
  try {
    const doc = new jsPDF();

    // Título y encabezado
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138); // blue-900
    doc.text('Mis Tarjetas - Reporte Financiero Personal (MXN)', 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-MX')} ${new Date().toLocaleTimeString('es-MX')}`, 14, 26);

    // Tabla 1: Resumen de Cuentas
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Resumen de Cuentas e Instrumentos', 14, 36);

    const accountRows = accounts.map((acc) => [
      acc.name,
      acc.type.toUpperCase(),
      acc.institution || 'N/A',
      formatMXN(acc.current_balance),
      acc.credit_limit ? formatMXN(acc.credit_limit) : 'N/A',
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Cuenta', 'Tipo', 'Banco', 'Saldo', 'Límite Crédito']],
      body: accountRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138] }, // blue-900
      styles: { fontSize: 8 },
    });

    // Tabla 2: Transacciones
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.setFontSize(11);
    doc.text('Movimientos Recientes', 14, finalY + 12);

    const txRows = transactions.slice(0, 30).map((t) => [
      t.date,
      t.description,
      t.type.toUpperCase(),
      formatMXN(t.amount),
    ]);

    autoTable(doc, {
      startY: finalY + 16,
      head: [['Fecha', 'Concepto', 'Tipo', 'Monto']],
      body: txRows,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }, // blue-500
      styles: { fontSize: 8 },
    });

    // Generar PDF Blob y forzar descarga limpia con extensión .pdf
    const pdfBlob = doc.output('blob');
    const dateStr = new Date().toISOString().split('T')[0];
    triggerBlobDownload(pdfBlob, `MisTarjetas_Reporte_${dateStr}.pdf`);
  } catch (error) {
    console.error('Error exportando PDF:', error);
    alert('Ocurrió un error al generar el archivo PDF.');
  }
}
