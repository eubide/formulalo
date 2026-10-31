import { describe, expect, it } from 'vitest'
import { elementoDe } from '../catalogo/catalogo'
import { radicales } from '../catalogo/radicales'
import type { Dictada, DictadoEnCurso } from '../estudio/estudio'
import Dictado from './Dictado.svelte'
import { pintar } from './pintar'

const TECLADO = '+7 +5 +3 +1 +6 +4 +2 −1 −3 −5 −2 −4'
const GRUPO_16 = ['O', 'S', 'Se', 'Te', 'Po']

function pintarDictado(cambios: Partial<DictadoEnCurso>): string {
  const dictado: DictadoEnCurso = {
    tipo: 'dictado',
    presentacion: null,
    pregunta: null,
    pendientes: [],
    bloques: 2,
    respuesta: null,
    acertada: null,
    elementosFallados: [],
    radicalesFallados: [],
    anotadas: [],
    vueltas: [],
    pideSeguridad: false,
    comentario: null,
    sorpresasEn: [],
    sorpresa: null,
    respuestaDeSorpresa: null,
    ...cambios,
  }
  return pintar(Dictado, {
    dictado,
    alDescartarPresentacion: () => {},
    alResponder: () => {},
    alCerrarCorreccion: () => {},
    alOtro: () => {},
    alSalir: () => {},
  })
}

function deBloque(simbolos: string[], dadoPor: 'simbolo' | 'nombre' = 'simbolo'): Dictada {
  return { tipo: 'bloque', clave: simbolos.join(' '), elementos: simbolos.map(elementoDe), dadoPor, numero: 1 }
}

function radicalLlamado(nombre: string) {
  return radicales().find((radical) => radical.nombre === nombre)!
}

function deRadical(nombre: string, pide: 'escritura' | 'numero' = 'numero', dadoPor: 'formula' | 'nombre' = 'formula'): Dictada {
  return { tipo: 'radical', radical: radicalLlamado(nombre), dadoPor, pide }
}

describe('Presentación de un Dictado', () => {
  it('enseña lo nuevo con su Regla antes de preguntar', () => {
    const texto = pintarDictado({ presentacion: ['Li', 'Na'], pendientes: [deBloque(['Li', 'Na'])] })

    expect(texto).toMatch(/^Nuevos: Li, Na Salir /)
    expect(texto).toContain('Regla del grupo 1')
    expect(texto).toMatch(/ Empezar a preguntar$/)
  })
})

describe('Presentación de Radicales', () => {
  it('enseña los nuevos por Elemento central, con su cuenta y su número, antes de preguntar', () => {
    const texto = pintarDictado({ tipo: 'radicales', presentacion: ['clorito', 'clorato', 'bromato'], pendientes: [deRadical('clorito', 'escritura')] })

    expect(texto).toMatch(/^Nuevos radicales Salir /)
    expect(texto).toContain('Cada oxígeno lleva −2 y todo suma la carga del radical.')
    expect(texto).toContain('Del Cl ClO₂⁻ clorito: x + 2·(−2) = −1 → x = +3 ClO₃⁻ clorato: x + 3·(−2) = −1 → x = +5 Del Br BrO₃⁻ bromato:')
    expect(texto).toMatch(/ Empezar a preguntar$/)
  })

  it('señala en la Tabla los Elementos centrales', () => {
    const texto = pintarDictado({ tipo: 'radicales', presentacion: ['clorato'], pendientes: [deRadical('clorato', 'escritura')] })

    expect(texto).toContain('Cl Cloro')
  })
})

