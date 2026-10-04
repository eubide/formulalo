import datos from '../datos/elementos.json'

export type Clase = 'metal' | 'metaloide' | 'no-metal'

export type Letra = 's' | 'p' | 'd' | 'f'

export interface Subnivel {
  capa: number
  letra: Letra
  electrones: number
}

export interface Elemento {
  z: number
  simbolo: string
  nombre: string
  grupo: number
  periodo: number
  clase: Clase
  configuracion: string
  numeros: number[]
  fuente: 'hoja' | 'libro'
}

export interface Configuracion {
  subniveles: Subnivel[]
  gasNoble: string | null
  trasElGasNoble: Subnivel[]
}

export const etiquetaDeClase: Record<Clase, string> = {
  metal: 'Metal',
  metaloide: 'Metaloide',
  'no-metal': 'No metal',
}

const ELEMENTOS = datos as Elemento[]
const porSimbolo = new Map(ELEMENTOS.map((elemento) => [elemento.simbolo, elemento]))

export function elementos(): Elemento[] {
  return ELEMENTOS
}

export function elementoDe(simbolo: string): Elemento {
  const elemento = porSimbolo.get(simbolo)
  if (!elemento) throw new Error(`No se estudia ${simbolo}`)
  return elemento
}

export function esDeTransicion(elemento: Elemento): boolean {
  return elemento.grupo >= 3 && elemento.grupo <= 12
}

export function configuracionDe(elemento: Elemento): Configuracion {
  const gasNoble = /^\[(\w+)\]/.exec(elemento.configuracion)?.[1] ?? null
  const trasElGasNoble = [...elemento.configuracion.matchAll(/(\d)([spdf])(\d+)/g)].map(
    ([, capa, letra, electrones]): Subnivel => ({ capa: Number(capa), letra: letra as Letra, electrones: Number(electrones) }),
  )
  const delGasNoble = gasNoble ? configuracionDe(elementoDe(gasNoble)).subniveles : []
  return { subniveles: [...delGasNoble, ...trasElGasNoble], gasNoble, trasElGasNoble }
}

export function ultimoSubnivel(elemento: Elemento): Subnivel | null {
  return esDeTransicion(elemento) ? null : configuracionDe(elemento).subniveles.at(-1)!
}

export function electronesDeValencia(elemento: Elemento): number {
  return configuracionDe(elemento)
    .subniveles.filter((subnivel) => subnivel.capa === elemento.periodo)
    .reduce((suma, subnivel) => suma + subnivel.electrones, 0)
}
