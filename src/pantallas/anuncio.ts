import type { Anuncio, AnuncioDeEjercicio, ResumenDeEjercicio, Seguimiento } from '../estudio/estudio'
import { fechaLarga } from './fecha'

function duracion(minutos: number): string {
  if (minutos < 60) return `${Math.max(1, Math.round(minutos))} min`
  if (minutos < 48 * 60) return `${Math.round(minutos / 60)} h`
  return `${Math.round(minutos / (24 * 60))} días`
}

export function textoDelSeguimiento(seguimiento: Seguimiento): string {
  const { oleadasDeHoy, dictadosDeHoy, radicalesDeHoy, minutosDesdeLaUltima, minutosEntreOleadas, mediaPorDia } = seguimiento
  const deHoy = [
    oleadasDeHoy > 0 ? `${oleadasDeHoy} ${oleadasDeHoy === 1 ? 'oleada' : 'oleadas'}` : '',
    dictadosDeHoy > 0 ? `${dictadosDeHoy} ${dictadosDeHoy === 1 ? 'dictado' : 'dictados'}` : '',
    radicalesDeHoy > 0 ? `${radicalesDeHoy} de radicales` : '',
  ].filter(Boolean)
  return [
    `Hoy: ${[deHoy.slice(0, -1).join(', '), ...deHoy.slice(-1)].filter(Boolean).join(' y ') || 'nada todavía'}`,
    `la última hace ${duracion(minutosDesdeLaUltima)}`,
    ...(minutosEntreOleadas === null ? [] : [`una cada ${duracion(minutosEntreOleadas)} de media`]),
    `${mediaPorDia.toFixed(1).replace('.', ',')} al día`,
  ].join(' · ')
}

export function textoDelAnuncio({ repaso, nuevos, practica, minutos }: Anuncio): string {
  return [
    nuevos > 0 && `${nuevos} ${nuevos === 1 ? 'nuevo' : 'nuevos'}`,
    repaso > 0 && `${repaso} de repaso`,
    practica > 0 && `${practica} de práctica`,
    minutos === 1 ? '1 min' : `unos ${minutos} min`,
  ]
    .filter((parte) => parte !== false)
    .join(' · ')
}

export function textoDelRepaso({ repaso, quedan, nuevos }: Anuncio, proximaVuelta: string | null): string | null {
  const porRepasar = repaso + quedan
  if (porRepasar > 0) return `${porRepasar} por repasar hoy`
  if (!proximaVuelta) return null
  const hasta = `Nada por repasar hasta el ${fechaLarga(proximaVuelta)}`
  return nuevos > 0 ? `${hasta}.` : `${hasta}: esto es práctica y no adelanta los repasos.`
}

function nuevosYDeRepaso(nuevos: number, deRepaso: number): string {
  return [nuevos > 0 && `${nuevos} ${nuevos === 1 ? 'nuevo' : 'nuevos'}`, deRepaso > 0 && `${deRepaso} de repaso`]
    .filter((parte) => parte !== false)
    .join(' y ')
}

export function textoDeLoQueTrae(nombre: string, { nuevos, deRepaso }: AnuncioDeEjercicio): string {
  return `${nombre}: ${nuevosYDeRepaso(nuevos, deRepaso)}`
}

export function textoDeLoVisto(nombre: string, { vistos, total, tocan }: ResumenDeEjercicio): string {
  return [`${vistos} de ${total} ${nombre}`, ...(tocan > 0 ? [`${tocan} por repasar`] : [])].join(' · ')
}
