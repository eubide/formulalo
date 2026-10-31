import { describe, expect, it } from 'vitest'
import { bloques } from '../catalogo/bloques'
import { elementoDe } from '../catalogo/catalogo'
import { formulaDe, numeroDeRadical, radicales } from '../catalogo/radicales'
import { abrir, acertarOleada, estudiarElDia, montar } from './ayudantes'
import { almacenEnMemoria, TECLADO, type Dictada, type DictadoEnCurso, type Estudio, type RespuestaDictada } from './estudio'

const GRUPO_1 = ['H', 'Li', 'Na', 'K', 'Rb', 'Cs', 'Fr']
const GRUPO_2 = ['Be', 'Mg', 'Ca', 'Sr', 'Ba', 'Ra']

function todasLasPreguntas(dictado: DictadoEnCurso): Dictada[] {
  return dictado.pregunta ? [dictado.pregunta, ...dictado.pendientes] : dictado.pendientes
}

function deBloques(dictadas: Dictada[]) {
  return dictadas.flatMap((dictada) => (dictada.tipo === 'bloque' ? [dictada] : []))
}

function deRadicales(dictadas: Dictada[]) {
  return dictadas.flatMap((dictada) => (dictada.tipo === 'radical' && dictada.pide === 'escritura' ? [dictada.radical] : []))
}

function conPreguntados(...simbolos: string[]) {
  const entrada = { estado: 'sabido', intervalo: 3, vuelve: '2026-10-09', fallos: 0, pasosFallados: [] }
  const almacen = almacenEnMemoria()
  almacen.setItem(
    'formulalo:dominio',
    JSON.stringify({ version: 1, camino: 'gas-noble', elementos: Object.fromEntries(simbolos.map((simbolo) => [simbolo, entrada])) }),
  )
  return montar(() => 0, almacen)
}

function conTodoEstudiado(azar: () => number = () => 0) {
  const { estudio, reloj } = montar(azar)
  estudiarElDia(estudio)
  return { estudio, reloj }
}

function empezar(estudio: Estudio): DictadoEnCurso {
  const dictado = estudio.abrirDictado()
  return dictado.presentacion ? estudio.descartarPresentacionDelDictado(dictado) : dictado
}

function empezarRadicales(estudio: Estudio): DictadoEnCurso {
  const ejercicio = estudio.abrirRadicales()
  return ejercicio.presentacion ? estudio.descartarPresentacionDelDictado(ejercicio) : ejercicio
}

function correcta(pregunta: Dictada): RespuestaDictada {
  if (pregunta.tipo === 'bloque') return pregunta.elementos.map((elemento) => elemento.numeros)
  if (pregunta.pide === 'numero') return [[numeroDeRadical(pregunta.radical)]]
  return pregunta.dadoPor === 'formula' ? pregunta.radical.nombre : formulaDe(pregunta.radical)
}

function acertar(estudio: Estudio, dictado: DictadoEnCurso): DictadoEnCurso {
  return estudio.responderDictado(dictado, correcta(dictado.pregunta!))
}

function fallar(estudio: Estudio, dictado: DictadoEnCurso): DictadoEnCurso {
  const pregunta = dictado.pregunta!
  const vacia: RespuestaDictada = pregunta.tipo === 'bloque' ? pregunta.elementos.map(() => []) : pregunta.pide === 'numero' ? [[]] : 'nada'
  return estudio.cerrarCorreccionDeDictado(estudio.responderDictado(dictado, vacia))
}

function hasta(estudio: Estudio, dictado: DictadoEnCurso, tipo: Dictada['tipo']): DictadoEnCurso {
  let actual = dictado
  while (actual.pregunta!.tipo !== tipo) actual = acertar(estudio, actual)
  return actual
}

function hastaElFinal(estudio: Estudio, dictado: DictadoEnCurso): DictadoEnCurso {
  let actual = dictado
  while (actual.pregunta) actual = acertar(estudio, actual)
  return actual
}

