import { describe, expect, it } from 'vitest'
import { elementoDe } from '../catalogo/catalogo'
import { radicales } from '../catalogo/radicales'
import { casillasDeBloque, casillasDeCorreccion, casillasDeRadical } from './casillas'

describe('Casillas del Dictado', () => {
  it('un Bloque rotula sus Elementos y resalta el que se está marcando', () => {
    const [oxigeno, azufre] = [elementoDe('O'), elementoDe('S')]

    expect(casillasDeBloque([oxigeno, azufre], azufre)).toEqual({
      O: { rotulada: true, clase: 'no-metal' },
      S: { rotulada: true, clase: 'no-metal', senal: 'iluminada' },
    })
  })

  it('al corregir, cada Elemento lleva su señal de acierto o de fallo', () => {
    const filas = [
      { elemento: elementoDe('O'), bien: true },
      { elemento: elementoDe('Po'), bien: false },
    ]

    expect(casillasDeCorreccion(filas)).toEqual({
      O: { rotulada: true, senal: 'acierto' },
      Po: { rotulada: true, senal: 'fallo' },
    })
  })

  it('un Radical resalta su Elemento central', () => {
    const clorato = radicales().find((radical) => radical.nombre === 'clorato')!

    expect(casillasDeRadical(clorato)).toEqual({ Cl: { rotulada: true, clase: 'no-metal', senal: 'iluminada' } })
  })
})
