# 🤖 Reglas y Estándares de Desarrollo para Agentes de IA - Mis Tarjetas

## 🎯 Identidad & Nombre del Proyecto
- **Nombre Oficial:** El proyecto se llama exclusivamente **"Mis Tarjetas"** (NUNCA usar "FINANCIAS MX" u otros nombres).
- **Estética & Colores:** Paleta de tonos Azules Elegantes (`#0f172a` para menús/sidebar, `#1e3a8a` / `#2563eb` para gradientes de encabezados, `#f0f4f9` para fondo global).
- **Componentes UI:** Tarjetas blancas (`bg-white`), bordes finos (`border-slate-200`) y sombras suaves.

---

## 📱 Mobile-First & Directrices de Interfaz
- **Mobile-First Estricto:** Diseñado y optimizado para pantallas táctiles de celulares.
- **Acciones Táctiles Integradas:** Los botones de acción deben estar dentro de la tarjeta visibles. **PROHIBIDO depender de hover** para botones esenciales.
- **Navegación:**
  - Móviles: Barra inferior de navegación (`MobileNav.tsx`).
  - Escritorio: Menú lateral anclado (`Sidebar.tsx` con `sticky top-14 h-[calc(100vh-56px)]`).
- **Botón "REGISTRAR":** Siempre visible y accesible como CTA principal.
- **Sin Espacios / Franjas:** Cobertura limpia del 100% en el lienzo global sin espacios en blanco al hacer scroll o al abrir modales (`fixed inset-0`).

---

## 💰 Reglas de Negocio Financieras
1. **Regla de Ingresos:**
   - Los ingresos (sueldos, bonos) **SÓLO se depositan en cuentas líquidas** (`debit`, `cash`, `savings`).
   - Jamás permitir ingresar fondos directamente a Tarjetas de Crédito o Préstamos.
2. **Categorías Predeterminadas:**
   - Incluir "Sueldo" y "Bono" para ingresos.
   - Quitar el botón de "Categorías Base".
3. **Vista de Cuentas:**
   - Mantener separadas las *Cuentas de Débito y Efectivo* de las *Tarjetas de Crédito / Préstamos*.
4. **Préstamos Personales:**
   - Registrar monto total, cuotas, frecuencia (semanal, quincenal, mensual), amortizaciones y permitir al usuario **marcar manualmente el pago realizado**.
5. **Alertas de Próximo Pago:**
   - Mostrar banner en el Home y limitar notificaciones push a **máximo 1 vez por día** (`localStorage`).
6. **Gráficas Temporales Continuas:**
   - Selectores: *Mes Actual* (defecto), *Mes Anterior*, *Todo el Año* y *Rango Personalizado*.
   - Pre-poblar los días inactivos en `$0.00 MXN` para evitar líneas falsas entre fechas distantes.
7. **Movimientos & Confirmación:**
   - Pestaña llamada **Movimientos** con opción de Ver Detalle (`Eye`) y Editar (`Pencil`).
   - Al presionar **Eliminar** (`Trash2`) en cualquier módulo, solicitar **confirmación explícita (`confirm(...)`) antes de eliminar**.
