import datos from '../datos/compuestos.json'
import { normalizada, SUBINDICES } from './radicales'

export interface Parte {
  simbolo: string
  numero: number
}

export interface Compuesto {
  nombre: string
  positivo: Parte
  negativo: Parte
}

const COMPUESTOS = datos as Compuesto[]

export function compuestos(): Compuesto[] {
  return COMPUESTOS
}

function maximoComunDivisor(a: number, b: number): number {
  return b === 0 ? a : maximoComunDivisor(b, a % b)
}

function atomosDe({ positivo, negativo }: Compuesto): [number, number] {
  const comun = maximoComunDivisor(positivo.numero, -negativo.numero)
  return [-negativo.numero / comun, positivo.numero / comun]
}

export function formulaDeCompuesto(compuesto: Compuesto): string {
  const [delPositivo, delNegativo] = atomosDe(compuesto)
  const subindice = (cuantos: number) => (cuantos > 1 ? SUBINDICES[cuantos] : '')
  return `${compuesto.positivo.simbolo}${subindice(delPositivo)}${compuesto.negativo.simbolo}${subindice(delNegativo)}`
}

export function cuentaDeCompuesto(compuesto: Compuesto): string {
  const [delPositivo, delNegativo] = atomosDe(compuesto)
  return `${delPositivo}·(+${compuesto.positivo.numero}) + ${delNegativo}·(−${-compuesto.negativo.numero}) = 0`
}

export function esSuFormulaDeCompuesto(compuesto: Compuesto, texto: string): boolean {
  return normalizada(texto) === normalizada(formulaDeCompuesto(compuesto))
}
