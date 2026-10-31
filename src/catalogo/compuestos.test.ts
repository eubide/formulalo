import { describe, expect, it } from 'vitest'
import { elementoDe } from './catalogo'
import { compuestos, cuentaDeCompuesto, esSuFormulaDeCompuesto, formulaDeCompuesto, type Compuesto } from './compuestos'

const ROMANOS: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7 }
const SUFIJOS: Record<string, string> = {
  O: 'óxido',
  Cl: 'cloruro',
  Br: 'bromuro',
  I: 'yoduro',
  F: 'fluoruro',
  S: 'sulfuro',
  N: 'nitruro',
  P: 'fosfuro',
  H: 'hidruro',
}

function compuesto(nombre: string): Compuesto {
  return compuestos().find((candidato) => candidato.nombre === nombre)!
}

describe('Compuestos', () => {
  it.each(compuestos().map((candidato) => [candidato.nombre, candidato] as const))(
    '%s usa Números de oxidación que su Elemento tiene, con el signo que le toca',
    (_, { positivo, negativo }) => {
      expect(elementoDe(positivo.simbolo).numeros).toContain(positivo.numero)
      expect(elementoDe(negativo.simbolo).numeros).toContain(negativo.numero)
      expect(positivo.numero).toBeGreaterThan(0)
      expect(negativo.numero).toBeLessThan(0)
    },
  )

  it.each(compuestos().filter(({ nombre }) => nombre !== 'agua').map((candidato) => [candidato.nombre, candidato] as const))(
    '%s se llama como dicen sus dos Elementos',
    (nombre, { positivo, negativo }) => {
      const elemento = elementoDe(positivo.simbolo)
      expect(nombre.startsWith(`${SUFIJOS[negativo.simbolo]} de ${elemento.nombre.toLowerCase()}`)).toBe(true)
      const romano = /\((\w+)\)$/.exec(nombre)?.[1]
      const positivos = elemento.numeros.filter((numero) => numero > 0)
      if (positivos.length > 1) expect(ROMANOS[romano!]).toBe(positivo.numero)
      else expect(romano).toBeUndefined()
    },
  )

  it('no repite nombre ni fórmula', () => {
    const lista = compuestos()
    expect(new Set(lista.map(({ nombre }) => nombre)).size).toBe(lista.length)
    expect(new Set(lista.map(formulaDeCompuesto)).size).toBe(lista.length)
  })

  it.each([
    ['agua', 'H₂O'],
    ['óxido de hierro(III)', 'Fe₂O₃'],
    ['óxido de plomo(IV)', 'PbO₂'],
    ['cloruro de sodio', 'NaCl'],
    ['sulfuro de aluminio', 'Al₂S₃'],
    ['nitruro de magnesio', 'Mg₃N₂'],
    ['hidruro de calcio', 'CaH₂'],
    ['óxido de nitrógeno(V)', 'N₂O₅'],
  ])('la fórmula de %s es %s, con los subíndices simplificados', (nombre, formula) => {
    expect(formulaDeCompuesto(compuesto(nombre))).toBe(formula)
  })

  it('la cuenta enseña que las cargas se anulan', () => {
    expect(cuentaDeCompuesto(compuesto('óxido de hierro(III)'))).toBe('2·(+3) + 3·(−2) = 0')
    expect(cuentaDeCompuesto(compuesto('cloruro de sodio'))).toBe('1·(+1) + 1·(−1) = 0')
  })

  it.each(['Fe2O3', 'fe2o3', 'Fe₂O₃', ' Fe2 O3 '])('admite %s como la fórmula del óxido de hierro(III)', (escrito) => {
    expect(esSuFormulaDeCompuesto(compuesto('óxido de hierro(III)'), escrito)).toBe(true)
  })

  it.each(['FeO', 'Fe3O2', 'O3Fe2', ''])('no admite %s como la fórmula del óxido de hierro(III)', (escrito) => {
    expect(esSuFormulaDeCompuesto(compuesto('óxido de hierro(III)'), escrito)).toBe(false)
  })
})
