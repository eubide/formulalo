import type { Elemento } from './catalogo'

const DE_GRUPO: Record<number, string | undefined> = {
  1: 'Alcalinos',
  2: 'Alcalinotérreos',
  13: 'Térreos o boroideos',
  14: 'Carbonoideos',
  15: 'Nitrogenoideos',
  16: 'Anfígenos o calcógenos',
  17: 'Halógenos',
  18: 'Gases nobles',
}

const DE_TRANSICION = 'Metales de transición'

const SIN_FAMILIA = 'H'

export function familiaDeGrupo(grupo: number): string {
  return DE_GRUPO[grupo] ?? DE_TRANSICION
}

export function familiaDe(elemento: Elemento): string | null {
  return elemento.simbolo === SIN_FAMILIA ? null : familiaDeGrupo(elemento.grupo)
}
