import { describe, expect, it } from 'vitest'
import { abrir, acertarOleada, estudiarElDia, fallar, montar } from './ayudantes'
import type { Estudio, Oleada } from './estudio'
import type { RespuestaDePieza } from './formular'

function porUso() {
  const montado = montar()
  montado.estudio.elegirCamino('uso')
  return montado
}

function acertarPieza(estudio: Estudio, oleada: Oleada): Oleada {
  const { compuesto, pieza } = oleada.formulando!
  const { positivo, negativo } = compuesto
  const respuesta: RespuestaDePieza =
    pieza === 'simbolos'
      ? { pieza, simbolos: [positivo.simbolo, negativo.simbolo] }
      : { pieza: 'numeros', positivo: positivo.numero, negativo: negativo.numero }
  return estudio.responderPieza(oleada, respuesta)
}

describe('Compuestos al cierre de la Oleada', () => {
  it('con el H y el O Sabidos, la primera Oleada del Camino por uso acaba escribiendo el agua', () => {
    const { estudio } = porUso()

    const oleada = acertarOleada(estudio, abrir(estudio))

    expect(oleada.pregunta).toBeNull()
    expect(oleada.formulando?.compuesto.nombre).toBe('agua')
    expect(oleada.formulando?.pieza).toBe('simbolos')
  })

  it('si un Elemento se queda Flojo no se le pregunta en un Compuesto', () => {
    const { estudio } = porUso()

    const oleada = acertarOleada(estudio, fallar(estudio, abrir(estudio), ['numeros']))

    expect(oleada.formulando).toBeNull()
  })

  it('una Oleada dejada sin terminar no llega a los Compuestos', () => {
    const { estudio } = porUso()

    expect(abrir(estudio).formulando).toBeNull()
  })

  it('pide como mucho 5, y todos llevan algún Elemento de esa Oleada y dos Sabidos', () => {
    const { estudio } = montar()
    estudiarElDia(estudio)
    const oleada = acertarOleada(estudio, abrir(estudio))
    const preguntados = [oleada.formulando!.compuesto, ...oleada.formulando!.pendientes]

    expect(preguntados.length).toBeGreaterThan(0)
    expect(preguntados.length).toBeLessThanOrEqual(5)
    for (const { positivo, negativo } of preguntados) {
      expect(oleada.rotulados.some((simbolo) => [positivo.simbolo, negativo.simbolo].includes(simbolo))).toBe(true)
      expect(estudio.entradas()[positivo.simbolo].estado).toBe('sabido')
      expect(estudio.entradas()[negativo.simbolo].estado).toBe('sabido')
    }
  })

  it('las piezas van en orden: Símbolos, números y fórmula', () => {
    const { estudio } = porUso()
    let oleada = acertarOleada(estudio, abrir(estudio))

    oleada = acertarPieza(estudio, oleada)
    expect(oleada.formulando?.pieza).toBe('numeros')

    oleada = acertarPieza(estudio, oleada)
    expect(oleada.formulando?.pieza).toBe('formula')
  })

  it('los Símbolos valen en cualquier orden y dan igual las mayúsculas', () => {
    const { estudio } = porUso()
    const oleada = estudio.responderPieza(acertarOleada(estudio, abrir(estudio)), { pieza: 'simbolos', simbolos: ['o', 'H'] })

    expect(oleada.formulando?.fallos).toEqual([])
    expect(oleada.formulando?.pieza).toBe('numeros')
  })

  it('fallar una pieza enseña la Corrección y, al seguir, pasa a la siguiente con el fallo apuntado', () => {
    const { estudio } = porUso()
    let oleada = estudio.responderPieza(acertarOleada(estudio, abrir(estudio)), { pieza: 'simbolos', simbolos: ['H', 'Os'] })

    expect(oleada.formulando?.fase).toBe('correccion')
    expect(oleada.formulando?.pieza).toBe('simbolos')

    oleada = estudio.seguirFormulando(oleada)

    expect(oleada.formulando?.fase).toBe('pregunta')
    expect(oleada.formulando?.pieza).toBe('numeros')
    expect(oleada.formulando?.fallos).toEqual(['simbolos'])
  })

  it('los números tienen que ser los del Compuesto', () => {
    const { estudio } = porUso()
    const oleada = estudio.responderPieza(acertarOleada(estudio, abrir(estudio)), { pieza: 'simbolos', simbolos: ['H', 'O'] })

    expect(estudio.responderPieza(oleada, { pieza: 'numeros', positivo: 1, negativo: -1 }).formulando?.fase).toBe('correccion')
    expect(estudio.responderPieza(oleada, { pieza: 'numeros', positivo: 1, negativo: -2 }).formulando?.fase).toBe('pregunta')
  })

  it('la fórmula cierra el Compuesto, se acierte o se falle, guardando lo escrito', () => {
    const { estudio } = porUso()
    let oleada = acertarOleada(estudio, abrir(estudio))
    oleada = acertarPieza(estudio, acertarPieza(estudio, oleada))

    const fallado = estudio.responderPieza(oleada, { pieza: 'formula', formula: 'HO2' })
    expect(fallado.formulando?.fase).toBe('resuelto')
    expect(fallado.formulando?.fallos).toEqual(['formula'])
    expect(fallado.formulando?.escrito).toBe('HO2')

    const acertado = estudio.responderPieza(oleada, { pieza: 'formula', formula: 'H2O' })
    expect(acertado.formulando?.fase).toBe('resuelto')
    expect(acertado.formulando?.fallos).toEqual([])
  })

  it('al seguir desde un Compuesto resuelto pasa al siguiente y, sin más, deja el fin de Oleada', () => {
    const { estudio } = porUso()
    let oleada = acertarOleada(estudio, abrir(estudio))
    oleada = estudio.responderPieza(acertarPieza(estudio, acertarPieza(estudio, oleada)), { pieza: 'formula', formula: 'H2O' })

    expect(estudio.seguirFormulando(oleada).formulando).toBeNull()
  })

  it('fallar un Compuesto no escribe en el Dominio', () => {
    const { estudio } = porUso()
    let oleada = acertarOleada(estudio, abrir(estudio))
    const antes = estudio.copia()

    oleada = estudio.responderPieza(oleada, { pieza: 'simbolos', simbolos: ['X', 'Y'] })
    oleada = estudio.seguirFormulando(oleada)
    oleada = estudio.responderPieza(oleada, { pieza: 'numeros', positivo: 7, negativo: -4 })
    oleada = estudio.seguirFormulando(oleada)
    oleada = estudio.responderPieza(oleada, { pieza: 'formula', formula: 'XY' })
    estudio.seguirFormulando(oleada)

    expect(estudio.copia()).toBe(antes)
  })

  it('se puede dejar y la Oleada sigue terminada', () => {
    const { estudio } = porUso()
    const oleada = acertarOleada(estudio, abrir(estudio))

    expect(estudio.dejarDeFormular(oleada).formulando).toBeNull()
    expect(estudio.seguimiento()?.oleadasDeHoy).toBe(1)
  })
})
