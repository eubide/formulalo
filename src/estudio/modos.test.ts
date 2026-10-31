import { describe, expect, it } from 'vitest'
import { formulaDe, numeroDeRadical } from '../catalogo/radicales'
import { abrir, correctaDe, estudiarElDia, montar } from './ayudantes'
import type { Dictada, DictadoEnCurso, Estudio, Oleada, RespuestaDictada } from './estudio'

function hastaLosNumeros(estudio: Estudio, oleada: Oleada): Oleada {
  let actual = oleada
  while (actual.pregunta!.paso !== 'numeros') actual = estudio.responder(actual, correctaDe(actual.pregunta!))
  return actual
}

function correctaDeSorpresa(sorpresa: Dictada): number[][] {
  return sorpresa.tipo === 'bloque' ? sorpresa.elementos.map((elemento) => elemento.numeros) : [[numeroDeRadical(sorpresa.radical)]]
}

describe('Modo', () => {
  it('viene en normal, sin ¿Seguro?, sin sorpresas y sin comentarios', () => {
    const { estudio } = montar()
    estudiarElDia(estudio)
    const oleada = estudio.abrirOleada()

    expect(estudio.modo()).toBe('normal')
    expect(oleada.pregunta!.pideSeguridad).toBe(false)
    expect(oleada.sorpresasEn).toEqual([])
    expect(estudio.responder(hastaLosNumeros(estudio, oleada), correctaDe({ ...oleada.pregunta!, paso: 'numeros' })).comentario).toBeNull()
  })

  it('se guarda en la copia y se recupera', () => {
    const { estudio } = montar()
    estudio.elegirModo('vacilon')
    const copia = estudio.copia()

    const otro = montar().estudio
    otro.recuperar(copia)

    expect(otro.modo()).toBe('vacilon')
  })
})

describe('¿Seguro?', () => {
  it('en molesto se pide siempre', () => {
    const { estudio } = montar(() => 0.99)
    estudio.elegirModo('molesto')

    expect(abrir(estudio).pregunta!.pideSeguridad).toBe(true)
  })

  it('fallar yendo seguro trae un comentario en la Corrección, y fallar dudando no', () => {
    const { estudio } = montar()
    estudio.elegirModo('molesto')
    const oleada = hastaLosNumeros(estudio, abrir(estudio))

    expect(estudio.responder(oleada, { paso: 'numeros', numeros: [], seguro: true }).correccion?.comentario).toBe('Seguro, decías. Apuntado queda.')
    expect(estudio.responder(oleada, { paso: 'numeros', numeros: [], seguro: false }).correccion?.comentario).toBeNull()
  })

  it('acertar dudando trae su comentario', () => {
    const { estudio } = montar()
    estudio.elegirModo('vacilon')
    const oleada = hastaLosNumeros(estudio, abrir(estudio))
    const { numeros } = oleada.pregunta!.elemento

    expect(estudio.responder(oleada, { paso: 'numeros', numeros, seguro: false }).comentario).toBe('Dudabas, y lo sabías.')
  })
})

describe('Comentario al acertar', () => {
  it('en vacilón sale uno de sus textos cuando toca', () => {
    const { estudio } = montar(() => 0)
    estudio.elegirModo('vacilon')
    const oleada = hastaLosNumeros(estudio, abrir(estudio))

    expect(estudio.responder(oleada, correctaDe(oleada.pregunta!)).comentario).toBe('Mira quién ha estudiado.')
  })
})

