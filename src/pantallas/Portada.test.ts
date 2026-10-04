import { describe, expect, it } from 'vitest'
import { almacenEnMemoria, crearEstudio } from '../estudio/estudio'
import { pintar } from './pintar'
import Portada from './Portada.svelte'

const BIENVENIDA =
  'Aprende dónde está cada elemento en la tabla y deduce de ahí su configuración y sus números de oxidación. Cada tanda dura unos minutos: primero te presenta un grupo y después te pregunta.'
const DESDE_EL_GAS_NOBLE = 'Grupos 18, 1, 2, 17, 16, 15, 14 y 13, y después los metales de transición.'
const POR_USO = 'Primero el H y el O; después los grupos 1, 2, 17, 16, 15, 14 y 13, los metales de transición y el 18.'

function montar() {
  const estudio = crearEstudio(almacenEnMemoria(), () => '2026-10-05', () => 0)
  return { estudio, portada: () => pintar(Portada, { estudio, alEmpezar: () => {}, alExplorar: () => {} }) }
}

describe('Portada', () => {
  it('con el Dominio vacío da la bienvenida bajo el lema', () => {
    const { portada } = montar()

    expect(portada()).toContain(`No lo memorices: dedúcelo. ${BIENVENIDA}`)
  })

  it('con un Elemento visto ya no da la bienvenida', () => {
    const { estudio, portada } = montar()
    estudio.descartarPresentacion(estudio.abrirTanda()!)

    const texto = portada()

    expect(texto).toContain('No lo memorices: dedúcelo.')
    expect(texto).not.toContain('Aprende dónde está')
  })

  it('bajo el selector dice el orden del Camino elegido', () => {
    const { estudio, portada } = montar()

    expect(portada()).toContain(`Camino Desde el gas noble Por uso al formular ${DESDE_EL_GAS_NOBLE}`)
    expect(portada()).not.toContain(POR_USO)

    estudio.elegirCamino('uso')

    expect(portada()).toContain(`Camino Desde el gas noble Por uso al formular ${POR_USO}`)
    expect(portada()).not.toContain(DESDE_EL_GAS_NOBLE)
  })

  it('junto al Camino ofrece guardar y recuperar una copia, sin pedir ni avisar nada hasta que se elige un archivo', () => {
    const { portada } = montar()

    expect(portada().endsWith(`${DESDE_EL_GAS_NOBLE} Guardar copia Recuperar copia`)).toBe(true)
  })
})
