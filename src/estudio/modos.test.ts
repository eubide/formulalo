import { describe, expect, it } from 'vitest'
import { numeroDeRadical } from '../catalogo/radicales'
import { abrir, correctaDe, estudiarElDia, montar } from './ayudantes'
import type { Dictada, Estudio, Oleada } from './estudio'

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