describe('El Dictado avanza por su cuenta', () => {
  it('sin nada estudiado trae los 2 primeros Bloques del Camino y presenta antes sus Elementos', () => {
    const { estudio } = montar()

    const dictado = estudio.abrirDictado()

    expect(dictado.pregunta).toBeNull()
    expect(new Set(dictado.presentacion)).toEqual(new Set([...GRUPO_1, ...GRUPO_2]))
    expect(deBloques(dictado.pendientes).map((bloque) => bloque.clave).sort()).toEqual([GRUPO_1.join(' '), GRUPO_2.join(' ')].sort())
  })

  it('solo presenta lo que no se ha visto, y el Bloque sale entero', () => {
    const { estudio } = conPreguntados('H', 'O')
    estudio.elegirCamino('uso')

    const dictado = estudio.abrirDictado()

    expect(dictado.presentacion).not.toContain('H')
    expect(dictado.presentacion).toContain('Li')
    expect(deBloques(dictado.pendientes).flatMap((bloque) => bloque.elementos)).toContain(elementoDe('H'))
  })

  it('sin nada por presentar empieza directamente', () => {
    const { estudio } = conTodoEstudiado()

    const dictado = estudio.abrirDictado()

    expect(dictado.presentacion).toBeNull()
    expect(dictado.pregunta).not.toBeNull()
  })

  it('al descartar la Presentación empieza a preguntar, y lo presentado ya no se vuelve a presentar', () => {
    const { estudio } = montar()

    const dictado = estudio.descartarPresentacionDelDictado(estudio.abrirDictado())

    expect(dictado.presentacion).toBeNull()
    expect(dictado.pregunta).not.toBeNull()
    expect(estudio.entradas().Li).toMatchObject({ estado: 'flojo', fallos: 0 })
  })

  it('Dictado tras Dictado, sin hacer ninguna Oleada, llega a los 10 Bloques', () => {
    const { estudio } = montar()

    for (let dictados = 0; dictados < 12 && estudio.resumenDelDictado().vistos < 10; dictados++) hastaElFinal(estudio, empezar(estudio))

    expect(estudio.resumenDelDictado().vistos).toBe(10)
    expect(estudio.resumen().sinVer).toBe(6)
  })

  it('no repite un Elemento entre los dos Bloques de un Dictado', () => {
    for (const valor of [0, 0.3, 0.6, 0.9]) {
      const { estudio } = montar(() => valor)
      for (let dictados = 0; dictados < 10; dictados++) {
        const dictado = empezar(estudio)
        const delDictado = deBloques(todasLasPreguntas(dictado)).flatMap((bloque) => bloque.elementos)
        expect(new Set(delDictado).size).toBe(delDictado.length)
        hastaElFinal(estudio, dictado)
      }
    }
  })

  it('fallar un Elemento solo presentado no lo saca de los nuevos; fallar uno ya preguntado lo deja Flojo', () => {
    const { estudio } = conPreguntados('H')
    const dictado = hasta(estudio, empezar(estudio), 'bloque')
    const pregunta = dictado.pregunta!
    if (pregunta.tipo !== 'bloque') throw new Error('Se esperaba un Bloque')

    estudio.responderDictado(dictado, pregunta.elementos.map(() => []))

    const presentado = pregunta.elementos.find((elemento) => elemento.simbolo !== 'H')!
    expect(estudio.entradas()[presentado.simbolo]).toMatchObject({ estado: 'flojo', fallos: 0 })
    if (pregunta.elementos.includes(elementoDe('H'))) expect(estudio.entradas().H).toMatchObject({ estado: 'flojo', fallos: 1 })
  })

  it('lo presentado en un Dictado espera en las Oleadas, de 8 en 8 como mucho', () => {
    const { estudio } = montar()
    hastaElFinal(estudio, empezar(estudio))

    expect(estudio.abrirOleada().presentacion).toBeNull()
    expect(estudio.anuncio().nuevos).toBe(8)
  })
})