describe('Pregunta sorpresa', () => {
  function recorrer(estudio: Estudio, responderSorpresa: (sorpresa: Dictada) => number[][]) {
    let oleada = estudio.abrirOleada()
    if (oleada.presentacion) oleada = estudio.descartarPresentacion(oleada)
    let sorpresas = 0
    while (oleada.pregunta) {
      if (oleada.sorpresa) {
        sorpresas++
        oleada = estudio.cerrarSorpresa(estudio.responderSorpresa(oleada, responderSorpresa(oleada.sorpresa)))
      } else {
        oleada = estudio.responder(oleada, correctaDe(oleada.pregunta))
      }
    }
    return sorpresas
  }

  it('en molesto salen 2 por Oleada, y en vacilón 1', () => {
    const { estudio } = montar()
    estudiarElDia(estudio)

    estudio.elegirModo('molesto')
    expect(recorrer(estudio, correctaDeSorpresa)).toBe(2)

    estudio.elegirModo('vacilon')
    expect(recorrer(estudio, correctaDeSorpresa)).toBe(1)
  })

  it('fallarla no cambia los Elementos ni la memoria del Dictado', () => {
    const { estudio } = montar()
    estudiarElDia(estudio)
    estudio.elegirModo('molesto')
    const elementos = estudio.entradas()

    recorrer(estudio, () => [[]])

    expect(Object.values(estudio.entradas()).filter((entrada) => entrada.estado === 'flojo')).toEqual([])
    expect(Object.keys(estudio.entradas())).toEqual(Object.keys(elementos))
    expect(estudio.memoriaDelDictado()).toEqual({})
  })

  it('sin nada ya preguntado no hay sorpresa', () => {
    const { estudio } = montar()
    estudio.elegirModo('molesto')

    expect(recorrer(estudio, correctaDeSorpresa)).toBe(0)
  })

  it('mientras hay sorpresa no se responde la Cadena', () => {
    const { estudio } = montar()
    estudiarElDia(estudio)
    estudio.elegirModo('molesto')
    let oleada = estudio.abrirOleada()
    while (!oleada.sorpresa) oleada = estudio.responder(oleada, correctaDe(oleada.pregunta!))

    expect(estudio.responder(oleada, correctaDe(oleada.pregunta!))).toBe(oleada)
  })
})

