import { describe, expect, it } from 'vitest'
import { elementoDe } from '../catalogo/catalogo'
import PasoNumeros from './PasoNumeros.svelte'
import { pintar } from './pintar'

describe('el paso de Números de oxidación', () => {
  it('ofrece ver las Cajas con un botón que dice lo que hace', () => {
    const texto = pintar(PasoNumeros, { elemento: elementoDe('O'), opciones: [-2, 2], alResponder: () => {} })

    expect(texto).toContain('Ver sus cajas')
  })
})
