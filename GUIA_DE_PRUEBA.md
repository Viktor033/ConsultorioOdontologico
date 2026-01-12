# Guía de Prueba - Sistema de Consultorio Odontológico

## 🚀 Cómo Probar el Sistema

### Opción 1: Abrir Directamente los Archivos HTML

1. **Abrir el Dashboard**:
   - Navega a: `c:\PROYECTOS\ConsultorioOdonto-main\src\main\webapp\`
   - Haz doble clic en `dashboard.html`
   - Se abrirá en tu navegador predeterminado

2. **Navegar por el Sistema**:
   - Usa el menú lateral para cambiar entre secciones
   - **Inicio**: Dashboard con estadísticas
   - **Pacientes**: Gestión de pacientes
   - **Agenda**: Calendario de turnos

### Opción 2: Usar un Servidor Local (Recomendado)

Si tienes Python instalado:

```bash
cd c:\PROYECTOS\ConsultorioOdonto-main\src\main\webapp
python -m http.server 8000
```

Luego abre en el navegador: `http://localhost:8000/dashboard.html`

### Opción 3: Desplegar en Servidor Java

```bash
# Desde la raíz del proyecto
mvn clean package

# El archivo WAR estará en:
# target/consultorioOdontologico2-1.0.war

# Copia este archivo a tu servidor Tomcat/Payara/GlassFish
# Carpeta: webapps/ (Tomcat) o autodeploy/ (Payara)
```

---

## 📋 Funcionalidades para Probar

### 1. Dashboard (dashboard.html)

**Qué verás**:
- ✅ 4 tarjetas de estadísticas con gradientes de colores
- ✅ Tabla de "Próximos Turnos" (vacía por ahora)
- ✅ Panel de "Accesos Rápidos" con 4 botones
- ✅ Tabla de "Pacientes Recientes" (vacía por ahora)

**Qué probar**:
- Click en los botones de accesos rápidos
- Navegación desde el sidebar

---

### 2. Gestión de Pacientes (pacientes.html)

**Qué verás**:
- ✅ Barra de búsqueda
- ✅ Tabla de pacientes (vacía inicialmente)
- ✅ Botón "Nuevo Paciente" en la parte superior

**Qué probar**:

#### Crear un Paciente:
1. Click en "Nuevo Paciente"
2. Se abre un modal con formulario
3. Completa los campos:
   - DNI: `12345678`
   - Nombre: `Juan`
   - Apellido: `Pérez`
   - Teléfono: `11 1234-5678`
   - Email: `juan@email.com`
   - Dirección: `Calle Falsa 123`
   - Obra Social: `OSDE`
   - Fecha de Nacimiento: `1990-01-15`
4. Click en "Guardar"
5. El paciente aparecerá en la tabla

#### Buscar un Paciente:
1. Escribe en la barra de búsqueda: `Juan`
2. La tabla se filtra en tiempo real

#### Ver Detalles:
1. Click en el botón azul (ojo) en la fila del paciente
2. Se abre un modal con todos los detalles

#### Editar un Paciente:
1. Click en el botón amarillo (lápiz)
2. Modifica los datos
3. Click en "Guardar"

#### Eliminar un Paciente:
1. Click en el botón rojo (papelera)
2. Confirma la eliminación

---

### 3. Calendario de Turnos (calendario.html)

**Qué verás**:
- ✅ Calendario mensual con grid de 7 columnas (días de la semana)
- ✅ Navegación: ← Mes Anterior | Hoy | Mes Siguiente →
- ✅ Panel lateral "Turnos del Día"
- ✅ Leyenda de estados con colores

**Qué probar**:

#### Ver el Calendario:
1. El mes actual se muestra automáticamente
2. El día de hoy está destacado en azul
3. Hay 3 turnos de ejemplo para hoy (7 de enero)

#### Navegar por los Meses:
1. Click en "←" para ver el mes anterior
2. Click en "→" para ver el mes siguiente
3. Click en "Hoy" para volver al día actual

#### Ver Turnos de un Día:
1. Click en cualquier día del calendario
2. El panel derecho muestra los turnos de ese día
3. Cada turno muestra:
   - Hora
   - Nombre del paciente
   - Motivo
   - Estado (con color)
   - Botones Editar/Eliminar