describe('Teclado', () => {
  it('va de −5 a +7, sin el 0', () => {
    expect(TECLADO).toEqual([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7])
  })

  it('tiene todos los números que se preguntan', () => {
    for (const elemento of bloques().flat()) {
      expect(TECLADO, elemento.simbolo).toEqual(expect.arrayContaining(elemento.numeros))
    }
    for (const radical of radicales()) {
      expect(TECLADO, radical.nombre).toContain(numeroDeRadical(radical))
    }
  })
})

describe('Qué lleva un Dictado', () => {
  it.each([0, 0.3, 0.6, 0.9])('con el azar en %s, lleva 2 Bloques y ningún Radical', (valor) => {
    const dictadas = todasLasPreguntas(conTodoEstudiado(() => valor).estudio.abrirDictado())

    expect(deBloques(dictadas)).toHaveLength(2)
    expect(deRadicales(dictadas)).toEqual([])
  })

  it('numera los Bloques por el orden en que salen', () => {
    const dictado = conTodoEstudiado(() => 0.6).estudio.abrirDictado()

    expect(deBloques(todasLasPreguntas(dictado)).map((bloque) => bloque.numero)).toEqual([1, 2])
    expect(dictado.bloques).toBe(2)
  })

  it('da el Bloque por Símbolos o por nombres', () => {
    const dadosPor = (valor: number) => deBloques(todasLasPreguntas(conTodoEstudiado(() => valor).estudio.abrirDictado())).map((bloque) => bloque.dadoPor)

    expect(new Set(dadosPor(0))).toEqual(new Set(['simbolo']))
    expect(new Set(dadosPor(0.9))).toEqual(new Set(['nombre']))
  })
})

