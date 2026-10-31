import { describe, expect, it } from 'vitest'
import { abrir, acertarCadena, acertarOleada, estudiarElDia, fallar, montar } from '../estudio/ayudantes'
import type { Estudio, Oleada } from '../estudio/estudio'
import FinDeOleada from './FinDeOleada.svelte'
import { pintar } from './pintar'
import Portada from './Portada.svelte'

function pintarFinDeOleada(estudio: Estudio, oleada: Oleada): string {
  return pintar(FinDeOleada, { oleada, estudio, alSeguir: () => {}, alVolver: () => {} })
}

describe('Fin de Oleada', () => {
  it('anuncia la Oleada siguiente con las mismas palabras que la Portada', () => {
    const { estudio, reloj } = montar()
    estudiarElDia(estudio)
    reloj.dia = '2026-10-06'
    const oleada = acertarOleada(estudio, abrir(estudio))
    const anuncio = '8 de repaso · unos 4 min'

    expect(pintarFinDeOleada(estudio, oleada)).toContain(`Siguiente: ${anuncio} 50 por repasar hoy Otra oleada Portada`)
    expect(pintar(Portada, { estudio, alEmpezar: () => {}, alExplorar: () => {}, alDictado: () => {}, alRadicales: () => {} })).toContain(`Nueva oleada ${anuncio}`)
  })

  it('enseña la tabla y dice cuándo vuelve cada Elemento de la Oleada, del día más cercano al más lejano', () => {
    const { estudio, reloj } = montar()
    acertarOleada(estudio, abrir(estudio))
    reloj.dia = '2026-10-06'
    let oleada = abrir(estudio)
    while (oleada.pregunta!.elemento.simbolo !== 'Li') oleada = acertarCadena(estudio, oleada)
    oleada = acertarOleada(estudio, fallar(estudio, oleada, ['posicion']))

    const texto = pintarFinDeOleada(estudio, oleada)

    expect(texto).toMatch(/9 elementos sabidos Mañana: (\w+, ){6}\w+ · En 3 días: (\w+, ){2}\w+ 1 2 3 /)
    expect(texto).toContain('Li Litio')
  })

  it('cuando su día ya ha llegado, los Elementos de la Oleada salen juntos bajo «Hoy»', () => {
    const { estudio, reloj } = montar()
    acertarOleada(estudio, abrir(estudio))
    reloj.dia = '2026-10-06'
    let oleada = abrir(estudio)
    while (oleada.pregunta!.elemento.simbolo !== 'Li') oleada = acertarCadena(estudio, oleada)
    oleada = acertarOleada(estudio, fallar(estudio, oleada, ['posicion']))
    reloj.dia = '2026-10-09'

    expect(pintarFinDeOleada(estudio, oleada)).toMatch(/9 elementos sabidos Hoy: (\w+, ){9}\w+ 1 2 3 /)
  })

  it('sin nada que toque dice cuándo vuelve lo siguiente y ofrece una Oleada de práctica', () => {
    const { estudio } = montar()
    estudiarElDia(estudio)
    const oleada = acertarOleada(estudio, abrir(estudio))

    expect(pintarFinDeOleada(estudio, oleada)).toContain(
      'Siguiente: 8 de práctica · unos 4 min Nada por repasar hasta el martes, 6 de octubre: esto es práctica y no adelanta los repasos. Otra oleada Portada',
    )
  })

  it('cuenta entre los Sabidos el Elemento que solo falló la Clase', () => {
    const { estudio } = montar()
    const oleada = acertarOleada(estudio, fallar(estudio, abrir(estudio), ['clase']))

    expect(pintarFinDeOleada(estudio, oleada)).toContain('6 elementos sabidos')
  })
})
