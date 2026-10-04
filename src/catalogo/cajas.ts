import { configuracionDe, esDeTransicion, type Elemento, type Letra, type Subnivel } from './catalogo'

export type Flecha = 'arriba' | 'abajo'

export interface Sitio {
  subnivel: string
  orbital: number
  flecha: Flecha
}

export interface Parte extends Subnivel {
  orbitales: number
  recogida: boolean
}

export interface Cajas {
  gasNoble: string | null
  partes: Parte[]
}

export interface Fila {
  numero: number
  marcas: Sitio[]
}

export interface UltimoElectron {
  sitio: Sitio
  cuanticos: { n: number; l: number; m: number; s: number }
}

const LETRAS: Letra[] = ['s', 'p', 'd', 'f']

function nombreDe({ capa, letra }: Subnivel): string {
  return `${capa}${letra}`
}

function deValencia(elemento: Elemento): string[] {
  const capa = elemento.periodo
  if (esDeTransicion(elemento)) return [`${capa}s`, `${capa - 1}d`]
  return capa === 1 ? ['1s'] : [`${capa}s`, `${capa}p`]
}

export function cajasDe(elemento: Elemento): Cajas {
  const { gasNoble, trasElGasNoble } = configuracionDe(elemento)
  const valencia = deValencia(elemento)
  const escritos = trasElGasNoble.map(nombreDe)
  const sinEstrenar = valencia
    .filter((nombre) => !escritos.includes(nombre))
    .map((nombre): Subnivel => ({ capa: Number(nombre[0]), letra: nombre[1] as Letra, electrones: 0 }))
  return {
    gasNoble,
    partes: [...trasElGasNoble, ...sinEstrenar].map((subnivel) => ({
      ...subnivel,
      orbitales: 2 * LETRAS.indexOf(subnivel.letra) + 1,
      recogida: !valencia.includes(nombreDe(subnivel)),
    })),
  }
}

function mitadesEnOrdenDeLlenado(parte: Parte): Sitio[] {
  const orbitales = Array.from({ length: parte.orbitales }, (_, orbital) => orbital)
  const de = (flecha: Flecha) => orbitales.map((orbital): Sitio => ({ subnivel: nombreDe(parte), orbital, flecha }))
  return [...de('arriba'), ...de('abajo')]
}

export function ocupacionDe(parte: Parte): Sitio[] {
  return mitadesEnOrdenDeLlenado(parte).slice(0, parte.electrones)
}

function flechasDeDerechaAIzquierda(parte: Parte): Sitio[] {
  return ocupacionDe(parte).sort(
    (a, b) => b.orbital - a.orbital || Number(b.flecha === 'abajo') - Number(a.flecha === 'abajo'),
  )
}

export function filasDe(elemento: Elemento): Fila[] {
  const cajas = cajasDe(elemento).partes.filter((parte) => !parte.recogida)
  // Qué electrón de un subnivel se va no significa nada: el orden solo deja las marcas ordenadas.
  const enOrdenDeSalida = esDeTransicion(elemento) ? cajas : [...cajas].reverse()
  const sueltas = enOrdenDeSalida.flatMap(flechasDeDerechaAIzquierda)
  const ultima = cajas.at(-1)!
  const vacias = mitadesEnOrdenDeLlenado(ultima).slice(ultima.electrones)
  return elemento.numeros.map((numero) => ({
    numero,
    marcas: numero > 0 ? sueltas.slice(0, numero) : vacias.slice(0, -numero),
  }))
}

export function ultimoElectronDe(elemento: Elemento): UltimoElectron {
  const ultima = cajasDe(elemento).partes.findLast((parte) => parte.electrones > 0)!
  const sitio = ocupacionDe(ultima).at(-1)!
  const l = LETRAS.indexOf(ultima.letra)
  return {
    sitio,
    cuanticos: { n: ultima.capa, l, m: sitio.orbital - l, s: sitio.flecha === 'arriba' ? 0.5 : -0.5 },
  }
}
