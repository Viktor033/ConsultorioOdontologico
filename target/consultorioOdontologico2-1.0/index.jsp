<%@page contentType="text/html" pageEncoding="UTF-8"%>

<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Consultorio Odontológico</title>
        <!-- Enlace al archivo CSS -->
        <link rel="stylesheet" href="CSS/Style.css">
        <!-- FontAwesome para los íconos -->
        <script src="https://kit.fontawesome.com/ca702ea505.js" crossorigin="anonymous"></script>
    </head>
    <body>
        <!-- Contenedor principal -->
        <div class="container">
            <!-- Barra de navegación -->
            <div class="sidebar">
                <div class="icon-container">
                    <i class="fa-solid fa-tooth"></i>
                    <p>Consultorio Odontológico</p>
                </div>
                <ul>
                    <li>
                        <a href="../index.jsp">
                            <i class="fas fa-home"></i> Inicio</a>
                    </li>
                    <li>
                        <a href="./Components/Pacientes.jsp" class="toggle-btn">
                            <i class="fas fa-users"></i> Pacientes</a>
                    </li>
                    <li>
                        <a href="#citas">
                            <i class="fa-regular fa-calendar"></i> Citas</a>
                    </li>
                </ul>
            </div>

            <!-- IMG -->
            <div class="contenedor-img">
                <img src="IMG/logo.png" alt="logo">
            </div>
            <!-- Footer -->
            <%@ include file="Components/footer.jsp"%>
            <!-- Enlace al archivo JavaScript -->
            <script src="JS/scripts.js"></script>
        </div> <!-- Cierre contenedor -->
    </body>
</html>

