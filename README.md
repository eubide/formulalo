# Formúlalo

Web para aprender dónde está cada Elemento en la tabla periódica y deducir de ahí su Configuración y sus Números de oxidación, como base para formular. Se estudia en Tandas de unos cuatro minutos, y cada Elemento vuelve cuando le toca repasarse.

Está publicada en https://eubide.github.io/formulalo/

## Desarrollo

Hacen falta Node y [Task](https://taskfile.dev).

```sh
task instalar    # instala las dependencias
task dev         # arranca la aplicación en desarrollo
task test        # pasa los tests una vez
task verificar   # tests, tipos y compilación, como antes de un merge
```

`task` sin argumentos lista las demás tareas.

## Lenguaje y decisiones

- [`CONTEXT.md`](CONTEXT.md): el lenguaje del proyecto. Los términos que este README escribe con mayúscula se definen ahí.
- [`docs/adr/`](docs/adr/): las decisiones y por qué se tomaron.
