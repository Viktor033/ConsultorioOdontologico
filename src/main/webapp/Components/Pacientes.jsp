<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ include file="headJSP.jsp" %>
<%@ include file="navBar.jsp" %>

<div class="botones-barra">
    <!-- Formulario para redirigir al formulario de agregar paciente -->
    <form action="agregarPaciente.jsp" method="GET">
        <button type="submit" class="action-btn action-btn-agregar" title="Agregar">
            <i class="fa fa-plus"></i>
        </button>
    </form>

    <button class="action-btn action-btn-modificar" title="Modificar">
        <i class="fa fa-edit"></i>
    </button>
    <button class="action-btn action-btn-eliminar" title="Eliminar">
        <i class="fa fa-trash"></i>
    </button>
    <button class="action-btn action-btn-buscar" title="Buscar">
        <i class="fa fa-search"></i>
    </button>
    <button class="action-btn action-btn-imprimir" title="Imprimir">
        <i class="fa fa-print"></i>
    </button>
</div>

<script src="../JS/scripts.js"></script>
<%@ include file="footer.jsp" %>
