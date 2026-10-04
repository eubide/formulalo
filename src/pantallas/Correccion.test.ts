import { describe, expect, it } from 'vitest'
import { elementoDe } from '../catalogo/catalogo'
import { correccionDe, type Pregunta, type Respuesta } from '../estudio/cadena'
import Correccion from './Correccion.svelte'
import { pintar } from './pintar'

function corregida(simbolo: string, opciones: number[], respuesta: Respuesta): string {
  const pregunta: Pregunta = {
    elemento: elementoDe(simbolo),
    dadoPor: 'simbolo',
    paso: respuesta.paso,
    fallados: [respuesta.paso],
    opciones,
  }
  return pintar(Correccion, { pregunta, correccion: correccionDe(pregunta, respuesta), alSeguir: () => {} })
}

describe('Corrección de Clase', () => {
  it('dice la Clase del Elemento y la regla para deducirla de la Posición', () => {
    const texto = corregida('Cl', [], { paso: 'clase', clase: 'metal' })

    expect(texto).toContain('Es no metal .')
    expect(texto).toContain(
      'Los metaloides forman una escalera que baja del B al At. A su izquierda y por debajo, metales; a su derecha y por encima, no metales. El H es no metal.',
    )
  })
})

describe('Corrección de Números de oxidación', () => {
  it.each(['Sn', 'Pb', 'Bi'])('del %s dice que pierde el negativo por ser metal, y no que se aparta de la regla', (simbolo) => {
    const texto = corregida(simbolo, [-4, 2, 3, 4, 5], { paso: 'numeros', numeros: [2] })

    expect(texto).toContain('Es metal: sin el negativo.')
    expect(texto).not.toContain('se aparta de la regla')
  })

  it('de un metaloide sin negativo sigue diciendo que se aparta de la regla', () => {
    const texto = corregida('Ge', [-4, 2, 4], { paso: 'numeros', numeros: [2] })

    expect(texto).toContain('Ge se aparta de la regla : sin negativo.')
    expect(texto).not.toContain('Es metal')
  })
})