describe('Pregunta de un Dictado', () => {
  it('de un Bloque enseña sus Elementos y el teclado, y debajo la Tabla con ellos rotulados', () => {
    const texto = pintarDictado({ pregunta: deBloque(GRUPO_16), pendientes: [deRadical('clorato')] })

    expect(texto).toContain(`Bloque 1 de 2 Salir Quedan 2 Toca cada elemento y marca sus números de oxidación. O S Se Te Po ${TECLADO} Comprobar 1 2 3`)
    expect(texto).toContain('O Oxígeno')
    expect(texto).not.toContain('Capa de valencia')
  })

  it('de un Bloque dado por nombres pone los nombres en las filas', () => {
    expect(pintarDictado({ pregunta: deBloque(['O', 'S'], 'nombre') })).toContain('Oxígeno Azufre +7')
  })

  it('de un Radical dice que lo es, con su fórmula y su nombre, y pregunta el número de su Elemento central', () => {
    const texto = pintarDictado({ tipo: 'radicales', pregunta: deRadical('clorato') })

    expect(texto).toContain(`Radical ClO₃⁻ clorato Salir Quedan 1 ¿Qué número lleva el Cl? ${TECLADO} Comprobar 1 2 3`)
    expect(texto).toContain('Cl Cloro')
  })

  it('al escribir el nombre de un Radical, enseña la fórmula y no el nombre', () => {
    const texto = pintarDictado({ tipo: 'radicales', pregunta: deRadical('clorato', 'escritura', 'formula') })

    expect(texto).toContain('Radical ClO₃⁻ Salir Quedan 1 ¿Cómo se llama? Da igual mayúsculas o minúsculas. Comprobar')
    expect(texto).not.toContain('clorato')
  })

  it('al escribir la fórmula de un Radical, enseña el nombre y no la fórmula', () => {
    const texto = pintarDictado({ tipo: 'radicales', pregunta: deRadical('clorato', 'escritura', 'nombre') })

    expect(texto).toContain('Radical clorato Salir Quedan 1 ¿Cuál es su fórmula? Da igual mayúsculas o minúsculas. Los subíndices, como números normales. Comprobar')
    expect(texto).not.toContain('ClO₃')
  })

  it('tras un acierto enseña lo acertado', () => {
    expect(pintarDictado({ pregunta: deRadical('clorato'), acertada: deBloque(GRUPO_16) })).toContain('Quedan 1 ✓ O, S, Se, Te, Po ¿Qué')
    expect(pintarDictado({ pregunta: deBloque(GRUPO_16), acertada: deRadical('clorato') })).toContain('Quedan 1 ✓ ClO₃⁻ +5 Toca')
  })
})

describe('Modo en un Dictado', () => {
  it('de un Bloque pregunta si vas seguro en lugar de Comprobar', () => {
    const texto = pintarDictado({ pregunta: deBloque(GRUPO_16), pideSeguridad: true })

    expect(texto).toContain(`${TECLADO} Seguro Dudo 1 2 3`)
    expect(texto).not.toContain('Comprobar')
  })

  it('de un Radical pregunta si vas seguro, también al escribir', () => {
    expect(pintarDictado({ tipo: 'radicales', pregunta: deRadical('clorato'), pideSeguridad: true })).toContain(`${TECLADO} Seguro Dudo`)
    expect(pintarDictado({ tipo: 'radicales', pregunta: deRadical('clorato', 'escritura'), pideSeguridad: true })).toContain(
      'Da igual mayúsculas o minúsculas. Seguro Dudo',
    )
  })

  it('tras un acierto enseña el comentario junto a lo acertado', () => {
    const texto = pintarDictado({ pregunta: deRadical('clorato'), acertada: deBloque(GRUPO_16), comentario: 'Hoy vienes fino.' })

    expect(texto).toContain('Quedan 1 ✓ O, S, Se, Te, Po Hoy vienes fino. ¿Qué')
  })

  it('al terminar enseña el comentario del último acierto', () => {
    expect(pintarDictado({ comentario: 'Hoy vienes fino.' })).toBe('Dictado terminado ✓ Sin fallos. Hoy vienes fino. Otro dictado Portada')
  })

  it('en la Corrección enseña el comentario', () => {
    const comentario = 'Seguro, decías. Apuntado queda.'

    expect(pintarDictado({ pregunta: deBloque(['S']), respuesta: [[]], comentario })).toMatch(/^Seguro, decías\. Apuntado queda\. ✗ S /)
    expect(pintarDictado({ pregunta: deRadical('clorato'), respuesta: [[3]], comentario })).toContain('✗ Radical ClO₃⁻ · clorato Seguro, decías. Apuntado queda. Cada oxígeno')
  })
})

