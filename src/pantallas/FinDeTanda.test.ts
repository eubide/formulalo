import { describe, expect, it } from 'vitest'
import { abrir, acertarCadena, acertarTanda, estudiarElDia, fallar, montar } from '../estudio/ayudantes'
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

  it('enseña la tabla y dice cuándo vuelve cada Elemento de la Tanda, del día más cercano al más lejano', () => {
    const { estudio, reloj } = montar()
    acertarTanda(estudio, abrir(estudio)!)
    reloj.dia = '2026-10-06'
    let tanda = abrir(estudio)!
    while (tanda.pregunta!.elemento.simbolo !== 'Li') tanda = acertarCadena(estudio, tanda)
    tanda = acertarTanda(estudio, fallar(estudio, tanda, ['posicion']))

    const texto = pintarFinDeTanda(estudio, tanda)

    expect(texto).toMatch(/7 elementos sabidos Mañana: (\w+, ){6}\w+ · En 3 días: He 1 2 3 /)
    expect(texto).toContain('Li Litio')
  })

  it('cuando su día ya ha llegado, los Elementos de la Tanda salen juntos bajo «Hoy»', () => {
    const { estudio, reloj } = montar()
    acertarTanda(estudio, abrir(estudio)!)
    reloj.dia = '2026-10-06'
    let tanda = abrir(estudio)!
    while (tanda.pregunta!.elemento.simbolo !== 'Li') tanda = acertarCadena(estudio, tanda)
    tanda = acertarTanda(estudio, fallar(estudio, tanda, ['posicion']))
    reloj.dia = '2026-10-09'

    expect(pintarFinDeTanda(estudio, tanda)).toMatch(/7 elementos sabidos Hoy: (\w+, ){7}\w+ 1 2 3 /)
  })

  it('cuenta entre los Sabidos el Elemento que solo falló la Clase', () => {
    const { estudio } = montar()
    const tanda = acertarTanda(estudio, fallar(estudio, abrir(estudio)!, ['clase']))

    expect(pintarFinDeTanda(estudio, tanda)).toContain('6 elementos sabidos')
  })
})
