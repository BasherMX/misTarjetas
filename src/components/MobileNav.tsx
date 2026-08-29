// Navegación Inferior Mobile-First con tonos azules para Mis Tarjetas
import React from 'react';
import { Home, Wallet, Plus, PieChart, Settings } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewTransaction: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
}) => {
  const primaryNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'cuentas', label: 'Cuentas', icon: Wallet },
  ];

  const secondaryNavItems = [
    { id: 'presupuestos', label: 'Presupuesto', icon: PieChart },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <>
      {/* Botón Flotante (FAB) "Registrar" para Escritorio */}
      <button
        onClick={onOpenNewTransaction}
        className="fixed bottom-6 right-6 z-50 hidden md:flex items-center gap-2 px-5 py-3.5 rounded-full blue-header-gradient text-white font-extrabold shadow-2xl hover:scale-105 active:scale-95 transition border border-white/20 uppercase text-xs tracking-wider"
        title="Registrar (Acceso Rápido)"
      >
        <Plus className="w-5 h-5 text-blue-200 stroke-[3]" />
        <span>REGISTRAR</span>
      </button>

      {/* Barra de Navegación Inferior Móvil (Mobile-First PWA) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f172a] border-t border-slate-800 px-3 py-1.5 flex items-center justify-between text-slate-300 shadow-2xl backdrop-blur-md">
        <div className="flex items-center space-x-2">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
                  isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Botón Central Destacado (+) REGISTRAR GASTO */}
        <button
          onClick={onOpenNewTransaction}
          className="-mt-5 w-13 h-13 rounded-full blue-header-gradient text-white flex items-center justify-center shadow-lg ring-4 ring-[#0f172a] active:scale-90 transition"
          aria-label="Registrar Gasto"
        >
          <Plus className="w-7 h-7 text-white stroke-[3]" />
        </button>

        <div className="flex items-center space-x-2">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
                  isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
