import { describe, expect, it } from 'vitest'
import { elementoDe } from '../catalogo/catalogo'
import { radicales } from '../catalogo/radicales'
import type { Dictada, DictadoEnCurso } from '../estudio/estudio'
import Dictado from './Dictado.svelte'
import { pintar } from './pintar'

const TECLADO = '−4 −3 −2 −1 +1 +2 +3 +4 +5 +6 +7'

function pintarDictado(cambios: Partial<DictadoEnCurso>): string {
  const dictado: DictadoEnCurso = { pregunta: null, pendientes: [], respuesta: null, acertada: null, falladas: [], ...cambios }
  return pintar(Dictado, {
    dictado,
    alResponder: () => {},
    alCerrarCorreccion: () => {},
    alOtro: () => {},
    alSalir: () => {},
  })
}

function deElemento(simbolo: string, dadoPor: 'simbolo' | 'nombre' = 'simbolo'): Dictada {
  return { tipo: 'elemento', elemento: elementoDe(simbolo), dadoPor }
}

function deRadical(nombre: string, dadoPor: 'formula' | 'nombre' = 'formula'): Dictada {
  return { tipo: 'radical', radical: radicales().find((radical) => radical.nombre === nombre)!, dadoPor }
}

describe('Pregunta de un Dictado', () => {
  it('de un Elemento enseña solo cómo se da y el teclado, sin ayudas', () => {
    const texto = pintarDictado({ pregunta: deElemento('Cl'), pendientes: [deElemento('Na')] })

    expect(texto).toBe(`Cl Salir Quedan 2 ¿Qué números de oxidación tiene? ${TECLADO} Comprobar`)
  })

  it('de un Elemento dado por su nombre no enseña el Símbolo', () => {
    expect(pintarDictado({ pregunta: deElemento('Cl', 'nombre') })).toMatch(/^Cloro Salir Quedan 1 /)
  })

  it('de un Radical pregunta el número de su Elemento central', () => {
    const texto = pintarDictado({ pregunta: deRadical('clorato') })

    expect(texto).toBe(`ClO₃⁻ Salir Quedan 1 ¿Qué número lleva el Cl? ${TECLADO} Comprobar`)
  })

  it('de un Radical dado por su nombre no enseña la fórmula', () => {
    const texto = pintarDictado({ pregunta: deRadical('dicromato', 'nombre') })

    expect(texto).toMatch(/^dicromato Salir Quedan 1 ¿Qué número lleva el Cr\? /)
    expect(texto).not.toContain('Cr₂O₇')
  })

  it('tras un acierto enseña lo acertado con sus números', () => {
    expect(pintarDictado({ pregunta: deElemento('Na'), acertada: deElemento('Cl', 'nombre') })).toContain(
      'Quedan 1 ✓ Cl −1 +1 +3 +5 +7 ¿Qué',
    )
    expect(pintarDictado({ pregunta: deElemento('Na'), acertada: deRadical('clorato', 'nombre') })).toContain(
      'Quedan 1 ✓ ClO₃⁻ +5 ¿Qué',
    )
  })
})

describe('Corrección de un Dictado', () => {
  it('de un Elemento marca lo elegido y lo correcto, con su Regla', () => {
    const texto = pintarDictado({ pregunta: deElemento('Cl'), respuesta: [-1, 1, 2] })

    expect(texto).toContain('✗ Cl · Cloro')
    expect(texto).toContain('−1 ✓ +1 ✓ +2 ✗ sobra +3 faltaba +5 faltaba +7 faltaba Regla del grupo 17')
    expect(texto).not.toContain('−4')
  })

  it('del Xe no da por fallado el 0, que no se pregunta', () => {
    const texto = pintarDictado({ pregunta: deElemento('Xe'), respuesta: [2, 4] })

    expect(texto).toContain('0 ✓ +2 ✓ +4 ✓ +6 faltaba')
  })

  it('de un Radical enseña la cuenta y los números de los otros Radicales de su Elemento central', () => {
    const texto = pintarDictado({ pregunta: deRadical('clorato', 'nombre'), respuesta: [3] })

    expect(texto).toContain('✗ ClO₃⁻ · clorato')
    expect(texto).toContain('Cada oxígeno lleva −2 y todo suma la carga del radical.')
    expect(texto).toContain('x + 3·(−2) = −1 → x = +5')
    expect(texto).toContain('Del Cl: hipoclorito +1 · clorito +3 · clorato +5 · perclorato +7')
    expect(texto).toMatch(/ Seguir$/)
  })
})

describe('Fin de un Dictado', () => {
  it('sin fallos lo dice y ofrece otro', () => {
    expect(pintarDictado({})).toBe('Dictado terminado ✓ Sin fallos. Otro dictado Portada')
  })

  it('con fallos los lista, y avisa de que los Elementos vuelven mañana', () => {
    const texto = pintarDictado({ falladas: [deElemento('Cl', 'nombre'), deRadical('clorato', 'nombre')] })

    expect(texto).toBe('Dictado terminado Fallados: Cl, ClO₃⁻ . Los Elementos fallados vuelven mañana. Otro dictado Portada')
  })

  it('si solo falló Radicales, no habla de los Elementos', () => {
    expect(pintarDictado({ falladas: [deRadical('clorato')] })).toBe('Dictado terminado Fallados: ClO₃⁻ . Otro dictado Portada')
  })
})
