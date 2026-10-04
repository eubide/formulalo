# Tandas a demanda

ADR-0001 dejó el repaso en manos de los Intervalos: solo hay Tanda si algo toca hoy o queda un trozo nuevo. Eso frena a quien quiere estudiar mucho unos días y después ir despacio: tras ver los 56 Elementos el primer día no puede seguir, y los días siguientes solo tiene dos o tres Tandas. Por eso una Tanda se puede pedir siempre. Lo nuevo va primero, lo que toca hoy después, y lo que sobra se llena con Práctica: Elementos a los que todavía no les toca. La Práctica no alarga Intervalos: acertar un Sabido antes de tiempo no cambia nada, y solo un fallo lo mueve.

## Opciones consideradas

- **Que cada acierto cuente**, toque o no: cinco Tandas seguidas mandan un Elemento a 30 días sin haberlo retenido, y la fase lenta empieza vacía.
- **Que la Práctica solo anote fallos**: un Flojo seguiría Flojo todo el día y saldría en cada Tanda; rotarlos obliga a guardar cuándo se preguntó cada uno.
- **Un tope de Tandas o de nuevos al día**: evita ver demasiado de golpe, pero es justo lo que se quiere poder hacer.

## Consecuencias

- Con algún Elemento visto ya no hay día sin Tanda: «Hoy no toca nada» informa, no cierra.
- Un Flojo acertado queda Sabido para mañana aunque se fallara hoy: recuperarlo cuesta una Tanda, no un día.
- Lo que se ve el mismo día vuelve junto: tras un primer día con todo visto, los días 2, 5 y 12 traen de 6 a 8 Tandas de repaso.
- Corrige a ADR-0001: desde que un Elemento es Sabido con la Posición y los Números de oxidación, solo un fallo en esos dos pasos lo devuelve al día siguiente. Un fallo de Clase o Configuración deja el Intervalo como estaba.
