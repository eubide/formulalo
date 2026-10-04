import { describe, expect, it } from 'vitest'
import { pintar } from './pintar'
import Presentacion from './Presentacion.svelte'

function presentada(simbolos: string[]): string {
  return pintar(Presentacion, { simbolos, alDescartar: () => {}, alSalir: () => {} })
}

function seApartan(texto: string): string | undefined {
  return /Se apartan de la regla (.*?) Historias/.exec(texto)?.[1]
}

describe('Presentación', () => {
  it('la del Grupo 14 dice que Sn y Pb pierden el negativo por ser metales, y solo se apartan Si y Ge', () => {
    const texto = presentada(['C', 'Si', 'Ge', 'Sn', 'Pb'])

    expect(texto).toContain('Sn . Es metal: sin el negativo. Pb . Es metal: sin el negativo.')
    expect(seApartan(texto)).toBe('Si : sin +2. Ge : sin negativo.')
  })

  it('la del Grupo 15 dice que Bi pierde el negativo por ser metal, y solo se aparta N', () => {
    const texto = presentada(['N', 'P', 'As', 'Sb', 'Bi'])

    expect(texto).toContain('Bi . Es metal: sin el negativo.')
    expect(seApartan(texto)).toBe('N : además +1.')
  })

  it('la de un Grupo de metales sin negativo en su Regla no habla de perderlo', () => {
    expect(presentada(['Be', 'Mg', 'Ca', 'Sr', 'Ba', 'Ra'])).not.toContain('Es metal')
  })
})