#### Crear un Turno:
1. Click en "Nuevo Turno" (botón superior derecho)
2. Se abre un modal con formulario
3. Completa los campos:
   - Fecha: Selecciona una fecha
   - Hora: `10:00`
   - Paciente: Selecciona de la lista
   - Motivo: `Control general`
   - Estado: `PENDIENTE`
   - Observaciones: `Primera consulta`
4. Click en "Guardar"
5. El turno aparece en el calendario con un badge de color

#### Editar un Turno:
1. Selecciona un día con turnos
2. En el panel derecho, click en el botón amarillo (lápiz)
3. Modifica los datos
4. Click en "Guardar"

#### Estados de Turnos:
- 🟡 **Pendiente**: Amarillo
- 🔵 **Confirmado**: Azul
- 🟢 **Completado**: Verde
- 🔴 **Cancelado**: Rojo

---

## 🎨 Características Visuales

### Colores y Diseño:
- **Sidebar**: Gradiente oscuro (azul marino a negro)
- **Tarjetas de estadísticas**: Gradientes vibrantes
- **Botones**: Hover effects con elevación
- **Tablas**: Hover en filas
- **Modales**: Animación de entrada/salida

### Responsive:
- El sidebar se oculta en móviles
- Las tablas son scrolleables horizontalmente
- Los formularios se adaptan a pantallas pequeñas

---

## 🔍 Datos de Prueba Incluidos

### Turnos de Ejemplo (7 de enero de 2026):

1. **09:00** - Juan Pérez - Control general - CONFIRMADO
2. **10:30** - María González - Limpieza dental - PENDIENTE
3. **15:00** (10 de enero) - Carlos Rodríguez - Extracción - PENDIENTE

### Pacientes de Ejemplo (para el selector de turnos):

1. Juan Pérez (DNI: 12345678)
2. María González (DNI: 87654321)
3. Carlos Rodríguez (DNI: 11223344)

---

## ⚠️ Notas Importantes

### Datos en Memoria:
- Los datos se guardan en memoria (JavaScript)
- Al recargar la página, los datos se pierden
- Para persistencia real, necesitamos conectar con el backend

### Backend:
- El backend está completo y funcional
- Falta crear los Servlets REST para conectar con el frontend
- Una vez conectado, los datos se guardarán en MySQL

### Navegación:
- Todos los links del sidebar funcionan
- Las páginas "Historia Clínica" y "Odontograma" aún no están implementadas

---

## 🐛 Si Encuentras Problemas

### Los estilos no se cargan:
- Verifica que estés abriendo desde la carpeta correcta
- Asegúrate de que `CSS/main.css` existe

### Los modales no se abren:
- Abre la consola del navegador (F12)
- Verifica que no haya errores de JavaScript

### El calendario no se renderiza:
- Verifica que `JS/calendario.js` se esté cargando
- Revisa la consola del navegador

---

## 📸 Capturas Esperadas

### Dashboard:
- 4 tarjetas coloridas en la parte superior
- Tabla de turnos en el centro-izquierda
- Panel de accesos rápidos en el centro-derecha
- Tabla de pacientes en la parte inferior

### Pacientes:
- Barra de búsqueda arriba
- Tabla con columnas: DNI, Nombre, Teléfono, Email, Obra Social, Acciones
- Botones de acción en cada fila

### Calendario:
- Grid de calendario a la izquierda (7 columnas)
- Panel de turnos del día a la derecha
- Turnos visibles en los días correspondientes
- Leyenda de estados en la parte inferior

---

## ✅ Checklist de Prueba

- [ ] Dashboard se abre correctamente
- [ ] Sidebar es visible y funcional
- [ ] Puedo crear un paciente
- [ ] Puedo buscar un paciente
- [ ] Puedo editar un paciente
- [ ] Puedo eliminar un paciente
- [ ] El calendario muestra el mes actual
- [ ] Puedo navegar entre meses
- [ ] Puedo seleccionar un día
- [ ] Veo los turnos del día seleccionado
- [ ] Puedo crear un turno
- [ ] Puedo editar un turno
- [ ] Puedo eliminar un turno
- [ ] Los estados de turnos tienen colores correctos
- [ ] El diseño es responsive (prueba en ventana pequeña)

---

¡Disfruta probando el sistema! 🎉
