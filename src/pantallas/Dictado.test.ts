import { describe, expect, it } from 'vitest'
import { elementoDe } from '../catalogo/catalogo'
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

describe('Pregunta de un Dictado', () => {
  it('de un Elemento enseña solo cómo se da y el teclado, sin ayudas', () => {
    const texto = pintarDictado({ pregunta: deElemento('Cl'), pendientes: [deElemento('Na')] })

    expect(texto).toBe(`Cl Salir Quedan 2 ¿Qué números de oxidación tiene? ${TECLADO} Comprobar`)
  })

  it('de un Elemento dado por su nombre no enseña el Símbolo', () => {
    expect(pintarDictado({ pregunta: deElemento('Cl', 'nombre') })).toMatch(/^Cloro Salir Quedan 1 /)
  })

  it('tras un acierto enseña lo acertado con sus números', () => {
    expect(pintarDictado({ pregunta: deElemento('Na'), acertada: deElemento('Cl', 'nombre') })).toContain(
      'Quedan 1 ✓ Cl −1 +1 +3 +5 +7 ¿Qué',
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

})

describe('Fin de un Dictado', () => {
  it('sin fallos lo dice y ofrece otro', () => {
    expect(pintarDictado({})).toBe('Dictado terminado ✓ Sin fallos. Otro dictado Portada')
  })

  it('con fallos los lista, y avisa de que los Elementos vuelven mañana', () => {
    const texto = pintarDictado({ falladas: [deElemento('Cl', 'nombre'), deElemento('Na')] })

    expect(texto).toBe('Dictado terminado Fallados: Cl, Na . Los Elementos fallados vuelven mañana. Otro dictado Portada')
  })
})
