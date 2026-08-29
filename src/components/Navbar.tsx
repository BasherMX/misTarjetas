// Header superior para Mis Tarjetas (Gradiente Azul + Estado Sincronizado)
import React from 'react';
import { CreditCard, RefreshCw, PlusCircle, Download, FileText } from 'lucide-react';

interface NavbarProps {
  isOnline: boolean;
  isSyncing: boolean;
  onSync: () => void;
  onOpenNewTransaction: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isOnline,
  isSyncing,
  onSync,
  onOpenNewTransaction,
  onExportExcel,
  onExportPdf,
}) => {
  return (
    <header className="sticky top-0 z-40 blue-header-gradient text-white shadow-lg px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Marca Mis Tarjetas */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <CreditCard className="w-6 h-6 text-blue-200" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider text-white flex items-center gap-2">
              Mis <span className="text-blue-300 font-extrabold">Tarjetas</span>
            </h1>
            <p className="text-[11px] text-blue-100/80">Finanzas Personales PWA & Local-First</p>
          </div>
        </div>

        {/* Acciones de Sincronización y Accesos Rápidos */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onSync}
            disabled={isSyncing || !isOnline}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 hover:bg-black/30 border border-white/20 text-xs font-semibold text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-300' : 'text-blue-300'}`} />
            <span className="hidden sm:inline text-blue-100">
              {isSyncing ? 'Sincronizando...' : isOnline ? 'Sincronizado' : 'Modo Offline'}
            </span>
          </button>

          <div className="flex items-center gap-1.5 bg-black/15 p-1 rounded-xl border border-white/10">
            <button
              onClick={onExportExcel}
              className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-300 transition"
              title="Exportar a Excel"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onExportPdf}
              className="p-1.5 rounded-lg hover:bg-white/10 text-rose-300 transition"
              title="Exportar a PDF"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs sm:text-sm shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Registrar</span>
          </button>

          {/* Avatar Usuario */}
          <div className="w-8 h-8 rounded-full bg-blue-900 border-2 border-white/30 text-white font-bold flex items-center justify-center text-xs shadow">
            MT
          </div>
        </div>
      </div>
    </header>
  );
};