describe('Corrección de un Dictado', () => {
  it('de un Bloque marca cada fila, y de las falladas da la Regla y la excepción', () => {
    const texto = pintarDictado({
      pregunta: deBloque(GRUPO_16),
      respuesta: [[-2], [-2, 2, 4, 6], [-2, 2, 4], [-2, 2, 4, 6], [-2, 2, 4]],
    })

    expect(texto).toContain('✓ O −2 ✓ S −2 +2 +4 +6 ✗ Se faltaba +6 ✓ Te −2 +2 +4 +6 ✗ Po sobra −2 ')
    expect(texto).toContain('Regla del grupo 16: 6 electrones: le faltan 2. Los positivos, pares hasta 6. −2 +2 +4 +6')
    expect(texto).toContain('Po se aparta de la regla : solo +2 y +4.')
    expect(texto).toContain(' Seguir 1 2 3')
    expect(texto).toContain('Po Polonio')
  })

  it('de un Bloque no habla de la Regla de lo que está bien', () => {
    const texto = pintarDictado({ pregunta: deBloque(['S', 'Pt']), respuesta: [[-2, 2, 4, 6], [2]] })

    expect(texto).toContain('✓ S −2 +2 +4 +6 ✗ Pt faltaba +4 ')
    expect(texto).not.toContain('Regla del grupo')
    expect(texto).toContain('El paladio y el platino copian de lejos')
  })

  it('de un Radical enseña la cuenta y los números de los otros Radicales de su Elemento central', () => {
    const texto = pintarDictado({ pregunta: deRadical('clorato'), respuesta: [[3]] })

    expect(texto).toContain('✗ Radical ClO₃⁻ · clorato')
    expect(texto).toContain('x + 3·(−2) = −1 → x = +5')
    expect(texto).toContain('Del Cl: hipoclorito ClO⁻ +1 · clorito ClO₂⁻ +3 · clorato ClO₃⁻ +5 · perclorato ClO₄⁻ +7')
    expect(texto).toContain(' Seguir 1 2 3')
    expect(texto).toContain('Cl Cloro')
  })
})

describe('Corrección al escribir un Radical', () => {
  it('dice lo que se escribió', () => {
    const texto = pintarDictado({ tipo: 'radicales', pregunta: deRadical('clorato', 'escritura'), respuesta: 'clorito' })

    expect(texto).toContain('✗ Radical ClO₃⁻ · clorato Escribiste: clorito')
  })
})

describe('Fin de un ejercicio', () => {
  it('de Radicales dice su nombre y ofrece otro igual', () => {
    expect(pintarDictado({ tipo: 'radicales' })).toBe('Radicales terminados ✓ Sin fallos. Otros radicales Portada')
  })

  it('sin fallos lo dice y ofrece otro', () => {
    expect(pintarDictado({})).toBe('Dictado terminado ✓ Sin fallos. Otro dictado Portada')
  })

  it('con fallos los lista, y avisa de que los Elementos vuelven mañana', () => {
    const texto = pintarDictado({ elementosFallados: [elementoDe('Cl')], radicalesFallados: [radicalLlamado('clorato')] })

    expect(texto).toBe('Dictado terminado Fallados: Cl, ClO₃⁻ . Los Elementos fallados vuelven mañana. Otro dictado Portada')
  })

  it('si solo falló Radicales, no habla de los Elementos', () => {
    expect(pintarDictado({ radicalesFallados: [radicalLlamado('clorato')] })).toBe('Dictado terminado Fallados: ClO₃⁻ . Otro dictado Portada')
  })
})