describe('El ejercicio de Radicales', () => {
  it('se puede hacer desde el principio, con 10 Radicales y ningún Bloque', () => {
    const { estudio } = montar()

    const ejercicio = empezarRadicales(estudio)

    expect(ejercicio.pregunta).not.toBeNull()
    expect(deRadicales(todasLasPreguntas(ejercicio))).toHaveLength(10)
    expect(deBloques(todasLasPreguntas(ejercicio))).toEqual([])
  })

  it('presenta antes los Radicales nuevos, sin preguntar ni tocar el Dominio', () => {
    const { estudio } = montar()
    const antes = estudio.entradas()

    const ejercicio = estudio.abrirRadicales()

    expect(ejercicio.pregunta).toBeNull()
    expect(ejercicio.presentacion).toHaveLength(10)

    const empezado = estudio.descartarPresentacionDelDictado(ejercicio)

    expect(empezado.presentacion).toBeNull()
    expect(empezado.pregunta).not.toBeNull()
    expect(estudio.entradas()).toEqual(antes)
  })

  it('presenta solo los nuevos, no los que repasa', () => {
    const { estudio, reloj } = montar()
    hastaElFinal(estudio, empezarRadicales(estudio))
    const vistos = Object.keys(estudio.memoriaDelDictado())
    reloj.dia = '2026-10-06'

    const { presentacion } = estudio.abrirRadicales()

    expect(presentacion).toHaveLength(7)
    expect(presentacion!.filter((nombre) => vistos.includes(nombre))).toEqual([])
  })

  it('sin nada nuevo pregunta directamente', () => {
    const { estudio } = montar()
    while (estudio.anuncioDeRadicales().nuevos > 0) hastaElFinal(estudio, empezarRadicales(estudio))

    const ejercicio = estudio.abrirRadicales()

    expect(ejercicio.presentacion).toBeNull()
    expect(ejercicio.pregunta).not.toBeNull()
  })

  it('avanza por el Camino, con los Radicales del Elemento central que llega antes', () => {
    const { estudio } = montar()
    const nombres = deRadicales(todasLasPreguntas(empezarRadicales(estudio))).map((radical) => radical.nombre)

    expect(nombres).toEqual(expect.arrayContaining(['hipoclorito', 'clorito', 'clorato', 'perclorato']))
    expect(nombres).not.toContain('borato')
  })

  it.each(['gas-noble', 'uso'] as const)('con el Camino %s, los del F llegan los últimos', (camino) => {
    const { estudio } = montar()
    estudio.elegirCamino(camino)
    const nuevos: string[] = []
    while (estudio.anuncioDeRadicales().nuevos > 0) {
      const ejercicio = estudio.abrirRadicales()
      nuevos.push(...ejercicio.presentacion!)
      hastaElFinal(estudio, estudio.descartarPresentacionDelDictado(ejercicio))
    }

    expect(nuevos).toHaveLength(39)
    expect(nuevos.slice(-4)).toEqual(['hipofluorito', 'fluorito', 'fluorato', 'perfluorato'])
  })

  it('no cambia a los Elementos, ni al acertar ni al fallar', () => {
    const { estudio } = conTodoEstudiado()
    const antes = estudio.entradas()
    let ejercicio = empezarRadicales(estudio)

    ejercicio = fallar(estudio, ejercicio)
    hastaElFinal(estudio, ejercicio)

    expect(estudio.entradas()).toEqual(antes)
  })

  it('sigue su propia serie: el segundo, con un 30 %, repasa 3 y avanza 7', () => {
    const { estudio, reloj } = montar()
    hastaElFinal(estudio, empezarRadicales(estudio))
    const vistos = Object.keys(estudio.memoriaDelDictado())
    reloj.dia = '2026-10-06'

    const nombres = deRadicales(todasLasPreguntas(empezarRadicales(estudio))).map((radical) => radical.nombre)

    expect(nombres.filter((nombre) => vistos.includes(nombre))).toHaveLength(3)
    expect(nombres.filter((nombre) => !vistos.includes(nombre))).toHaveLength(7)
  })

  it('terminar uno no mueve la serie del Dictado', () => {
    const { estudio } = conTodoEstudiado()
    hastaElFinal(estudio, empezarRadicales(estudio))

    expect(estudio.anuncioDelDictado()).toEqual({ nuevos: 2, deRepaso: 0 })
  })

  it('anuncia lo que trae el siguiente y cuenta lo visto', () => {
    const { estudio, reloj } = montar()
    expect(estudio.anuncioDeRadicales()).toEqual({ nuevos: 10, deRepaso: 0 })

    hastaElFinal(estudio, empezarRadicales(estudio))
    reloj.dia = '2026-10-06'

    expect(estudio.anuncioDeRadicales()).toEqual({ nuevos: 7, deRepaso: 3 })
    expect(estudio.resumenDeRadicales()).toEqual({ vistos: 10, total: 39, tocan: 10 })
  })

  it('de cada Radical pide primero escribir y después su número', () => {
    const { estudio } = montar()
    const ejercicio = empezarRadicales(estudio)
    const pregunta = ejercicio.pregunta!
    if (pregunta.tipo !== 'radical') throw new Error('Se esperaba un Radical')

    expect(pregunta.pide).toBe('escritura')
    expect(acertar(estudio, ejercicio).pregunta).toMatchObject({ radical: pregunta.radical, pide: 'numero' })
  })

  it('dado por su fórmula se escribe el nombre, sin importar las mayúsculas', () => {
    const { estudio } = montar(() => 0)
    const ejercicio = empezarRadicales(estudio)
    const pregunta = ejercicio.pregunta!
    if (pregunta.tipo !== 'radical') throw new Error('Se esperaba un Radical')

    expect(pregunta.dadoPor).toBe('formula')
    expect(estudio.responderDictado(ejercicio, pregunta.radical.nombre.toUpperCase()).respuesta).toBeNull()
    expect(estudio.responderDictado(ejercicio, formulaDe(pregunta.radical)).respuesta).not.toBeNull()
  })

  it('dado por su nombre se escribe la fórmula, sin importar las mayúsculas', () => {
    const { estudio } = montar(() => 0.9)
    const ejercicio = empezarRadicales(estudio)
    const pregunta = ejercicio.pregunta!
    if (pregunta.tipo !== 'radical') throw new Error('Se esperaba un Radical')

    expect(pregunta.dadoPor).toBe('nombre')
    expect(estudio.responderDictado(ejercicio, formulaDe(pregunta.radical).toUpperCase()).respuesta).toBeNull()
    expect(estudio.responderDictado(ejercicio, pregunta.radical.nombre).respuesta).not.toBeNull()
  })

  it('el número se acierta con el de su Elemento central, y fallarlo cuenta como fallo aunque se escribiera bien', () => {
    const { estudio } = montar()
    const dictado = acertar(estudio, empezarRadicales(estudio))
    const pregunta = dictado.pregunta!
    if (pregunta.tipo !== 'radical') throw new Error('Se esperaba un Radical')
    const numero = numeroDeRadical(pregunta.radical)
    expect(estudio.memoriaDelDictado()[pregunta.radical.nombre]).toMatchObject({ intervalo: 1 })

    expect(estudio.responderDictado(dictado, [[numero]]).respuesta).toBeNull()
    expect(estudio.responderDictado(dictado, [[numero === 7 ? 6 : numero + 1]]).respuesta).not.toBeNull()
    expect(estudio.memoriaDelDictado()[pregunta.radical.nombre]).toMatchObject({ intervalo: 0 })
  })

  it('lo fallado vuelve una vez, y queda entre lo fallado', () => {
    const { estudio } = montar()
    const ejercicio = empezarRadicales(estudio)
    const fallada = ejercicio.pregunta!

    let siguiente = fallar(estudio, ejercicio)
    expect(todasLasPreguntas(siguiente)).toContain(fallada)
    expect(siguiente.radicalesFallados).toHaveLength(1)

    while (siguiente.pregunta !== fallada) siguiente = acertar(estudio, siguiente)
    siguiente = fallar(estudio, siguiente)
    expect(todasLasPreguntas(siguiente)).not.toContain(fallada)
    expect(siguiente.radicalesFallados).toHaveLength(1)
  })

  it('lo acertado vuelve a 1 día, y lo fallado vuelve mañana con Intervalo 0', () => {
    const { estudio } = montar()
    const ejercicio = empezarRadicales(estudio)
    const pregunta = ejercicio.pregunta!
    if (pregunta.tipo !== 'radical') throw new Error('Se esperaba un Radical')
    const { nombre } = pregunta.radical

    hastaElFinal(estudio, fallar(estudio, ejercicio))

    expect(estudio.memoriaDelDictado()[nombre]).toMatchObject({ intervalo: 0, vuelve: '2026-10-06' })
    const otro = Object.entries(estudio.memoriaDelDictado()).find(([clave]) => clave !== nombre)!
    expect(otro[1]).toMatchObject({ intervalo: 1, vuelve: '2026-10-06' })
  })
})

