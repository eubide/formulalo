# La Configuración se puede saltar

La Configuración solo sirve para deducir los Números de oxidación, pero un fallo ahí frenaba el Intervalo como uno de Clase, y responderla era obligatorio. Por eso se puede saltar siempre, y ni saltarla ni fallarla cuenta en contra: el Elemento queda igual que al acertarla. Acertarla solo se ve como ✓. Corrige a ADR-0002, que dejaba el Intervalo como estaba con un fallo de Configuración.

## Opciones consideradas

- **Que acertarla suba un escalón extra de Intervalo**: premia de verdad, pero se deduce de la Posición, así que un Elemento llegaría antes a 30 días sin demostrar que recuerda más.
- **Que solo acertarla haga crecer el Intervalo**: quien la salta siempre dejaría cada Elemento nuevo en 1 día, y eso en la práctica cuenta en contra.

## Consecuencias

- La Configuración es el único paso de la Cadena sin efecto en el Dominio, y un fallo ahí no sale en «Dónde se rompe la cadena».
- Saltarla no quita su pista: el paso de Números de oxidación sigue enseñando la Configuración y la Capa de valencia.
