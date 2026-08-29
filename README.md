# 💳 Mis Tarjetas - Finanzas Personales PWA & Local-First (MXN)

**Mis Tarjetas** es una aplicación web progresiva (PWA) moderna, rápida y *Mobile-First*, diseñada para la gestión integral de finanzas personales en pesos mexicanos (MXN). Combina un motor de almacenamiento persistente **Local-First (IndexedDB)** con capacidades de sincronización en la nube (Supabase), ofreciendo una experiencia fluida tanto en computadoras de escritorio como en dispositivos móviles.

---

## 🌟 Características Principales

- 💳 **Tarjetas de Crédito & Cuentas Líquidas:**
  - Control de saldos, límites de crédito, días de corte y fechas límite de pago.
  - Cálculo de porcentaje de uso de crédito con alertas visuales de salud financiera (Preventiva >30% y Crítica >50%).
  - Separación visual en el panel de cuentas entre *Cuentas Líquidas/Efectivo* y *Tarjetas de Crédito / Préstamos*.

- 🤝 **Préstamos Personales Granulares:**
  - Registro de monto total, frecuencia de pago (Semanal, Quincenal, Mensual), número de cuotas y fechas de vencimiento.
  - Tabla de amortización con seguimiento de pagos realizados vs pendientes.
  - Marcado manual de *"Pago Realizado"* por parte del usuario.

- 📈 **Gráficas de Fluctuaciones & Estadísticas Temporales:**
  - Selector flexible de rangos de fecha: **Mes Actual** (por defecto), **Mes Anterior**, **Todo el Año** y **Rango Personalizado**.
  - Trazado continuo del calendario que pre-pobla los días inactivos en `$0.00 MXN`, evitando pendientes falsas en la curva de gastos e ingresos.
  - Gráfico circular (*Donut Chart*) de desglose de gastos por categoría con estado neutro elegante para saldos en `$0.00`.

- ⚡ **Gestión de Movimientos:**
  - Botón principal de acceso rápido **REGISTRAR**.
  - Validación de regla de negocio: los *Ingresos* sólo pueden depositarse en cuentas de Débito, Ahorro o Efectivo.
  - Modal de **Ver Detalle** y **Editar Movimiento** (monto, descripción, fecha, cuenta y categoría).
  - Alerta de confirmación previa obligatoria antes de eliminar cualquier registro en todo el sistema.

- 🔔 **Alertas de Pago Próximo:**
  - Panel compacto en el Dashboard principal que identifica las tarjetas de crédito y préstamos con pagos cercanos.
  - Limitación (*Throttling*) de notificaciones web del navegador a **máximo 1 notificación por día**.

- 📊 **Exportaciones:**
  - Exportación nativa en formato de hoja de cálculo **Excel (`.xlsx`)** y documento **PDF (`.pdf`)**.

---

## 🛠️ Stack Tecnológico

- **Core:** React 19, TypeScript (Strict Type Safety), Vite 8.
- **Estilos & UI:** Tailwind CSS v4, Lucide Icons, Gráficos Recharts, Animate-in utilities.
- **Base de Datos Local-First:** Dexie.js (IndexedDB wrapper).
- **PWA & Offline:** Vite PWA Plugin, Service Worker (Workbox).
- **Exportaciones:** SheetJS (`xlsx`), jsPDF & jsPDF-AutoTable.
- **Backend / Sincronización:** Supabase Client Engine.

---

## 🚀 Instalación y Ejecución Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/BasherMX/misTarjetas.git
cd misTarjetas

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo en modo red (Host local)
npx vite --host 0.0.0.0 --port 5173

# 4. Compilar para producción
npm run build
```

---

## 📱 Acceso desde Dispositivos Móviles (PWA)

Para abrir la aplicación desde tu teléfono en la misma red Wi-Fi:
1. Abre en tu navegador móvil la IP de tu PC: `http://<TU_IP_LOCAL>:5173`.
2. En Safari (iOS), selecciona **"Agregar al inicio"**. En Chrome (Android), selecciona **"Instalar aplicación"**.