describe('Modo en el Dictado y en Radicales', () => {
  type Tipo = DictadoEnCurso['tipo']
  const TIPOS: Tipo[] = ['dictado', 'radicales']

  function empezar(estudio: Estudio, tipo: Tipo): DictadoEnCurso {
    const ejercicio = tipo === 'dictado' ? estudio.abrirDictado() : estudio.abrirRadicales()
    return ejercicio.presentacion ? estudio.descartarPresentacionDelDictado(ejercicio) : ejercicio
  }

  function bien(pregunta: Dictada): RespuestaDictada {
    if (pregunta.tipo === 'bloque') return pregunta.elementos.map((elemento) => elemento.numeros)
    if (pregunta.pide === 'numero') return [[numeroDeRadical(pregunta.radical)]]
    return pregunta.dadoPor === 'formula' ? pregunta.radical.nombre : formulaDe(pregunta.radical)
  }

  function mal(pregunta: Dictada): RespuestaDictada {
    if (pregunta.tipo === 'bloque') return pregunta.elementos.map(() => [])
    return pregunta.pide === 'numero' ? [[]] : 'no es esto'
  }

  function sorpresasDe(estudio: Estudio, tipo: Tipo, responder: (sorpresa: Dictada) => number[][] = correctaDeSorpresa): Dictada[] {
    let ejercicio = empezar(estudio, tipo)
    const sorpresas: Dictada[] = []
    while (ejercicio.pregunta) {
      if (ejercicio.sorpresa) {
        sorpresas.push(ejercicio.sorpresa)
        ejercicio = estudio.cerrarSorpresa(estudio.responderSorpresa(ejercicio, responder(ejercicio.sorpresa)))
      } else {
        ejercicio = estudio.responderDictado(ejercicio, bien(ejercicio.pregunta))
      }
    }
    return sorpresas
  }

  it.each(TIPOS)('en normal, %s no pide ¿Seguro?, no trae sorpresas ni comentarios', (tipo) => {
    const { estudio } = montar()
    estudiarElDia(estudio)
    const ejercicio = empezar(estudio, tipo)

    expect(ejercicio.pideSeguridad).toBe(false)
    expect(ejercicio.sorpresasEn).toEqual([])
    expect(estudio.responderDictado(ejercicio, bien(ejercicio.pregunta!)).comentario).toBeNull()
  })

  it.each(TIPOS)('en molesto, %s pide ¿Seguro? siempre', (tipo) => {
    const { estudio } = montar(() => 0.99)
    estudio.elegirModo('molesto')

    expect(empezar(estudio, tipo).pideSeguridad).toBe(true)
  })

  it.each(TIPOS)('en %s, fallar yendo seguro trae un comentario en la Corrección, y fallar dudando no', (tipo) => {
    const { estudio } = montar()
    estudio.elegirModo('molesto')
    const ejercicio = empezar(estudio, tipo)
    const fallo = mal(ejercicio.pregunta!)

    expect(estudio.responderDictado(ejercicio, fallo, true).comentario).toBe('Seguro, decías. Apuntado queda.')
    expect(estudio.responderDictado(ejercicio, fallo, false).comentario).toBeNull()
  })

  it.each(TIPOS)('en %s, acertar dudando trae su comentario', (tipo) => {
    const { estudio } = montar()
    estudio.elegirModo('vacilon')
    const ejercicio = empezar(estudio, tipo)

    expect(estudio.responderDictado(ejercicio, bien(ejercicio.pregunta!), false).comentario).toBe('Dudabas, y lo sabías.')
  })

  it.each(TIPOS)('en %s, acertar en vacilón trae uno de sus textos cuando toca', (tipo) => {
    const { estudio } = montar(() => 0)
    estudio.elegirModo('vacilon')
    const ejercicio = empezar(estudio, tipo)

    expect(estudio.responderDictado(ejercicio, bien(ejercicio.pregunta!)).comentario).toBe('Mira quién ha estudiado.')
  })

  it('cerrar la Corrección quita su comentario', () => {
    const { estudio } = montar()
    estudio.elegirModo('molesto')
    const ejercicio = empezar(estudio, 'radicales')
    const fallado = estudio.responderDictado(ejercicio, mal(ejercicio.pregunta!), true)

    expect(estudio.cerrarCorreccionDeDictado(fallado).comentario).toBeNull()
  })

  it('el Dictado cuela un Radical, solo uno porque trae dos Bloques', () => {
    const { estudio } = montar()
    estudiarElDia(estudio)

    estudio.elegirModo('molesto')
    expect(sorpresasDe(estudio, 'dictado').map((sorpresa) => sorpresa.tipo)).toEqual(['radical'])

    estudio.elegirModo('vacilon')
    expect(sorpresasDe(estudio, 'dictado').map((sorpresa) => sorpresa.tipo)).toEqual(['radical'])
  })

  it('Radicales cuela Bloques: 2 en molesto y 1 en vacilón', () => {
    const { estudio } = montar()
    estudiarElDia(estudio)

    estudio.elegirModo('molesto')
    expect(sorpresasDe(estudio, 'radicales').map((sorpresa) => sorpresa.tipo)).toEqual(['bloque', 'bloque'])

    estudio.elegirModo('vacilon')
    expect(sorpresasDe(estudio, 'radicales').map((sorpresa) => sorpresa.tipo)).toEqual(['bloque'])
  })

  it.each(TIPOS)('fallar la sorpresa de %s no cambia los Elementos ni lo que anota el ejercicio', (tipo) => {
    const { estudio } = montar()
    estudiarElDia(estudio)
    estudio.elegirModo('molesto')
    const ejercicio = empezar(estudio, tipo)
    const anotables = [ejercicio.pregunta!, ...ejercicio.pendientes].map((pregunta) => (pregunta.tipo === 'bloque' ? pregunta.clave : pregunta.radical.nombre))

    sorpresasDe(estudio, tipo, () => [[]])

    expect(Object.values(estudio.entradas()).filter((entrada) => entrada.estado === 'flojo')).toEqual([])
    expect(Object.keys(estudio.memoriaDelDictado()).sort()).toEqual([...new Set(anotables)].sort())
  })

  it.each(TIPOS)('en %s, sin nada ya preguntado no hay sorpresa', (tipo) => {
    const { estudio } = montar()
    estudio.elegirModo('molesto')

    expect(sorpresasDe(estudio, tipo)).toEqual([])
  })

  it('mientras hay sorpresa no se responde el ejercicio', () => {
    const { estudio } = montar()
    estudiarElDia(estudio)
    estudio.elegirModo('molesto')
    let ejercicio = empezar(estudio, 'dictado')
    while (!ejercicio.sorpresa) ejercicio = estudio.responderDictado(ejercicio, bien(ejercicio.pregunta!))

    expect(estudio.responderDictado(ejercicio, bien(ejercicio.pregunta!))).toBe(ejercicio)
  })
})
