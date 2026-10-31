import { describe, expect, it } from 'vitest'
import { elementoDe } from '../catalogo/catalogo'
import PasoNumeros from './PasoNumeros.svelte'
import { pintar } from './pintar'

describe('el paso de Números de oxidación', () => {
  it('cuando pide seguridad, cambia Comprobar por Seguro y Dudo', () => {
    const texto = pintar(PasoNumeros, { opciones: [-2, 2], pideSeguridad: true, alResponder: () => {} })

    expect(texto).toContain('Seguro Dudo')
    expect(texto).not.toContain('Comprobar')
  })

  it('ofrece ver las Cajas con un botón que dice lo que hace', () => {
    const texto = pintar(PasoNumeros, { elemento: elementoDe('O'), opciones: [-2, 2], alResponder: () => {} })

    expect(texto).toContain('Ver sus cajas')
  })
})
