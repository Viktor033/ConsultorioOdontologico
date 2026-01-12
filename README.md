# DentalCare - Sistema de Gestión Odontológica Integral

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![Java](https://img.shields.io/badge/Java-JEE-orange.svg) ![Status](https://img.shields.io/badge/status-active-success.svg)

**DentalCare** es una solución web robusta y moderna diseñada para optimizar la administración y el flujo clínico de consultorios odontológicos. Combina una interfaz intuitiva y responsiva con un potente backend para gestionar pacientes, turnos e historias clínicas detalladas, incluyendo un odontograma interactivo de última generación.

---

## 🚀 Características Principales

### 📋 Gestión de Pacientes
- **Altas, Bajas y Modificaciones:** Registro completo de datos personales y de contacto.
- **Búsqueda Avanzada:** Filtros rápidos para localizar expedientes.
- **Historial Centralizado:** Acceso directo a turnos e historias clínicas desde el perfil del paciente.

### 🦷 Historia Clínica Digital y Odontograma
- **Odontograma Interactivo:** Edición visual del estado de cada pieza dental (caries, obturaciones, tratamientos de conducto, coronas, ausencias). Diferenciación entre dentición adulta e infantil.
- **Registro de Evolución:** Historial detallado de cada consulta con fecha, motivo, diagnóstico, tratamiento y medicación.
- **Generación de Reportes PDF:** Exportación profesional de la historia clínica con el estado visual del odontograma a todo color, ideal para imprimir o archivar.

### 📅 Agenda de Turnos Inteligente
- **Calendario Visual:** Vista mensual interactiva para la asignación rápida de citas.
- **Gestión de Estados:** Control de turnos (Pendiente, Confirmado, Completado, Cancelado) con indicadores visuales.
- **Flujo "Atender":** Acceso directo desde el turno a la historia clínica del paciente correspondiente.
- **Notificaciones:** Alertas de confirmación y feedback visual (SweetAlert2) para acciones críticas.

---

## 🛠️ Stack Tecnológico

El proyecto está construido utilizando estándares de la industria para asegurar escalabilidad y mantenibilidad:

- **Backend:**
  - Java EE (Servlets) para la lógica de negocio.
  - JPA (Java Persistence API) / Hibernate para el mapeo objeto-relacional.
  - MySQL como motor de base de datos.
  
- **Frontend:**
  - **HTML5 & CSS3:** Diseño moderno, limpio y responsivo (adaptable a móviles).
  - **JavaScript (ES6+):** Lógica dinámica del cliente.
  - **Librerías:** 
    - *SweetAlert2* para modales y alertas elegantes.
    - *FontAwesome* para iconografía.

---

## 🔧 Instalación y Despliegue

### Requisitos Previos
- JDK (Java Development Kit) 8 o superior.
- Servidor de aplicaciones (Apache Tomcat, GlassFish, etc.).
- MySQL Server.

### Pasos
1.  **Base de Datos:**
    - Crear una base de datos en MySQL llamada `consultorio_odonto` (o según configuración en `persistence.xml`).
    - Configurar las credenciales en el archivo de persistencia.

2.  **Despliegue:**
    - Clonar este repositorio.
    - Importar el proyecto en tu IDE favorito (NetBeans, IntelliJ, Eclipse).
    - Realizar el "Clean & Build" para generar el archivo `.war`.
    - Desplegar en tu servidor local (Tomcat).

3.  **Ejecución:**
    - Acceder a `http://localhost:8080/ConsultorioOdonto` (puerto predeterminado).

---

## 📸 Uso del Sistema

1.  **Ingreso:** Inicie sesión con sus credenciales de profesional o administrativo.
2.  **Dashboard:** Visualice métricas rápidas y accesos directos.
3.  **Nuevo Paciente:** Diríjase a la sección "Pacientes" para registrar una nueva ficha.
4.  **Agendar:** Use la "Agenda" para reservar un turno haciendo clic en el día deseado.
5.  **Atención:** Desde la agenda, click en "Atender" para abrir el Odontograma, marque los hallazgos y guarde la evolución.

---

## 📝 Licencia

Este proyecto es de uso privado y propietario. Todos los derechos reservados.

---
*Desarrollado con ❤️ para la excelencia odontológica.*
