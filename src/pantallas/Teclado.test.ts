import { describe, expect, it } from 'vitest'
import { pintar } from './pintar'
import Teclado, { sitioDe } from './Teclado.svelte'

const TECLADO = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7]

describe('Teclado', () => {
  it('a la izquierda de la línea, los positivos: impares arriba y pares debajo, bajando hacia el centro', () => {
    expect([7, 5, 3, 1].map(sitioDe)).toEqual([
      { fila: 1, columna: 1 },
      { fila: 1, columna: 2 },
      { fila: 1, columna: 3 },
      { fila: 1, columna: 4 },
    ])
    expect([6, 4, 2].map(sitioDe)).toEqual([
      { fila: 2, columna: 1 },
      { fila: 2, columna: 2 },
      { fila: 2, columna: 3 },
    ])
  })

  it('a la derecha de la línea, los negativos: impares arriba y pares debajo, alejándose del centro', () => {
    expect([-1, -3, -5].map(sitioDe)).toEqual([
      { fila: 1, columna: 6 },
      { fila: 1, columna: 7 },
      { fila: 1, columna: 8 },
    ])
    expect([-2, -4].map(sitioDe)).toEqual([
      { fila: 2, columna: 7 },
      { fila: 2, columna: 8 },
    ])
  })

  it('se lee en ese orden', () => {
    const texto = pintar(Teclado, { opciones: TECLADO, marcados: [], alAlternar: () => {} })

    expect(texto).toBe('+7 +5 +3 +1 +6 +4 +2 −1 −3 −5 −2 −4')
  })

  it('con menos opciones, cada número sigue en su sitio, y el 0 ocupa el hueco bajo el +1', () => {
    const texto = pintar(Teclado, { opciones: [-2, 0, 2, 4, 6], marcados: [], alAlternar: () => {} })

    expect(texto).toBe('+6 +4 +2 0 −2')
    expect(sitioDe(0)).toEqual({ fila: 2, columna: 4 })
  })
})
