# Oleadas y Serie de repaso

ADR-0002 dejó pedir Tandas siempre, con lo nuevo primero y el repaso llenando lo que sobrara: un trozo grande dejaba la Tanda casi sin repaso y uno pequeño la llenaba de él. Ahora se llaman Oleadas, un día puede tener varias, y la parte de repaso sigue una serie fija: 20 %, 30 %, 40 %, 0 %, y vuelve a empezar. El avance nunca se limita: el trozo nuevo entra entero y la Oleada crece o mengua a su alrededor. El Dictado sigue la misma serie, recuerda cada Bloque y cada Radical, y avanza por su cuenta por el Camino, presentando antes lo que no se ha visto. Corrige a ADR-0002 en el reparto y a ADR-0003, que no le daba memoria al Dictado y solo le dejaba preguntar Elementos ya preguntados en una Oleada: con pocos, repetía los mismos una y otra vez.

## Opciones consideradas

- **Un tope de repaso del 60 % con la Oleada siempre en 8 Elementos**: partía los trozos grandes y dejaba 20 % y 30 % casi iguales, porque 8 Elementos no dan para más precisión.
- **Que las Oleadas del mismo día alarguen los Intervalos**: dormir entre sesiones reduce la práctica necesaria y mejora el recuerdo a largo plazo, así que solo crece lo que toca, como en la Práctica.
- **Cambiar la versión del Dominio para guardar lo nuevo**: un cambio de versión lo vacía. Se añade al mismo registro, y lo guardado antes sigue valiendo.

## Consecuencias

- Una Oleada del 0 % deja el repaso pendiente, y solo se ve en «quedan N». Sin nada nuevo la Oleada entera es repaso, toque lo que toque en la serie.
- La serie avanza con las Oleadas terminadas: abandonar una no la mueve.
- Lo presentado en un Dictado espera en las Oleadas como nuevo, y no llega otra Presentación de Oleada hasta que se pregunte.
- Cuando se acaba lo nuevo, la serie deja de notarse.
