import type { Anuncio } from '../estudio/estudio'

export function tocaAlgo({ repaso, nuevos }: Anuncio): boolean {
  return repaso + nuevos > 0
}

export function textoDelAnuncio({ repaso, nuevos, practica, minutos, quedan }: Anuncio): string {
  return [
    repaso > 0 && `${repaso} de repaso`,
    nuevos > 0 && `${nuevos} ${nuevos === 1 ? 'nuevo' : 'nuevos'}`,
    practica > 0 && `${practica} de práctica`,
    minutos === 1 ? '1 min' : `unos ${minutos} min`,
    quedan > 0 && (quedan === 1 ? 'queda 1 más para hoy' : `quedan ${quedan} más para hoy`),
  ]
    .filter((parte) => parte !== false)
    .join(' · ')
}
