import { describe, expect, it } from 'vitest'
import { elementos } from '../catalogo/catalogo'
import { abrir, acertarTanda, estudiarElDia, montar } from './ayudantes'
import { TECLADO, type Dictada, type DictadoEnCurso, type Estudio } from './estudio'

const CON_EXCEPCION = ['H', 'B', 'Tl', 'Si', 'Ge', 'N', 'O', 'Po', 'At', 'Xe']
const SIN_EL_NEGATIVO = ['Sn', 'Pb', 'Bi']
const DE_TRANSICION = ['Sc', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Pd', 'Ag', 'Cd', 'Pt', 'Au', 'Hg']
const DIFICILES = [...CON_EXCEPCION, ...SIN_EL_NEGATIVO, ...DE_TRANSICION]

function todasLasPreguntas(dictado: DictadoEnCurso): Dictada[] {
  return dictado.pregunta ? [dictado.pregunta, ...dictado.pendientes] : []
}

function deElementos(dictadas: Dictada[]) {
  return dictadas.flatMap((dictada) => (dictada.tipo === 'elemento' ? [dictada.elemento] : []))
}

function conTodoEstudiado(azar: () => number): Estudio {
  const { estudio } = montar(azar)
  estudiarElDia(estudio)
  return estudio
}

function acertar(estudio: Estudio, dictado: DictadoEnCurso): DictadoEnCurso {
  const pregunta = dictado.pregunta!
  return estudio.responderDictado(dictado, pregunta.elemento.numeros.filter((numero) => numero !== 0))
}

function fallar(estudio: Estudio, dictado: DictadoEnCurso): DictadoEnCurso {
  return estudio.cerrarCorreccionDeDictado(estudio.responderDictado(dictado, []))
}

describe('Cuándo hay Dictado', () => {
  it('sin ningún Elemento preguntado no hay Dictado', () => {
    const { estudio } = montar()

    expect(estudio.hayDictado()).toBe(false)
  })

  it('un Elemento solo presentado no entra', () => {
    const { estudio } = montar()
    estudio.descartarPresentacion(estudio.abrirTanda())

    expect(estudio.hayDictado()).toBe(false)
  })

  it('de los gases nobles solo entra el Xe, porque el 0 no se pregunta', () => {
    const { estudio } = montar()
    acertarTanda(estudio, abrir(estudio))

    expect(estudio.hayDictado()).toBe(true)
    expect(deElementos(todasLasPreguntas(estudio.abrirDictado())).map((elemento) => elemento.simbolo)).toEqual(['Xe'])
  })
})

describe('Teclado', () => {
  it('va de −4 a +7, sin el 0', () => {
    expect(TECLADO).toEqual([-4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7])
  })

  it('tiene todos los números que se preguntan', () => {
    for (const elemento of elementos()) {
      expect(TECLADO, elemento.simbolo).toEqual(expect.arrayContaining(elemento.numeros.filter((numero) => numero !== 0)))
    }
  })
})

describe('Qué lleva un Dictado', () => {
  it.each([0, 0.3, 0.6, 0.9])('con el azar en %s lleva 15 preguntas, sin repetir ninguna', (valor) => {
    const dictadas = todasLasPreguntas(conTodoEstudiado(() => valor).abrirDictado())

    expect(dictadas).toHaveLength(15)
    expect(new Set(dictadas).size).toBe(15)
  })

  it.each([0, 0.3, 0.6, 0.9])('con el azar en %s, al menos la mitad de los Elementos son de los difíciles, sin ser todos', (valor) => {
    const simbolos = deElementos(todasLasPreguntas(conTodoEstudiado(() => valor).abrirDictado())).map(
      (elemento) => elemento.simbolo,
    )
    const dificiles = simbolos.filter((simbolo) => DIFICILES.includes(simbolo))

    expect(dificiles.length).toBeGreaterThanOrEqual(simbolos.length / 2)
    expect(dificiles.length).toBeLessThan(simbolos.length)
  })

  it.each([0, 0.3, 0.6, 0.9])('con el azar en %s, cada excepción va seguida de un Elemento regular de su Grupo', (valor) => {
    const dictadas = todasLasPreguntas(conTodoEstudiado(() => valor).abrirDictado())
    const conVecinoSeguro = CON_EXCEPCION.filter((simbolo) => !['Si', 'Ge', 'Xe'].includes(simbolo))

    for (const [indice, dictada] of dictadas.entries()) {
      if (dictada.tipo !== 'elemento' || !conVecinoSeguro.includes(dictada.elemento.simbolo)) continue
      const [siguiente] = deElementos(dictadas.slice(indice + 1, indice + 2))
      expect(siguiente?.grupo, dictada.elemento.simbolo).toBe(dictada.elemento.grupo)
      expect(DIFICILES, dictada.elemento.simbolo).not.toContain(siguiente?.simbolo)
    }
  })

  it('da el Elemento por su Símbolo o por su nombre', () => {
    const conAzar = (valor: number) => todasLasPreguntas(conTodoEstudiado(() => valor).abrirDictado())

    expect(new Set(conAzar(0).map((dictada) => dictada.dadoPor))).toEqual(new Set(['simbolo']))
    expect(new Set(conAzar(0.9).map((dictada) => dictada.dadoPor))).toEqual(new Set(['nombre']))
  })
})

describe('Responder un Elemento', () => {
  it('solo acierta el conjunto exacto, en cualquier orden', () => {
    const { estudio } = montar()
    acertarTanda(estudio, abrir(estudio))
    const dictado = estudio.abrirDictado()

    expect(estudio.responderDictado(dictado, [2, 4]).respuesta).toEqual([2, 4])
    expect(estudio.responderDictado(dictado, [6, 2, 4]).respuesta).toBeNull()
    expect(estudio.responderDictado(dictado, [6, 2, 4]).pregunta).toBeNull()
  })

  it('acertar no cambia el Dominio, ni siquiera el de un Flojo', () => {
    const estudio = conTodoEstudiado(() => 0)
    let dictado = fallar(estudio, estudio.abrirDictado())
    const antes = estudio.entradas()

    while (dictado.pregunta) dictado = acertar(estudio, dictado)

    expect(estudio.entradas()).toEqual(antes)
  })

  it('al acertar deja a la vista la pregunta acertada', () => {
    const estudio = conTodoEstudiado(() => 0)
    const dictado = estudio.abrirDictado()

    expect(acertar(estudio, dictado).acertada).toBe(dictado.pregunta)
  })

  it('fallar deja el Elemento Flojo y de vuelta mañana, con el fallo en los Números de oxidación', () => {
    const estudio = conTodoEstudiado(() => 0)
    const dictado = estudio.abrirDictado()
    const { simbolo } = deElementos([dictado.pregunta!])[0]

    estudio.responderDictado(dictado, [])

    expect(estudio.entradas()[simbolo]).toEqual({
      estado: 'flojo',
      intervalo: 0,
      vuelve: '2026-10-06',
      fallos: 1,
      pasosFallados: ['numeros'],
    })
  })

  it('mientras la Corrección está abierta no se responde otra cosa', () => {
    const estudio = conTodoEstudiado(() => 0)
    const conCorreccion = estudio.responderDictado(estudio.abrirDictado(), [])

    expect(estudio.responderDictado(conCorreccion, [1])).toBe(conCorreccion)
  })

  it('lo fallado vuelve tres preguntas después y queda entre las falladas', () => {
    const estudio = conTodoEstudiado(() => 0)
    const dictado = estudio.abrirDictado()
    const fallada = dictado.pregunta!

    const siguiente = fallar(estudio, dictado)

    expect(siguiente.pregunta).toBe(dictado.pendientes[0])
    expect(siguiente.pendientes.indexOf(fallada)).toBe(2)
    expect(siguiente.falladas).toEqual([fallada])
  })

  it('fallarlo otra vez no lo trae una tercera vez ni anota otro fallo', () => {
    const estudio = conTodoEstudiado(() => 0)
    let dictado = estudio.abrirDictado()
    const fallada = dictado.pregunta!
    const { simbolo } = deElementos([fallada])[0]
    dictado = fallar(estudio, dictado)
    while (dictado.pregunta !== fallada) dictado = acertar(estudio, dictado)

    dictado = fallar(estudio, dictado)

    expect(todasLasPreguntas(dictado)).not.toContain(fallada)
    expect(dictado.falladas).toEqual([fallada])
    expect(estudio.entradas()[simbolo].fallos).toBe(1)
  })
})
