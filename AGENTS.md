# AGENTS.md - Directrices de Desarrollo para Agentes de IA (Mis Tarjetas)

Este archivo contiene la especificación oficial y reglas de proyecto para cualquier asistente o agente de IA que trabaje en el código de **Mis Tarjetas**.

---

## 🎨 Identidad & Diseño
- **Nombre Oficial:** "Mis Tarjetas" (nunca FINANCIAS MX).
- **Estilo:** Mobile-First, tonos azules (`#0f172a`, `#1e3a8a`, `#2563eb`), tarjetas blancas limpias.

---

## 📐 Principales Reglas de Proyecto
1. **Acciones Táctiles:** Botones de tarjetas integrados en la UI sin depender de hover.
2. **Filtro de Ingresos:** Los ingresos sólo se pueden depositar en cuentas líquidas (`debit`, `cash`, `savings`).
3. **Préstamos Personales:** Cuotas, frecuencia, amortización y marcado manual de pago realizado.
4. **Gráficas Continuas:** Pre-poblado continuo de días en `$0.00 MXN` (Mes Actual por defecto, Mes Anterior, Todo el Año, Personalizado).
5. **Pestaña Movimientos:** Ver detalle (`Eye`), editar (`Pencil`) y confirmación estricta (`confirm(...)`) antes de eliminar.
6. **Alertas & Throttling:** Banner de pagos cercanos en Home con 1 notificación diaria máximo (`localStorage`).
7. **Diseño Limpio:** `html, body, #root` sin franjas blancas en la parte inferior. Sidebar sticky en escritorio (`sticky top-14`).
