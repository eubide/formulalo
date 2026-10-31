# La primera Oleada tras una ausencia es solo de repaso

ADR-0005 dejó que el trozo nuevo entrara siempre entero y que el repaso ocupara lo que dijera la Serie: quien vuelve tras dos semanas con 19 Elementos atrasados recibe una Presentación nueva y de 0 a 3 sitios de repaso. Se repasa menos justo cuando más se ha olvidado. Por eso, si hace 3 días o más de la última Oleada terminada y algo toca, la siguiente trae solo lo que toca, hasta 8, sin nuevos ni Práctica, y la Portada no recibe con «Dónde se rompe la cadena». Al terminarla todo sigue como antes. Corrige a ADR-0005 solo en esa Oleada: el avance se retrasa una Oleada y sigue sin limitarse.

## Opciones consideradas

- **Decidir por cantidad, con 8 o más atrasados**: no distingue a quien vuelve de quien estudia a diario, y frenaría ya el segundo día a quien avanza rápido, lo que ADR-0002 quiso permitir.
- **Dejar la Serie como está**: es lo más simple, pero en una Oleada del 0 % tras una ausencia no se repasa nada.

## Consecuencias

- Los 3 días son una suposición, sin datos de alumnos.
- Solo cuentan las Oleadas: un Dictado no pregunta la Posición, así que no acaba la ausencia.
- Una Oleada dejada a medias tampoco la acaba.
- Un Dominio guardado sin Oleadas no se toma por ausente, porque no se sabe cuándo se estudió.
- Una Oleada así puede ser muy corta: un solo Elemento, si solo toca uno.
