import { elementoDe, elementos, type Elemento } from './catalogo'

const GRUPOS = [1, 2, 13, 14, 15, 16, 17]
const DE_TRANSICION = [
  ['Cu', 'Ag', 'Au', 'Zn', 'Cd', 'Hg'],
  ['Fe', 'Co', 'Ni', 'Cr', 'Mn'],
  ['Sc', 'Pd', 'Pt', 'Sn', 'Pb'],
]

export function bloques(): Elemento[][] {
  return [
    ...GRUPOS.map((grupo) => elementos().filter((elemento) => elemento.grupo === grupo)),
    ...DE_TRANSICION.map((simbolos) => simbolos.map(elementoDe)),
  ]
}
