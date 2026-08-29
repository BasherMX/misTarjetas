// Sidebar lateral azul slate (#0f172a / #1e293b) para Mis Tarjetas
import React from 'react';
import { Home, Wallet, Tag, Calendar, ArrowRightLeft, PieChart, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'cuentas', label: 'Cuentas', icon: Wallet },
    { id: 'categoria', label: 'Categoría', icon: Tag },
    { id: 'presupuestos', label: 'Presupuestos', icon: PieChart },
    { id: 'fecha', label: 'Fecha', icon: Calendar },
    { id: 'gasto', label: 'Movimientos', icon: ArrowRightLeft },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 bg-[#0f172a] text-slate-200 hidden md:flex flex-col p-3 border-r border-slate-800 shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
      <div className="space-y-1.5 mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition ${
                isActive
                  ? 'bg-blue-600/40 text-white font-bold border-l-4 border-blue-400 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
