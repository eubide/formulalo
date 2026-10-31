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
export const SUBINDICES = '₀₁₂₃₄₅₆₇₈₉'
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

export function normalizada(texto: string): string {
  const digitos = [...texto].map((caracter) => {
    const subindice = SUBINDICES.indexOf(caracter)
    const volado = VOLADOS.indexOf(caracter)
    return subindice >= 0 ? subindice : volado >= 0 ? volado : caracter
  })
  return digitos
    .join('')
    .normalize('NFD')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

export function esSuNombre({ nombre }: Radical, texto: string): boolean {
  return normalizada(texto) === normalizada(nombre)
}

export function esSuFormula(radical: Radical, texto: string): boolean {
  const { central, atomos, oxigenos, carga } = radical
  const sinCarga = normalizada(`${central}${atomos > 1 ? atomos : ''}O${oxigenos > 1 ? oxigenos : ''}`)
  return [sinCarga, `${sinCarga}${carga}`].includes(normalizada(texto))
}
