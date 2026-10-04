import { elementoDe } from '../catalogo/catalogo'
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
