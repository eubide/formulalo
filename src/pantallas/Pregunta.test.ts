import { describe, expect, it, vi } from 'vitest'
import { almacenEnMemoria, crearEstudio, type Tanda } from '../estudio/estudio'
import { pintar } from './pintar'
import Pregunta from './Pregunta.svelte'

vi.stubGlobal('matchMedia', () => ({ matches: false }))

function enElUltimoPaso(): Tanda {
  const estudio = crearEstudio(almacenEnMemoria(), () => '2026-10-05', () => 0)
  const tanda = estudio.descartarPresentacion(estudio.abrirTanda()!)
  return { ...tanda, pregunta: { ...tanda.pregunta!, paso: 'numeros' } }
}

function pintada(tanda: Tanda, sabido: boolean): string {
  return pintar(Pregunta, {
    tanda,
    sabido,
    alResponder: () => {},
    alCerrarCorreccion: () => {},
    alCerrarAcierto: () => {},
    alSalir: () => {},
  })
}

describe('la señal de acierto', () => {
  const tanda = enElUltimoPaso()
  const { simbolo, nombre } = tanda.pregunta!.elemento
  const senal = `✓ ${simbolo} · ${nombre}`

  it('sale con el Símbolo y el nombre cuando la Cadena deja el Elemento Sabido', () => {
    expect(pintada(tanda, true)).toContain(senal)
  })

  it('da todos los pasos por acertados', () => {
    expect(pintada(tanda, true)).toContain('✓ Posición ✓ Clase ✓ Configuración ✓ Números de oxidación')
  })

  it('no enseña la pregunta de los Números de oxidación ni lo que la acompaña', () => {
    const texto = pintada(tanda, true)

    expect(texto).not.toContain('¿Qué números de oxidación tiene?')
    expect(texto).not.toContain('Comprobar')
    expect(texto).not.toContain('Ver sus cajas')
    expect(texto).not.toContain('Capa de valencia')
  })

  it('no sale mientras la Cadena sigue', () => {
    const texto = pintada(tanda, false)

    expect(texto).not.toContain(senal)
    expect(texto).toContain('¿Qué números de oxidación tiene?')
  })
})