describe('Responder un Bloque', () => {
  it('acierta con todos los conjuntos exactos, en cualquier orden', () => {
    const { estudio } = conTodoEstudiado()
    const dictado = hasta(estudio, estudio.abrirDictado(), 'bloque')

    const alReves = (correcta(dictado.pregunta!) as number[][]).map((numeros) => [...numeros].reverse())

    expect(estudio.responderDictado(dictado, alReves).respuesta).toBeNull()
  })

  it('acertar no cambia a los Elementos', () => {
    const { estudio } = conTodoEstudiado()
    const antes = estudio.entradas()

    const final = hastaElFinal(estudio, estudio.abrirDictado())

    expect(estudio.entradas()).toEqual(antes)
    expect(final.elementosFallados).toEqual([])
  })

  it('al acertar deja a la vista lo acertado', () => {
    const { estudio } = conTodoEstudiado()
    const dictado = hasta(estudio, estudio.abrirDictado(), 'bloque')

    expect(acertar(estudio, dictado).acertada).toBe(dictado.pregunta)
  })

  it('fallar una fila deja Flojo solo ese Elemento, de vuelta mañana', () => {
    const { estudio } = conTodoEstudiado()
    const dictado = hasta(estudio, estudio.abrirDictado(), 'bloque')
    const pregunta = dictado.pregunta!
    if (pregunta.tipo !== 'bloque') throw new Error('Se esperaba un Bloque')
    const [primero, segundo] = pregunta.elementos

    estudio.responderDictado(dictado, pregunta.elementos.map((elemento) => (elemento === primero ? [] : elemento.numeros)))

    expect(estudio.entradas()[primero.simbolo]).toEqual({ estado: 'flojo', intervalo: 0, vuelve: '2026-10-06', fallos: 1, pasosFallados: ['numeros'] })
    expect(estudio.entradas()[segundo.simbolo].estado).toBe('sabido')
  })

  it('mientras la Corrección está abierta no se responde otra cosa', () => {
    const { estudio } = conTodoEstudiado()
    const dictado = hasta(estudio, estudio.abrirDictado(), 'bloque')
    const pregunta = dictado.pregunta!
    if (pregunta.tipo !== 'bloque') throw new Error('Se esperaba un Bloque')
    const conCorreccion = estudio.responderDictado(dictado, pregunta.elementos.map(() => []))

    expect(estudio.responderDictado(conCorreccion, pregunta.elementos.map(() => [1]))).toBe(conCorreccion)
  })

  it('solo vuelve lo fallado, después del otro Bloque, y queda entre lo fallado', () => {
    const { estudio } = conTodoEstudiado()
    const dictado = hasta(estudio, estudio.abrirDictado(), 'bloque')
    const { pregunta } = dictado
    if (pregunta?.tipo !== 'bloque') throw new Error('Se esperaba un Bloque')
    const [primero, segundo] = pregunta.elementos
    const respuesta = pregunta.elementos.map((elemento) => (elemento === primero || elemento === segundo ? [] : elemento.numeros))

    const siguiente = estudio.cerrarCorreccionDeDictado(estudio.responderDictado(dictado, respuesta))

    expect(siguiente.pregunta).toBe(dictado.pendientes[0])
    expect(siguiente.pendientes.at(-1)).toMatchObject({ tipo: 'bloque', numero: pregunta.numero, elementos: [primero, segundo] })
    expect(siguiente.elementosFallados).toEqual([primero, segundo])
  })

  it('fallarlo otra vez no lo trae una tercera vez ni anota otro fallo', () => {
    const { estudio } = conTodoEstudiado()
    let dictado = fallar(estudio, hasta(estudio, estudio.abrirDictado(), 'bloque'))
    const fallado = dictado.elementosFallados[0]
    dictado = hastaOtroIntentoDe(estudio, dictado, fallado.simbolo)

    dictado = fallar(estudio, dictado)

    expect(todasLasPreguntas(dictado).filter((dictada) => dictada.tipo === 'bloque' && dictada.elementos.includes(fallado))).toEqual([])
    expect(estudio.entradas()[fallado.simbolo].fallos).toBe(1)
  })
})

