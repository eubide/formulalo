import {
  elementos,
  esDeTransicion,
  ultimoSubnivel,
  type Clase,
  type Elemento,
  type Subnivel,
} from '../catalogo/catalogo'
import { historiaDeOrden, historiaDeSimbolo, historiaDeTrozo, trozosDeTransicion } from '../catalogo/historias'
import { excepcionDe, REGLA_DE_CONFIGURACION, reglaDe, reglasContiguas, type Regla } from '../catalogo/reglas'

export type Azar = () => number

export const PASOS = ['posicion', 'clase', 'configuracion', 'numeros'] as const

export type Paso = (typeof PASOS)[number]

export const etiquetaDePaso: Record<Paso, string> = {
  posicion: 'Posición',
  clase: 'Clase',
  configuracion: 'Configuración',
  numeros: 'Números de oxidación',
}

export type Respuesta =
  | { paso: 'posicion'; simbolo: string }
  | { paso: 'clase'; clase: Clase }
  | { paso: 'configuracion'; subnivel: Subnivel }
  | { paso: 'numeros'; numeros: number[] }

export interface Pregunta {
  elemento: Elemento
  dadoPor: 'simbolo' | 'nombre'
  paso: Paso
  fallados: Paso[]
  opciones: number[]
}

export interface Correccion {
  paso: Paso
  respuesta: Respuesta
  faltaron: number[]
  sobraron: number[]
  regla: Regla | null
  excepcion: string | null
  historias: string[]
}

const NUMERO_MINIMO = -4
const NUMERO_MAXIMO = 7
const RANGO = Array.from({ length: NUMERO_MAXIMO - NUMERO_MINIMO + 1 }, (_, i) => NUMERO_MINIMO + i)

export function barajar<T>(lista: T[], azar: Azar): T[] {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

export function pasosDe(elemento: Elemento): Paso[] {
  return PASOS.filter((paso) => paso !== 'configuracion' || !esDeTransicion(elemento))
}

function numerosVecinos(elemento: Elemento): number[] {
  if (!esDeTransicion(elemento)) return reglasContiguas(elemento).flatMap((regla) => regla.numeros)
  const otrosTrozos = trozosDeTransicion().filter((trozo) => !trozo.includes(elemento.simbolo))
  return elementos()
    .filter((otro) => otrosTrozos.some((trozo) => trozo.includes(otro.simbolo)))
    .flatMap((otro) => otro.numeros)
}

function opcionesDe(elemento: Elemento, azar: Azar): number[] {
  const verdaderos = elemento.numeros
  const cuantos = azar() < 0.5 ? 2 : 3
  const falsos = (numeros: number[]) =>
    barajar([...new Set(numeros)].filter((numero) => RANGO.includes(numero) && !verdaderos.includes(numero)), azar)
  const candidatos = [
    ...falsos(verdaderos.map((numero) => -numero)),
    ...falsos(numerosVecinos(elemento)),
    ...falsos(RANGO),
  ]
  return [...verdaderos, ...[...new Set(candidatos)].slice(0, cuantos)].sort((a, b) => a - b)
}

export function preguntar(elemento: Elemento, azar: Azar): Pregunta {
  return {
    elemento,
    dadoPor: azar() < 0.5 ? 'simbolo' : 'nombre',
    paso: 'posicion',
    fallados: [],
    opciones: opcionesDe(elemento, azar),
  }
}

export function acierta({ elemento }: Pregunta, respuesta: Respuesta): boolean {
  switch (respuesta.paso) {
    case 'posicion':
      return respuesta.simbolo === elemento.simbolo
    case 'clase':
      return respuesta.clase === elemento.clase
    case 'configuracion': {
      const { capa, letra, electrones } = ultimoSubnivel(elemento)!
      const dado = respuesta.subnivel
      return dado.capa === capa && dado.letra === letra && dado.electrones === electrones
    }
    case 'numeros':
      return (
        respuesta.numeros.length === elemento.numeros.length &&
        elemento.numeros.every((numero) => respuesta.numeros.includes(numero))
      )
  }
}

export function correccionDe({ elemento }: Pregunta, respuesta: Respuesta): Correccion {
  const vacia = { paso: respuesta.paso, respuesta, faltaron: [], sobraron: [], regla: null, excepcion: null, historias: [] }
  const presentes = (historias: (string | null)[]) => historias.filter((historia) => historia !== null)
  switch (respuesta.paso) {
    case 'posicion':
      return { ...vacia, historias: presentes([historiaDeOrden(elemento), historiaDeSimbolo(elemento)]) }
    case 'clase':
      return vacia
    case 'configuracion':
      return { ...vacia, historias: [REGLA_DE_CONFIGURACION] }
    case 'numeros':
      return {
        ...vacia,
        faltaron: elemento.numeros.filter((numero) => !respuesta.numeros.includes(numero)),
        sobraron: respuesta.numeros.filter((numero) => !elemento.numeros.includes(numero)).sort((a, b) => a - b),
        regla: reglaDe(elemento),
        excepcion: excepcionDe(elemento),
        historias: presentes([historiaDeTrozo(elemento)]),
      }
  }
}
