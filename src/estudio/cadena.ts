import {
  esDeTransicion,
  tiraDe,
  ultimoSubnivel,
  type Clase,
  type Elemento,
  type Subnivel,
  type Tira,
} from '../catalogo/catalogo'
import { historiaDeOrden, historiaDeSimbolo, historiaDeTrozo } from '../catalogo/historias'
import { excepcionDe, REGLA_DE_CONFIGURACION, reglaDe, type Regla } from '../catalogo/reglas'

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
  tira: Tira
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

export function preguntar(elemento: Elemento, azar: Azar): Pregunta {
  return {
    elemento,
    dadoPor: azar() < 0.5 ? 'simbolo' : 'nombre',
    paso: 'posicion',
    fallados: [],
    tira: tiraDe(elemento),
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
