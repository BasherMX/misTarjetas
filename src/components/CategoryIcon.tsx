// Librería expandida de iconos y paleta de colores para categorías en Mis Tarjetas
import React from 'react';
import {
  Zap,
  Car,
  Utensils,
  Sparkles,
  ShoppingBag,
  Landmark,
  GraduationCap,
  HeartPulse,
  Wrench,
  Home,
  Gift,
  Plane,
  Film,
  Dumbbell,
  PawPrint,
  Scissors,
  Baby,
  Wifi,
  Smartphone,
  Fuel,
  PiggyBank,
  Briefcase,
  DollarSign,
  Coffee,
  Tag,
} from 'lucide-react';

interface CategoryIconProps {
  name?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4' }) => {
  switch (name) {
    case 'zap':
      return <Zap className={className} />;
    case 'car':
      return <Car className={className} />;
    case 'utensils':
      return <Utensils className={className} />;
    case 'party-popper':
      return <Sparkles className={className} />;
    case 'shopping-bag':
      return <ShoppingBag className={className} />;
    case 'landmark':
      return <Landmark className={className} />;
    case 'graduation-cap':
      return <GraduationCap className={className} />;
    case 'heart-pulse':
      return <HeartPulse className={className} />;
    case 'wrench':
      return <Wrench className={className} />;
    case 'home':
      return <Home className={className} />;
    case 'gift':
      return <Gift className={className} />;
    case 'plane':
      return <Plane className={className} />;
    case 'film':
      return <Film className={className} />;
    case 'dumbbell':
      return <Dumbbell className={className} />;
    case 'paw-print':
      return <PawPrint className={className} />;
    case 'scissors':
      return <Scissors className={className} />;
    case 'baby':
      return <Baby className={className} />;
    case 'wifi':
      return <Wifi className={className} />;
    case 'smartphone':
      return <Smartphone className={className} />;
    case 'fuel':
      return <Fuel className={className} />;
    case 'piggy-bank':
      return <PiggyBank className={className} />;
    case 'briefcase':
      return <Briefcase className={className} />;
    case 'dollar-sign':
      return <DollarSign className={className} />;
    case 'coffee':
      return <Coffee className={className} />;
    default:
      return <Tag className={className} />;
  }
};

export const AVAILABLE_ICONS = [
  { id: 'zap', label: 'Servicios', icon: Zap },
  { id: 'car', label: 'Transporte', icon: Car },
  { id: 'utensils', label: 'Comida', icon: Utensils },
  { id: 'party-popper', label: 'Salidas', icon: Sparkles },
  { id: 'shopping-bag', label: 'Compras Internet', icon: ShoppingBag },
  { id: 'landmark', label: 'Impuestos', icon: Landmark },
  { id: 'graduation-cap', label: 'Educación', icon: GraduationCap },
  { id: 'heart-pulse', label: 'Salud', icon: HeartPulse },
  { id: 'fuel', label: 'Gasolina', icon: Fuel },
  { id: 'home', label: 'Hogar / Renta', icon: Home },
  { id: 'wifi', label: 'Internet / Cable', icon: Wifi },
  { id: 'smartphone', label: 'Celular', icon: Smartphone },
  { id: 'film', label: 'Entretenimiento', icon: Film },
  { id: 'coffee', label: 'Cafeterías', icon: Coffee },
  { id: 'dumbbell', label: 'Gimnasio', icon: Dumbbell },
  { id: 'paw-print', label: 'Mascotas', icon: PawPrint },
  { id: 'scissors', label: 'Estética', icon: Scissors },
  { id: 'baby', label: 'Niños', icon: Baby },
  { id: 'piggy-bank', label: 'Ahorro', icon: PiggyBank },
  { id: 'gift', label: 'Regalos', icon: Gift },
  { id: 'plane', label: 'Viajes', icon: Plane },
  { id: 'wrench', label: 'Reparaciones', icon: Wrench },
  { id: 'briefcase', label: 'Trabajo', icon: Briefcase },
  { id: 'dollar-sign', label: 'Finanzas', icon: DollarSign },
];

export const AVAILABLE_COLORS = [
  { id: '#2563eb', label: 'Azul Real', bg: 'bg-blue-600' },
  { id: '#1d4ed8', label: 'Azul Oscuro', bg: 'bg-blue-700' },
  { id: '#0284c7', label: 'Azul Cielo', bg: 'bg-sky-600' },
  { id: '#06b6d4', label: 'Cian', bg: 'bg-cyan-500' },
  { id: '#6366f1', label: 'Índigo', bg: 'bg-indigo-500' },
  { id: '#10b981', label: 'Esmeralda', bg: 'bg-emerald-500' },
  { id: '#059669', label: 'Verde', bg: 'bg-emerald-600' },
  { id: '#14b8a6', label: 'Teal', bg: 'bg-teal-500' },
  { id: '#eab308', label: 'Amarillo', bg: 'bg-yellow-500' },
  { id: '#f59e0b', label: 'Ámbar', bg: 'bg-amber-500' },
  { id: '#f97316', label: 'Naranja', bg: 'bg-orange-500' },
  { id: '#ef4444', label: 'Rojo', bg: 'bg-red-500' },
  { id: '#f43f5e', label: 'Rosa Vivo', bg: 'bg-rose-500' },
  { id: '#ec4899', label: 'Fucsia', bg: 'bg-pink-500' },
  { id: '#a855f7', label: 'Púrpura', bg: 'bg-purple-500' },
  { id: '#64748b', label: 'Gris Slate', bg: 'bg-slate-500' },
];
