import { elementos, type Elemento } from './catalogo'
import { trozosDeTransicion } from './historias'

export type Camino = 'gas-noble' | 'uso'

export const etiquetaDeCamino: Record<Camino, string> = {
  'gas-noble': 'Desde el gas noble',
  uso: 'Por uso al formular',
}

export const descripcionDeCamino: Record<Camino, string> = {
  'gas-noble': 'Grupos 18, 1, 2, 17, 16, 15, 14 y 13, y después los metales de transición.',
  uso: 'Primero el H y el O; después los grupos 1, 2, 17, 16, 15, 14 y 13, los metales de transición y el 18.',
}

const PRIMEROS_POR_USO = ['H', 'O']

function grupo(numero: number, sin: string[] = []): string[] {
  return elementos()
    .filter((elemento) => elemento.grupo === numero && !sin.includes(elemento.simbolo))
    .map((elemento) => elemento.simbolo)
}

export function trozosDe(camino: Camino): string[][] {
  if (camino === 'gas-noble') {
    return [...[18, 1, 2, 17, 16, 15, 14, 13].map((numero) => grupo(numero)), ...trozosDeTransicion()]
  }
  return [
    PRIMEROS_POR_USO,
    ...[1, 2, 17, 16, 15, 14, 13].map((numero) => grupo(numero, PRIMEROS_POR_USO)),
    ...trozosDeTransicion(),
    grupo(18),
  ]
}

export function trozoPorGrupoDe(elemento: Elemento): string[] {
  return trozosDeTransicion().find((trozo) => trozo.includes(elemento.simbolo)) ?? grupo(elemento.grupo)
}
