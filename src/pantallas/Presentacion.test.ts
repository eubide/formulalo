import { describe, expect, it } from 'vitest'
import { elementos } from '../catalogo/catalogo'
import { pintar } from './pintar'
import Presentacion from './Presentacion.svelte'

function delGrupo(grupo: number): string[] {
  return elementos()
    .filter((elemento) => elemento.grupo === grupo)
    .map((elemento) => elemento.simbolo)
}

function presentacionDe(simbolos: string[]): string {
  return pintar(Presentacion, { simbolos, alDescartar: () => {}, alSalir: () => {} })
}

function seApartan(texto: string): string | undefined {
  return /Se apartan de la regla (.*?) Historias/.exec(texto)?.[1]
}

describe('Presentación', () => {
  it('la del Grupo 14 dice que Sn y Pb pierden el negativo por ser metales, y solo se apartan Si y Ge', () => {
    const texto = presentacionDe(delGrupo(14))

    expect(texto).toContain('Sn . Es metal: sin el negativo. Pb . Es metal: sin el negativo.')
    expect(seApartan(texto)).toBe('Si : sin +2. Ge : sin negativo.')
  })

  it('la del Grupo 15 dice que Bi pierde el negativo por ser metal, y solo se aparta N', () => {
    const texto = presentacionDe(delGrupo(15))

    expect(texto).toContain('Bi . Es metal: sin el negativo.')
    expect(seApartan(texto)).toBe('N : además +1.')
  })

  it('la de un Grupo de metales sin negativo en su Regla no habla de perderlo', () => {
    expect(presentacionDe(delGrupo(2))).not.toContain('Es metal')
  })
})

describe('Cajas de la Presentación', () => {
  it('los Elementos con las mismas Cajas resueltas comparten un dibujo con todos sus Símbolos, sin gas noble ni número de capa', () => {
    const texto = presentacionDe(delGrupo(1))

    expect(texto).toContain('Hidrógeno H 1s¹ ↑ ↓ −1 +1 Li, Na, K, Rb, Cs, Fr s¹ ↑ p⁰ +1 Reglas generales')
  })

  it('las fichas de los subniveles llenos tampoco van en el dibujo común', () => {
    const texto = presentacionDe(['Zn', 'Cd', 'Hg'])

    expect(texto).toContain('Zn, Cd s² ↑ ↓ d¹⁰ ↑ ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ ↓ +2 Mercurio Hg [Xe] 4f¹⁴ 6s² ↑ ↓ 5d¹⁰ ↑ ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ ↓ +1 +2')
  })

  it('el Grupo 18 lleva tres dibujos', () => {
    expect(presentacionDe(delGrupo(18)).match(/ni suelta ni coge/g)).toHaveLength(3)
  })
})