function hastaOtroIntentoDe(estudio: Estudio, dictado: DictadoEnCurso, simbolo: string): DictadoEnCurso {
  let actual = dictado
  while (!(actual.pregunta?.tipo === 'bloque' && actual.pregunta.elementos.some((elemento) => elemento.simbolo === simbolo))) {
    actual = acertar(estudio, actual)
  }
  return actual
}

describe('El Dictado repasa', () => {
  it('la serie manda: el segundo Dictado, con un 30 %, repasa 1 Bloque y avanza otro', () => {
    const { estudio, reloj } = conTodoEstudiado()
    hastaElFinal(estudio, estudio.abrirDictado())
    const vistos = Object.keys(estudio.memoriaDelDictado())
    reloj.dia = '2026-10-06'

    const dictadas = deBloques(todasLasPreguntas(estudio.abrirDictado()))

    expect(dictadas.filter((bloque) => vistos.includes(bloque.clave))).toHaveLength(1)
    expect(dictadas).toHaveLength(2)
  })

  it('lo fallado no se repite Dictado tras Dictado mientras haya otros Bloques que sacar', () => {
    const { estudio, reloj } = conTodoEstudiado()
    const salen: string[] = []

    for (let hora = 10; hora < 24; hora++) {
      reloj.hora = `${hora}:00`
      let dictado = estudio.abrirDictado()
      if (hora >= 18) salen.push(...deBloques(todasLasPreguntas(dictado)).map((bloque) => bloque.clave))
      while (dictado.pregunta) {
        const { pregunta } = dictado
        dictado = estudio.responderDictado(
          dictado,
          pregunta.tipo === 'bloque'
            ? pregunta.elementos.map((elemento) => (['H', 'O'].includes(elemento.simbolo) ? [] : elemento.numeros))
            : correcta(pregunta),
        )
        if (dictado.respuesta) dictado = estudio.cerrarCorreccionDeDictado(dictado)
      }
    }

    expect(new Set(salen).size).toBeGreaterThanOrEqual(6)
  })

  it('anuncia cuántos Bloques nuevos y de repaso trae el siguiente', () => {
    const { estudio, reloj } = conTodoEstudiado()
    expect(estudio.anuncioDelDictado()).toEqual({ nuevos: 2, deRepaso: 0 })

    hastaElFinal(estudio, estudio.abrirDictado())
    reloj.dia = '2026-10-06'

    expect(estudio.anuncioDelDictado()).toEqual({ nuevos: 1, deRepaso: 1 })
  })

  it('cuenta lo visto y lo que toca', () => {
    const { estudio, reloj } = conTodoEstudiado()
    hastaElFinal(estudio, estudio.abrirDictado())
    reloj.dia = '2026-10-06'

    expect(estudio.resumenDelDictado()).toEqual({ vistos: 2, total: 10, tocan: 2 })
  })
})

