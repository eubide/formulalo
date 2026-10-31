# Dictado fuera de la Tanda

La Cadena pregunta los Números de oxidación al final, con el Elemento señalado en la Tabla, su Configuración a la vista y pocas opciones: nunca obliga a recordarlos sin pistas, y cada cuatro minutos solo llega a unos 8 Elementos. La spec dejó fuera la práctica libre fuera de la Tanda. El Dictado la abre solo para estos números: Elementos y Radicales, con un teclado fijo y sin ayudas. Un fallo en un Elemento cuenta como en la Cadena y lo devuelve a Flojo; un acierto no cambia nada, como en la Práctica de ADR-0002.

## Opciones consideradas

- **Que acertar cuente**: un Flojo pasaría a Sabido sin haber respondido su Posición, y varios Dictados seguidos alargarían Intervalos sin espaciar nada.
- **Un Dominio propio para el Dictado**: dejaría espaciar cada número y cada Radical, pero obliga a cambiar el Dominio guardado, y hoy un cambio de versión lo vacía.
- **Endurecer el paso de la Cadena**, con el teclado en lugar de los Distractores: pide recordar, pero no añade repeticiones.
- **Responder tocando electrones**: ya se especificó con la Tira (#4) y #9 la sustituyó, porque los números se saben de memoria o se deducen rápido.

## Consecuencias

- Solo entran Elementos ya preguntados en una Tanda: un fallo en uno solo presentado le quitaría su sitio entre los nuevos.
- Un Radical no tiene Dominio: fallarlo solo lo trae otra vez dentro de ese Dictado.
- El teclado llega de −4 a +7. Un Elemento con un número fuera de ahí obliga a ampliarlo, y lo avisa un test.
