import { elementoDe, type Elemento } from '../catalogo/catalogo'
import type { Radical } from '../catalogo/radicales'
import type { Entrada } from '../estudio/estudio'
import type { Casilla } from '../tabla/Tabla.svelte'

export function casillasDelDominio(entradas: Record<string, Entrada>): Record<string, Casilla> {
  return Object.fromEntries(
    Object.entries(entradas).map(([simbolo, entrada]) => [
      simbolo,
      entrada.estado === 'sabido' ? { rotulada: true, clase: elementoDe(simbolo).clase } : { rotulada: true, floja: true },
    ]),
  )
}

export function casillasDeBloque(elementos: Elemento[], actual: Elemento): Record<string, Casilla> {
  return Object.fromEntries(
    elementos.map((elemento): [string, Casilla] => [
      elemento.simbolo,
      elemento === actual ? { rotulada: true, clase: elemento.clase, senal: 'iluminada' } : { rotulada: true, clase: elemento.clase },
    ]),
  )
}

export function casillasDeCorreccion(filas: { elemento: Elemento; bien: boolean }[]): Record<string, Casilla> {
  return Object.fromEntries(
    filas.map(({ elemento, bien }): [string, Casilla] => [elemento.simbolo, { rotulada: true, senal: bien ? 'acierto' : 'fallo' }]),
  )
}

export function casillasDeRadical({ central }: Radical): Record<string, Casilla> {
  return { [central]: { rotulada: true, clase: elementoDe(central).clase, senal: 'iluminada' } }
}
