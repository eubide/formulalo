# Repaso por intervalos

Formúlalo hereda la arquitectura de Ubícalo, pero no su forma de repasar. En Ubícalo un Elemento Sabido vuelve cada día que el alumno entra, porque hay un examen cerca y después nada. Aquí no hay examen: el objetivo es seguir sabiéndose los 56 Elementos meses después, para formular. Por eso un Elemento Sabido vuelve tras un Intervalo que crece con cada acierto, 1, 3, 7, 14 y 30 días, y un fallo lo devuelve al día siguiente.

## Opciones consideradas

- **Flojo o Sabido, y lo Sabido se repasa cada día**, como Ubícalo: reutiliza el Dominio tal cual, pero obliga a pasar los 56 Elementos cada día para siempre, y repasar lo que aún se recuerda bien fija menos que repasarlo cuando empieza a olvidarse.

## Consecuencias

- El Dominio guarda de cada Elemento cuándo le toca volver, no solo el día en que se vio.
- Una Tanda puede no traer nada que repasar, y un día sin nada pendiente ni Grupos nuevos no tiene Tanda.
