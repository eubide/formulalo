import { describe, expect, it } from 'vitest'
import { abrir, acertarTanda, estudiarElDia, fallar, montar } from '../estudio/ayudantes'
import type { Estudio, Tanda } from '../estudio/estudio'
import FinDeTanda from './FinDeTanda.svelte'
import { pintar } from './pintar'
import Portada from './Portada.svelte'

function pintarFinDeTanda(estudio: Estudio, tanda: Tanda): string {
  return pintar(FinDeTanda, { tanda, estudio, alSeguir: () => {}, alVolver: () => {} })
}

describe('Fin de Tanda', () => {
  it('anuncia la Tanda siguiente con las mismas palabras que la Portada', () => {
    const { estudio, reloj } = montar()
    estudiarElDia(estudio)
    reloj.dia = '2026-10-06'
    const tanda = acertarTanda(estudio, abrir(estudio)!)
    const anuncio = '8 de repaso · unos 4 min · quedan 40 más para hoy'

    expect(pintarFinDeTanda(estudio, tanda)).toContain(`Queda otra tanda: ${anuncio}`)
    expect(pintar(Portada, { estudio, alEmpezar: () => {}, alExplorar: () => {} })).toContain(`Tanda de hoy ${anuncio}`)
  })

  it('cuenta entre los Sabidos el Elemento que solo falló la Clase', () => {
    const { estudio } = montar()
    const tanda = acertarTanda(estudio, fallar(estudio, abrir(estudio)!, ['clase']))

    const texto = pintarFinDeTanda(estudio, tanda)

    expect(texto).toContain('6 elementos sabidos')
    expect(texto).not.toContain('Vuelven mañana')
  })
})
