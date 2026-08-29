# 🤖 Instrucciones & Guía de Desarrollo para Inteligencia Artificial (Gemini, Claude, Copilot, ChatGPT)

Este documento contiene **todas las reglas de negocio, directrices de diseño y especificaciones técnicas obligatorias** establecidas por el usuario para el proyecto **Mis Tarjetas**. Cualquier agente de IA que trabaje en este código debe leer y respetar estrictamente estas directrices.

---

## 🎨 1. Nombre del Proyecto & Identidad Visual

- **Nombre Oficial:** La aplicación se llama explícitamente **"Mis Tarjetas"** (NUNCA usar "FINANCIAS MX" ni otros nombres).
- **Paleta de Colores:** Basada en tonos **Azules Elegantes** (`#0f172a` para menús/sidebar, `#1e3a8a` / `#2563eb` para gradientes de encabezados y acentos azules, `#f0f4f9` para el fondo global).
- **Tarjetas UI:** Tarjetas blancas (`bg-white`) con bordes suaves (`border-slate-200`) y sombras finas.

---

## 📱 2. Filosofía Mobile-First & Layouts

- **Mobile-First:** La aplicación debe estar pensada y optimizada para funcionar impecablemente en pantallas móviles de celulares.
- **Acciones Táctiles Integradas:** Los botones de acción (ej. "Ver Detalle", "Movimientos") deben estar integrados **dentro de las tarjetas**, visibles en pantallas táctiles. **PROHIBIDO depender de efectos hover o superposiciones al pasar el ratón**, ya que no funcionan en dispositivos móviles.
- **Navegación:**
  - En móviles: Barra de navegación inferior fija (`MobileNav.tsx`) en la parte inferior del viewport.
  - En escritorio: Menú lateral anclado (**Sticky Sidebar** `sticky top-14 h-[calc(100vh-56px)]`).
- **Botón "REGISTRAR":** Debe ser el botón de llamada a la acción principal, visible y fácilmente accesible siempre en toda la aplicación. Se renombró de "Registrar Gasto" a **"Registrar"**.
- **Sin Espacios / Franjas Blancas:** Al hacer scroll hasta el fondo o al abrir una ventana modal, `html, body, #root` deben cubrir el 100% de la pantalla sin franjas ni cortes de color en la parte inferior.

---

## 💰 3. Reglas de Negocio en Cuentas e Ingresos

- **Filtro Estricto para Ingresos:**
  - Los **Ingresos** (depósitos, sueldos, bonos) **SÓLO pueden ingresarse/depositarse en cuentas de Débito, Ahorro o Efectivo** (`debit`, `cash`, `savings`).
  - **PROHIBIDO** permitir registrar un ingreso directo en una tarjeta de crédito (`credit_card`) o en un préstamo (`loan`).
- **Categorías de Ingreso:**
  - Debe incluir categorías predeterminadas de ingreso como **"Sueldo"** y **"Bono"**.
  - Se eliminó el botón de *"Categorías Base"* de la vista de categorías.
- **Separación en Vista de Cuentas:**
  - Debe existir un separador visual claro que divida las *Cuentas de Débito y Efectivo* de las *Tarjetas de Crédito / Préstamos*.

---

## 🤝 4. Préstamos Personales & Amortización

- Para los **Préstamos Personales**, se debe poder registrar:
  - Fecha o fechas de pago.
  - Monto total contratado y número de cuotas/pagos.
  - Frecuencia del pago (Semanal, Quincenal, Mensual).
  - Pagos realizados vs pagos pendientes.
  - Historial de amortización donde el usuario **marca manualmente** cuando ya realizó el pago pendiente de esa fecha.

---

## 🔔 5. Alertas de Próximo Pago & Notificaciones

- **Ubicación de Alertas:** Debe mostrar una alerta compacta en el Dashboard de Inicio (**Home**) cuando el pago de un préstamo o tarjeta de crédito esté cerca.
- **Throttling Diarios:** Las notificaciones push o del sistema web deben dispararse **máximo 1 vez por día** utilizando `localStorage` (ej. `last_payment_alert_notification_date === todayStr`).

---

## 📊 6. Gráficas Temporales & Trazado Continuo

- **Filtros Flexibles:** Las gráficas de tiempo deben incluir botones de selección:
  1. **Mes Actual** (Por defecto).
  2. **Mes Anterior**.
  3. **Todo el Año**.
  4. **Rango Personalizado** (inputs de fecha inicial y final).
- **Trazado Continuo de Días:**
  - Aunque en un día no se haya registrado ningún movimiento, **igual se debe incluir el día en la gráfica con valor `$0.00 MXN`**.
  - No dejar huecos en las fechas para evitar que la gráfica trace líneas/pendientes diagonales falsas entre días distantes.

---

## ⚙️ 7. Pestaña "Movimientos" & Confirmaciones

- **Pestaña "Movimientos":** Renombrada a partir de "Gasto".
- **Ver Detalle & Editar:** Cada movimiento en la lista debe permitir abrir su modal de **Detalle** (`Eye`) y **Editar** (`Pencil`) para modificar monto, fecha, concepto, cuenta o categoría.
- **Alertas de Confirmación de Eliminación:**
  - En **TODO EL SISTEMA** (Cuentas, Movimientos, Categorías, Préstamos), al presionar un botón de eliminar (`Trash2`), se DEBE mostrar primero un `confirm('¿Estás seguro...?')` y **no eliminar hasta que el usuario lo confirme explícitamente**.

---

## 📂 8. Estructura de Archivos Clave

- `src/App.tsx`: Dashboard principal y ruteo de pestañas.
- `src/components/Sidebar.tsx`: Menú lateral sticky para escritorio.
- `src/components/MobileNav.tsx`: Navegación inferior y FAB para móviles.
- `src/components/AccountDetailModal.tsx`: Modal de fluctuaciones por tarjeta.
- `src/components/PaymentAlertBanner.tsx`: Tarjeta compacta de alertas de vencimiento.
- `src/components/LoanCard.tsx`: Tarjeta de préstamos con marcado de amortizaciones.
- `src/db/schema.ts` & `src/db/seedData.ts`: Definición de esquema Dexie IndexedDB y generador de datos.
- `src/utils/export.ts`: Módulo de exportación cliente en Excel (`.xlsx`) y PDF (`.pdf`).
