import { describe, expect, it } from 'vitest'
import { abrir, estudiarElDia, fallar, montar } from '../estudio/ayudantes'
import type { Estudio } from '../estudio/estudio'
import { pintar } from './pintar'
import Portada from './Portada.svelte'

const BIENVENIDA =
  'Aprende dónde está cada elemento en la tabla y deduce de ahí su configuración y sus números de oxidación. Cada tanda dura unos minutos: primero te presenta un grupo y después te pregunta.'
const DESDE_EL_GAS_NOBLE = 'Grupos 18, 1, 2, 17, 16, 15, 14 y 13, y después los metales de transición.'
const POR_USO = 'Primero el H y el O; después los grupos 1, 2, 17, 16, 15, 14 y 13, los metales de transición y el 18.'

function pintarPortada(estudio: Estudio): string {
  return pintar(Portada, { estudio, alEmpezar: () => {}, alExplorar: () => {} })
}

describe('Portada', () => {
  it('con el Dominio vacío da la bienvenida bajo el lema', () => {
    const { estudio } = montar()

    expect(pintarPortada(estudio)).toContain(`No lo memorices: dedúcelo. ${BIENVENIDA}`)
  })

  it('con un Elemento visto ya no da la bienvenida', () => {
    const { estudio } = montar()
    estudio.descartarPresentacion(estudio.abrirTanda()!)

    const texto = pintarPortada(estudio)

    expect(texto).toContain('No lo memorices: dedúcelo.')
    expect(texto).not.toContain('Aprende dónde está')
  })

  it('bajo el selector dice el orden del Camino elegido', () => {
    const { estudio } = montar()

    expect(pintarPortada(estudio)).toContain(`Camino Desde el gas noble Por uso al formular ${DESDE_EL_GAS_NOBLE}`)
    expect(pintarPortada(estudio)).not.toContain(POR_USO)

    estudio.elegirCamino('uso')

    expect(pintarPortada(estudio)).toContain(`Camino Desde el gas noble Por uso al formular ${POR_USO}`)
    expect(pintarPortada(estudio)).not.toContain(DESDE_EL_GAS_NOBLE)
  })

  it('junto al Camino ofrece guardar y recuperar una copia, sin pedir ni avisar nada hasta que se elige un archivo', () => {
    const { estudio } = montar()

    expect(pintarPortada(estudio).endsWith(`${DESDE_EL_GAS_NOBLE} Guardar copia Recuperar copia`)).toBe(true)
  })

  it('con 56 Elementos por repasar dice cuántos quedan para hoy después de la Tanda', () => {
    const { estudio, reloj } = montar()
    estudiarElDia(estudio)
    reloj.dia = '2026-10-06'

    const texto = pintarPortada(estudio)

    expect(texto).toContain('Tanda de hoy 8 de repaso · unos 4 min · quedan 48 más para hoy')
  })

  it('no escribe las partes del anuncio que valen cero, y con un minuto dice «1 min»', () => {
    const { estudio } = montar()
    estudio.elegirCamino('uso')

    const texto = pintarPortada(estudio)

    expect(texto).toContain('Tanda de hoy 2 nuevos · 1 min')
    expect(texto).not.toContain('quedan')
  })

  it('lista el paso fallado en «Dónde se rompe la cadena» aunque el Elemento esté Sabido', () => {
    const { estudio } = montar()
    const tanda = abrir(estudio)!
    const { simbolo, nombre } = tanda.pregunta!.elemento
    fallar(estudio, tanda, ['clase'])

    const texto = pintarPortada(estudio)

    expect(texto).toContain('1 sabidos')
    expect(texto).toContain(`Dónde se rompe la cadena ${simbolo} ${nombre}: Clase`)
  })
})
