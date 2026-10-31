import { describe, expect, it } from 'vitest'
import { elementoDe } from './catalogo'
import { cuentaDe, formulaDe, numeroDeRadical, radicales, radicalesDe } from './radicales'

const DE_LA_TABLA_DE_RADICALES: [string, string, number][] = [
  ['hipofluorito', 'FO⁻', 1],
  ['fluorito', 'FO₂⁻', 3],
  ['fluorato', 'FO₃⁻', 5],
  ['perfluorato', 'FO₄⁻', 7],
  ['hipoclorito', 'ClO⁻', 1],
  ['clorito', 'ClO₂⁻', 3],
  ['clorato', 'ClO₃⁻', 5],
  ['perclorato', 'ClO₄⁻', 7],
  ['hipobromito', 'BrO⁻', 1],
  ['bromito', 'BrO₂⁻', 3],
  ['bromato', 'BrO₃⁻', 5],
  ['perbromato', 'BrO₄⁻', 7],
  ['hipoyodito', 'IO⁻', 1],
  ['yodito', 'IO₂⁻', 3],
  ['yodato', 'IO₃⁻', 5],
  ['peryodato', 'IO₄⁻', 7],
  ['hiposulfito', 'SO₂²⁻', 2],
  ['sulfito', 'SO₃²⁻', 4],
  ['sulfato', 'SO₄²⁻', 6],
  ['hiposelenito', 'SeO₂²⁻', 2],
  ['selenito', 'SeO₃²⁻', 4],
  ['selenato', 'SeO₄²⁻', 6],
  ['hipotelurito', 'TeO₂²⁻', 2],
  ['telurito', 'TeO₃²⁻', 4],
  ['telurato', 'TeO₄²⁻', 6],
  ['carbonito', 'CO₂²⁻', 2],
  ['carbonato', 'CO₃²⁻', 4],
  ['silicato', 'SiO₃²⁻', 4],
  ['cromato', 'CrO₄²⁻', 6],
  ['dicromato', 'Cr₂O₇²⁻', 6],
  ['nitrito', 'NO₂⁻', 3],
  ['nitrato', 'NO₃⁻', 5],
  ['fosfito', 'PO₃³⁻', 3],
  ['fosfato', 'PO₄³⁻', 5],
  ['arsenito', 'AsO₃³⁻', 3],
  ['arsenato', 'AsO₄³⁻', 5],
  ['antimonito', 'SbO₃³⁻', 3],
  ['antimoniato', 'SbO₄³⁻', 5],
  ['borato', 'BO₃³⁻', 3],
]

function radicalLlamado(nombre: string) {
  return radicales().find((radical) => radical.nombre === nombre)!
}

describe('Radicales', () => {
  it('son los 39 de la Tabla de radicales', () => {
    expect(radicales().map((radical) => radical.nombre).sort()).toEqual(
      DE_LA_TABLA_DE_RADICALES.map(([nombre]) => nombre).sort(),
    )
  })

  it.each(DE_LA_TABLA_DE_RADICALES)('el %s se escribe %s y su Elemento central lleva %i', (nombre, formula, numero) => {
    const radical = radicalLlamado(nombre)

    expect(formulaDe(radical)).toBe(formula)
    expect(numeroDeRadical(radical)).toBe(numero)
  })

  it('el número de cada Radical es uno de los Números de oxidación de su Elemento central', () => {
    for (const radical of radicales()) {
      expect(elementoDe(radical.central).numeros, radical.nombre).toContain(numeroDeRadical(radical))
    }
  })

  it('los de un mismo Elemento central van del número más bajo al más alto', () => {
    expect(radicalesDe('Cl').map((radical) => radical.nombre)).toEqual(['hipoclorito', 'clorito', 'clorato', 'perclorato'])
    expect(radicalesDe('Cr').map((radical) => radical.nombre)).toEqual(['cromato', 'dicromato'])
  })

  it('la cuenta suma el Elemento central y los oxígenos hasta la carga', () => {
    expect(cuentaDe(radicalLlamado('clorato'))).toBe('x + 3·(−2) = −1')
    expect(cuentaDe(radicalLlamado('hipoclorito'))).toBe('x + 1·(−2) = −1')
    expect(cuentaDe(radicalLlamado('dicromato'))).toBe('2x + 7·(−2) = −2')
    expect(cuentaDe(radicalLlamado('fosfato'))).toBe('x + 4·(−2) = −3')
  })
})
