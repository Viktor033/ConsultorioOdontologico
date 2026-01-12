<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ include file="headJSP.jsp" %>
<div class="sidebar">
    <div class="icon-container">
        <i class="fa-solid fa-tooth"></i>
        <p>Pacientes</p>
    </div>
    <ul>
        <!-- Enlace al inicio -->
        <li><a href="../index.jsp"><i class="fas fa-home"></i> Inicio</a></li>

        <!-- Enlace a Pacientes -->
        <li><a href="Pacientes.jsp" class="toggle-btn"><i class="fas fa-users"></i> Pacientes</a></li>

        <!-- Enlace a Citas -->
        <li><a href="citas.jsp"><i class="fa-regular fa-calendar"></i> Citas</a></li>
    </ul>
</div>
