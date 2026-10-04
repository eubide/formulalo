import { esDeTransicion, type Elemento } from './catalogo'

export interface Regla {
  grupo: number
  acabaEn: string
  puente: string
  numeros: number[]
  excepciones: Record<string, string>
}

const REGLAS: Regla[] = [
  {
    grupo: 18,
    acabaEn: 'p⁶ (el He, 1s²)',
    puente: 'Ocho electrones (el He, 2): ni le sobra ni le falta.',
    numeros: [0],
    excepciones: { Xe: 'además +2, +4 y +6.' },
  },
  {
    grupo: 1,
    acabaEn: 's¹',
    puente: '1 electrón: lo pierde.',
    numeros: [1],
    excepciones: { H: 'además −1. Es no metal y le falta 1 para llenar su capa.' },
  },
  {
    grupo: 2,
    acabaEn: 's²',
    puente: '2 electrones: los pierde.',
    numeros: [2],
    excepciones: {},
  },
  {
    grupo: 17,
    acabaEn: 'p⁵',
    puente: '7 electrones: le falta 1. Los positivos, impares hasta 7.',
    numeros: [-1, 1, 3, 5, 7],
    excepciones: { F: 'solo −1.', At: 'solo −1 y +1.' },
  },
  {
    grupo: 16,
    acabaEn: 'p⁴',
    puente: '6 electrones: le faltan 2. Los positivos, pares hasta 6.',
    numeros: [-2, 2, 4, 6],
    excepciones: { O: 'solo −2.', Po: 'solo +2 y +4.' },
  },
  {
    grupo: 15,
    acabaEn: 'p³',
    puente: '5 electrones: le faltan 3. Los positivos, +3 y +5.',
    numeros: [-3, 3, 5],
    excepciones: { N: 'además +1.' },
  },
  {
    grupo: 14,
    acabaEn: 'p²',
    puente: '4 electrones: le faltan 4. Los positivos, +2 y +4.',
    numeros: [-4, 2, 4],
    excepciones: { Si: 'sin +2.', Ge: 'sin negativo.' },
  },
  {
    grupo: 13,
    acabaEn: 'p¹',
    puente: '3 electrones: los pierde.',
    numeros: [3],
    excepciones: { Tl: 'además +1.' },
  },
]

export const REGLAS_GENERALES = [
  'Un metal nunca tiene número negativo. Un no metal siempre tiene alguno, o el 0 de los gases nobles. Un metaloide, casi siempre.',
  'El positivo más alto es, como mucho, el número de electrones de la capa de valencia; los demás bajan de dos en dos.',
  'El negativo son los electrones que faltan para llegar a 8 (a 2 en el H).',
]

export const REGLA_DE_CLASE =
  'Los metaloides forman una escalera que baja del B al At. A su izquierda y por debajo, metales; a su derecha y por encima, no metales. El H es no metal.'

export const REGLA_DE_CONFIGURACION =
  'El periodo da la capa, la zona de la tabla da la letra (grupos 1 y 2, s; grupos 13 a 18, p, menos el He, 1s²) y el grupo da los electrones: en s, el número del grupo; en p, el grupo menos 12.'

export const SIN_EL_NEGATIVO = 'Es metal: sin el negativo.'

export function reglaDe(elemento: Elemento): Regla | null {
  return esDeTransicion(elemento) ? null : REGLAS.find((regla) => regla.grupo === elemento.grupo)!
}

export function pierdeElNegativo(elemento: Elemento): boolean {
  return elemento.clase === 'metal' && (reglaDe(elemento)?.numeros.some((numero) => numero < 0) ?? false)
}

export function excepcionDe(elemento: Elemento): string | null {
  return reglaDe(elemento)?.excepciones[elemento.simbolo] ?? null
}

export function reglasContiguas(elemento: Elemento): Regla[] {
  const porGrupo = [...REGLAS].sort((a, b) => a.grupo - b.grupo)
  const indice = porGrupo.findIndex((regla) => regla.grupo === elemento.grupo)
  return indice < 0 ? [] : [porGrupo[indice - 1], porGrupo[indice + 1]].filter(Boolean)
}