describe('Seguimiento de las Oleadas', () => {
  it('sin ninguna hecha no hay nada que seguir', () => {
    expect(montar().estudio.seguimiento()).toBeNull()
  })

  it('cuenta las de hoy, la distancia a la última y la media por día, también de los Dictados', () => {
    const { estudio, reloj } = montar()
    reloj.hora = '10:00'
    acertarOleada(estudio, abrir(estudio))
    reloj.dia = '2026-10-06'
    reloj.hora = '09:00'
    acertarOleada(estudio, abrir(estudio))
    reloj.hora = '11:00'
    hastaElFinal(estudio, empezar(estudio))
    reloj.hora = '11:30'

    expect(estudio.seguimiento()).toEqual({
      oleadasDeHoy: 1,
      dictadosDeHoy: 1,
      radicalesDeHoy: 0,
      minutosDesdeLaUltima: 30,
      minutosEntreOleadas: 750,
      mediaPorDia: 1.5,
    })
  })

  it('el ejercicio de Radicales cuenta aparte', () => {
    const { estudio } = montar()
    hastaElFinal(estudio, empezarRadicales(estudio))

    expect(estudio.seguimiento()).toMatchObject({ oleadasDeHoy: 0, dictadosDeHoy: 0, radicalesDeHoy: 1 })
  })

  it('una Oleada abandonada no cuenta', () => {
    const { estudio } = montar()
    abrir(estudio)

    expect(estudio.seguimiento()).toBeNull()
  })

  it('un registro guardado sin Oleadas se conserva: los Elementos siguen', () => {
    const almacen = almacenEnMemoria()
    const entrada = { estado: 'sabido', intervalo: 3, vuelve: '2026-10-09', fallos: 0, pasosFallados: [] }
    almacen.setItem('formulalo:dominio', JSON.stringify({ version: 1, camino: 'uso', elementos: { He: entrada } }))

    const { estudio } = montar(() => 0, almacen)

    expect(estudio.entradas()).toEqual({ He: entrada })
    expect(estudio.seguimiento()).toBeNull()
    expect(estudio.memoriaDelDictado()).toEqual({})
  })
})
