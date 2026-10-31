import { describe, expect, it, vi } from 'vitest'
import { almacenEnMemoria, crearEstudio, type Oleada } from '../estudio/estudio'
import { pintar } from './pintar'
import Pregunta from './Pregunta.svelte'

vi.stubGlobal('matchMedia', () => ({ matches: false }))

function enElUltimoPaso(): Oleada {
  const estudio = crearEstudio(almacenEnMemoria(), () => '2026-10-05', () => 0, () => '2026-10-05T10:00:00')
  const oleada = estudio.descartarPresentacion(estudio.abrirOleada())
  return { ...oleada, pregunta: { ...oleada.pregunta!, paso: 'numeros' } }
}

function pintada(oleada: Oleada, sabido: boolean): string {
  return pintar(Pregunta, {
    oleada,
    sabido,
    alResponder: () => {},
    alSaltarConfiguracion: () => {},
    alCerrarCorreccion: () => {},
    alCerrarAcierto: () => {},
    alSalir: () => {},
  })
}

describe('el paso de Configuración', () => {
  const oleada = enElUltimoPaso()
  const enLaConfiguracion: Oleada = { ...oleada, pregunta: { ...oleada.pregunta!, paso: 'configuracion' } }

  it('ofrece saltarlo', () => {
    expect(pintada(enLaConfiguracion, false)).toContain('Saltar')
  })

  it('saltado no lleva ✓ ni ✗, tampoco en la señal de acierto', () => {
    const saltada: Oleada = { ...oleada, pregunta: { ...oleada.pregunta!, saltados: ['configuracion'] } }

    expect(pintada(saltada, false)).toContain('✓ Posición ✓ Clase – Configuración · Números de oxidación')
    expect(pintada(saltada, true)).toContain('✓ Posición ✓ Clase – Configuración ✓ Números de oxidación')
  })

  it('no se ofrece saltar otro paso', () => {
    expect(pintada(oleada, false)).not.toContain('Saltar')
  })
})

describe('la señal de acierto', () => {
  const oleada = enElUltimoPaso()
  const { simbolo, nombre } = oleada.pregunta!.elemento
  const senal = `✓ ${simbolo} · ${nombre}`

  it('sale con el Símbolo y el nombre cuando la Cadena deja el Elemento Sabido', () => {
    expect(pintada(oleada, true)).toContain(senal)
  })

  it('da todos los pasos por acertados', () => {
    expect(pintada(oleada, true)).toContain('✓ Posición ✓ Clase ✓ Configuración ✓ Números de oxidación')
  })

  it('no enseña la pregunta de los Números de oxidación ni lo que la acompaña', () => {
    const texto = pintada(oleada, true)

    expect(texto).not.toContain('¿Qué números de oxidación tiene?')
    expect(texto).not.toContain('Comprobar')
    expect(texto).not.toContain('Ver sus cajas')
    expect(texto).not.toContain('Capa de valencia')
  })

  it('lleva el comentario del Modo si lo hay', () => {
    expect(pintar(Pregunta, {
      oleada,
      sabido: true,
      comentario: 'Hoy vienes fino.',
      alResponder: () => {},
      alSaltarConfiguracion: () => {},
      alCerrarCorreccion: () => {},
      alCerrarAcierto: () => {},
      alSalir: () => {},
    })).toContain('Hoy vienes fino.')
  })

  it('no sale mientras la Cadena sigue', () => {
    const texto = pintada(oleada, false)

    expect(texto).not.toContain(senal)
    expect(texto).toContain('¿Qué números de oxidación tiene?')
  })
})
