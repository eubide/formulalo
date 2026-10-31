import { describe, expect, it } from 'vitest'
import { abrir, acertarOleada, montar } from '../estudio/ayudantes'
import type { Estudio, Oleada, RespuestaDePieza } from '../estudio/estudio'
import Formular from './Formular.svelte'
import { pintar } from './pintar'

const SIMBOLOS: RespuestaDePieza = { pieza: 'simbolos', simbolos: ['H', 'O'] }
const NUMEROS: RespuestaDePieza = { pieza: 'numeros', positivo: 1, negativo: -2 }

function alCierreDeLaPrimeraOleada() {
  const { estudio } = montar()
  estudio.elegirCamino('uso')
  return { estudio, oleada: acertarOleada(estudio, abrir(estudio)) }
}

function pintarFormular(oleada: Oleada): string {
  return pintar(Formular, { formulando: oleada.formulando!, alResponder: () => {}, alSeguir: () => {}, alSalir: () => {} })
}

function responderLasPiezas(estudio: Estudio, oleada: Oleada, ...respuestas: RespuestaDePieza[]): Oleada {
  return respuestas.reduce((actual, respuesta) => estudio.responderPieza(actual, respuesta), oleada)
}

describe('Formular', () => {
  it('empieza dando el nombre y pidiendo sus dos Símbolos', () => {
    const { oleada } = alCierreDeLaPrimeraOleada()

    expect(pintarFormular(oleada)).toMatch(/^agua Salir · Símbolos · Números · Fórmula Quedan 1 ¿Qué dos Símbolos lleva\? .*Comprobar$/)
  })

  it('al pedir los números enseña los Símbolos y marca la pieza acertada', () => {
    const { estudio, oleada } = alCierreDeLaPrimeraOleada()

    expect(pintarFormular(responderLasPiezas(estudio, oleada, SIMBOLOS))).toMatch(
      /✓ Símbolos · Números · Fórmula .*¿Qué número de oxidación lleva cada uno\? H O /,
    )
  })

  it('al pedir la fórmula enseña los números y recuerda que las cargas se anulan', () => {
    const { estudio, oleada } = alCierreDeLaPrimeraOleada()

    expect(pintarFormular(responderLasPiezas(estudio, oleada, SIMBOLOS, NUMEROS))).toContain('H +1 · O −2 Las cargas tienen que sumar 0. ¿Cuál es su fórmula?')
  })

  it('al fallar los Símbolos da los correctos y sus nombres', () => {
    const { estudio, oleada } = alCierreDeLaPrimeraOleada()

    expect(pintarFormular(responderLasPiezas(estudio, oleada, { pieza: 'simbolos', simbolos: ['Hi', 'O'] }))).toMatch(
      /✗ Símbolos .*✗ Los Símbolos son H \(Hidrógeno\) y O \(Oxígeno\)\. Seguir$/,
    )
  })

  it('al fallar los números da los correctos', () => {
    const { estudio, oleada } = alCierreDeLaPrimeraOleada()

    expect(pintarFormular(responderLasPiezas(estudio, oleada, SIMBOLOS, { pieza: 'numeros', positivo: 2, negativo: -2 }))).toMatch(
      /✗ Los números son H \+1 y O −2 \. Seguir$/,
    )
  })

  it('resuelto enseña la fórmula y la cuenta que la cuadra', () => {
    const { estudio, oleada } = alCierreDeLaPrimeraOleada()

    expect(pintarFormular(responderLasPiezas(estudio, oleada, SIMBOLOS, NUMEROS, { pieza: 'formula', formula: 'H2O' }))).toMatch(
      /✓ Símbolos ✓ Números ✓ Fórmula .*✓ H₂O Las cargas se anulan: 2·\(\+1\) \+ 1·\(−2\) = 0\. Seguir$/,
    )
  })

  it('resuelto con la fórmula fallada dice qué se escribió', () => {
    const { estudio, oleada } = alCierreDeLaPrimeraOleada()

    expect(pintarFormular(responderLasPiezas(estudio, oleada, SIMBOLOS, NUMEROS, { pieza: 'formula', formula: 'HO2' }))).toMatch(
      /✗ H₂O Escribiste: HO2 Las cargas se anulan: /,
    )
  })
})
