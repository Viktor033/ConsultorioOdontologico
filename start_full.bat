@echo off
echo Iniciando DentalCare V2 Full-Stack...

start cmd /k "mvn org.apache.tomcat.maven:tomcat7-maven-plugin:2.2:run"
start cmd /k "npm run dev"

echo Backend y Frontend se estan iniciando en ventanas separadas.
echo No cierres estas ventanas para mantener el sistema funcionando.
