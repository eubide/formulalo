import { describe, expect, it } from 'vitest'
import { abrir, acertarTanda, fallar, montar } from '../estudio/ayudantes'
import type { Estudio, Tanda } from '../estudio/estudio'
import FinDeTanda from './FinDeTanda.svelte'
import { pintar } from './pintar'

function pintarFinDeTanda(estudio: Estudio, tanda: Tanda): string {
  return pintar(FinDeTanda, { tanda, estudio, alSeguir: () => {}, alVolver: () => {} })
}

describe('Fin de Tanda', () => {
  it('cuenta entre los Sabidos el Elemento que solo falló la Clase', () => {
    const { estudio } = montar()
    const tanda = acertarTanda(estudio, fallar(estudio, abrir(estudio)!, ['clase']))

    const texto = pintarFinDeTanda(estudio, tanda)

    expect(texto).toContain('6 elementos sabidos')
    expect(texto).not.toContain('Vuelven mañana')
  })
})
