import datos from '../datos/radicales.json'

export interface Radical {
  nombre: string
  central: string
  atomos: number
  oxigenos: number
  carga: number
}

const RADICALES = datos as Radical[]
const NUMERO_DEL_OXIGENO = -2
const SUBINDICES = '₀₁₂₃₄₅₆₇₈₉'
const VOLADOS = '⁰¹²³⁴⁵⁶⁷⁸⁹'

export function radicales(): Radical[] {
  return RADICALES
}

export function radicalesDe(central: string): Radical[] {
  return RADICALES.filter((radical) => radical.central === central)
}

export function numeroDeRadical({ atomos, oxigenos, carga }: Radical): number {
  return (-carga - oxigenos * NUMERO_DEL_OXIGENO) / atomos
}

export function formulaDe({ central, atomos, oxigenos, carga }: Radical): string {
  const subindice = (cuantos: number) => (cuantos > 1 ? SUBINDICES[cuantos] : '')
  const volado = carga > 1 ? VOLADOS[carga] : ''
  return `${central}${subindice(atomos)}O${subindice(oxigenos)}${volado}⁻`
}

export function cuentaDe({ atomos, oxigenos, carga }: Radical): string {
  return `${atomos > 1 ? atomos : ''}x + ${oxigenos}·(−2) = −${carga}`
}
