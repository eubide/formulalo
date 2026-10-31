export type Modo = 'normal' | 'vacilon' | 'molesto'

export const etiquetaDeModo: Record<Modo, string> = {
  normal: 'Normal',
  vacilon: 'Vacilón',
  molesto: 'Molesto',
}

export const descripcionDeModo: Record<Modo, string> = {
  normal: 'Sin sorpresas.',
  vacilon: 'A veces te pregunta si vas seguro, te cuela un ejercicio y te suelta algún comentario.',
  molesto: 'Siempre te pregunta si vas seguro, te cuela dos ejercicios por oleada y no se calla.',
}

interface Ajustes {
  seguro: number
  sorpresas: number
  comentario: number
  alAcertar: string[]
  alFallarSeguro: string | null
  alAcertarDudando: string | null
}

const AJUSTES: Record<Modo, Ajustes> = {
  normal: { seguro: 0, sorpresas: 0, comentario: 0, alAcertar: [], alFallarSeguro: null, alAcertarDudando: null },
  vacilon: {
    seguro: 1 / 3,
    sorpresas: 1,
    comentario: 1 / 4,
    alAcertar: [
      'Mira quién ha estudiado.',
      'Vale, esta te la concedo.',
      'Hoy vienes fino.',
      'Eso no te lo esperabas ni tú.',
      'Sigue así y me quedo sin chistes.',
    ],
    alFallarSeguro: 'Ibas muy seguro, ¿eh? Este ya no se te olvida.',
    alAcertarDudando: 'Dudabas, y lo sabías.',
  },
  molesto: {
    seguro: 1,
    sorpresas: 2,
    comentario: 1 / 2,
    alAcertar: [
      '¿Seguro que no ha sido suerte?',
      'Bah, esa era fácil.',
      'Repítelo mañana y hablamos.',
      'Acertaste. Sigo sin fiarme.',
      'Uno menos. Quedan muchos.',
    ],
    alFallarSeguro: 'Seguro, decías. Apuntado queda.',
    alAcertarDudando: 'Tanta duda para esto.',
  },
}

export function ajustesDe(modo: Modo): Ajustes {
  return AJUSTES[modo]
}

export function comentarioAlAcertar(modo: Modo, azar: () => number): string | null {
  const { comentario, alAcertar } = AJUSTES[modo]
  return azar() < comentario ? alAcertar[Math.floor(azar() * alAcertar.length)] : null
}
