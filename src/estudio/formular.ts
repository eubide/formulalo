import { compuestos, esSuFormulaDeCompuesto, type Compuesto } from '../catalogo/compuestos'
import { normalizada } from '../catalogo/radicales'
import { barajar, type Azar } from './cadena'

const COMPUESTOS_POR_OLEADA = 5

export const PIEZAS = ['simbolos', 'numeros', 'formula'] as const

export type Pieza = (typeof PIEZAS)[number]

export type RespuestaDePieza =
  | { pieza: 'simbolos'; simbolos: string[] }
  | { pieza: 'numeros'; positivo: number; negativo: number }
  | { pieza: 'formula'; formula: string }

export interface Formulando {
  compuesto: Compuesto
  pieza: Pieza
  fase: 'pregunta' | 'correccion' | 'resuelto'
  fallos: Pieza[]
  escrito: string | null
  pendientes: Compuesto[]
}

function empezar([compuesto, ...pendientes]: Compuesto[]): Formulando | null {
  return compuesto ? { compuesto, pieza: 'simbolos', fase: 'pregunta', fallos: [], escrito: null, pendientes } : null
}

export function empezarAFormular(esSabido: (simbolo: string) => boolean, deLaOleada: string[], azar: Azar): Formulando | null {
  const elegibles = compuestos().filter(({ positivo, negativo }) => {
    const simbolos = [positivo.simbolo, negativo.simbolo]
    return simbolos.every(esSabido) && simbolos.some((simbolo) => deLaOleada.includes(simbolo))
  })
  return empezar(barajar(elegibles, azar).slice(0, COMPUESTOS_POR_OLEADA))
}

function acierta(compuesto: Compuesto, respuesta: RespuestaDePieza): boolean {
  const { positivo, negativo } = compuesto
  if (respuesta.pieza === 'simbolos') {
    const ordenados = (simbolos: string[]) => simbolos.map(normalizada).sort().join(' ')
    return ordenados(respuesta.simbolos) === ordenados([positivo.simbolo, negativo.simbolo])
  }
  if (respuesta.pieza === 'numeros') return respuesta.positivo === positivo.numero && respuesta.negativo === negativo.numero
  return esSuFormulaDeCompuesto(compuesto, respuesta.formula)
}

function siguientePieza(formulando: Formulando): Formulando {
  return { ...formulando, fase: 'pregunta', pieza: PIEZAS[PIEZAS.indexOf(formulando.pieza) + 1] }
}

export function trasResponder(formulando: Formulando, respuesta: RespuestaDePieza): Formulando {
  if (formulando.fase !== 'pregunta' || respuesta.pieza !== formulando.pieza) return formulando
  const acertada = acierta(formulando.compuesto, respuesta)
  const fallos = acertada ? formulando.fallos : [...formulando.fallos, formulando.pieza]
  if (respuesta.pieza === 'formula') return { ...formulando, fallos, escrito: respuesta.formula, fase: 'resuelto' }
  return acertada ? siguientePieza(formulando) : { ...formulando, fallos, fase: 'correccion' }
}

export function trasSeguir(formulando: Formulando): Formulando | null {
  if (formulando.fase === 'resuelto') return empezar(formulando.pendientes)
  return formulando.fase === 'correccion' ? siguientePieza(formulando) : formulando
}
