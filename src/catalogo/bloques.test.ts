import { describe, expect, it } from 'vitest'
import { bloques } from './bloques'
import { elementos } from './catalogo'

const simbolos = () => bloques().map((bloque) => bloque.map((elemento) => elemento.simbolo).join(' '))

describe('Bloques', () => {
  it('son los Grupos 1, 2 y 13 a 17, y tres de metales de transición', () => {
    expect(simbolos()).toEqual([
      'H Li Na K Rb Cs Fr',
      'Be Mg Ca Sr Ba Ra',
      'B Al Ga In Tl',
      'C Si Ge Sn Pb',
      'N P As Sb Bi',
      'O S Se Te Po',
      'F Cl Br I At',
      'Cu Ag Au Zn Cd Hg',
      'Fe Co Ni Cr Mn',
      'Sc Pd Pt Sn Pb',
    ])
  })

  it('cada uno tiene entre 5 y 7 Elementos', () => {
    for (const bloque of bloques()) {
      expect(bloque.length).toBeGreaterThanOrEqual(5)
      expect(bloque.length).toBeLessThanOrEqual(7)
    }
  })

  it('cubren todos los Elementos menos los gases nobles', () => {
    const cubiertos = new Set(bloques().flat())

    expect(elementos().filter((elemento) => !cubiertos.has(elemento)).map((elemento) => elemento.simbolo)).toEqual([
      'He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn',
    ])
  })
})
