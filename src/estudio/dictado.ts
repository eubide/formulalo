import { elementos, esDeTransicion, type Elemento } from '../catalogo/catalogo'
import { numeroDeRadical, radicales, type Radical } from '../catalogo/radicales'
import { excepcionDe, pierdeElNegativo } from '../catalogo/reglas'
import { barajar, correccionDe, mismosNumeros, RANGO, type Azar, type Correccion, type Pregunta } from './cadena'
import { sinPreguntar, type Dominio } from './dominio'

export type Dictada =
  | { tipo: 'elemento'; elemento: Elemento; dadoPor: 'simbolo' | 'nombre' }
  | { tipo: 'radical'; radical: Radical; dadoPor: 'formula' | 'nombre' }

export interface DictadoEnCurso {
  pregunta: Dictada | null
  pendientes: Dictada[]
  respuesta: number[] | null
  acertada: Dictada | null
  falladas: Dictada[]
}

export const TECLADO = RANGO.filter((numero) => numero !== 0)

const PREGUNTAS_POR_DICTADO = 15
const RADICALES_POR_DICTADO = 5
const PREGUNTAS_HASTA_LA_REINSERCION = 3

function esDificil(elemento: Elemento): boolean {
  return esDeTransicion(elemento) || excepcionDe(elemento) !== null || pierdeElNegativo(elemento)
}

function sePregunta(elemento: Elemento): boolean {
  return elemento.numeros.some((numero) => numero !== 0)
}

// Una excepción se aprende contra la Regla que rompe: por eso lleva detrás un Elemento regular de su Grupo.
function enBloques(candidatos: Elemento[], cuantos: number, azar: Azar): Elemento[][] {
  const dificiles = barajar(candidatos.filter(esDificil), azar)
  const regulares = barajar(
    candidatos.filter((candidato) => !esDificil(candidato)),
    azar,
  )
  const tope = Math.ceil((cuantos * 2) / 3)
  const conSuVecino = dificiles.slice(0, tope).map((dificil) => {
    if (excepcionDe(dificil) === null) return [dificil]
    const indice = regulares.findIndex((regular) => regular.grupo === dificil.grupo)
    return indice < 0 ? [dificil] : [dificil, ...regulares.splice(indice, 1)]
  })
  return [...conSuVecino, ...regulares.map((regular) => [regular]), ...dificiles.slice(tope).map((dificil) => [dificil])]
}

function hastaCaber<T>(bloques: T[][], cuantos: number): T[][] {
  const dentro: T[][] = []
  let llenos = 0
  for (const bloque of bloques) {
    if (llenos + bloque.length > cuantos) continue
    dentro.push(bloque)
    llenos += bloque.length
  }
  return dentro
}

function componer(preguntados: Elemento[], azar: Azar): Dictada[] {
  const candidatos = preguntados.filter(sePregunta)
  const conSuCentral = barajar(
    radicales().filter((radical) => candidatos.some((candidato) => candidato.simbolo === radical.central)),
    azar,
  )
  const sitios = PREGUNTAS_POR_DICTADO - Math.min(RADICALES_POR_DICTADO, conSuCentral.length)
  const deElementos = hastaCaber(enBloques(candidatos, sitios, azar), sitios).map((bloque) =>
    bloque.map((elemento): Dictada => ({ tipo: 'elemento', elemento, dadoPor: azar() < 0.5 ? 'simbolo' : 'nombre' })),
  )
  const deRadicales = conSuCentral
    .slice(0, PREGUNTAS_POR_DICTADO - deElementos.flat().length)
    .map((radical): Dictada[] => [{ tipo: 'radical', radical, dadoPor: azar() < 0.5 ? 'formula' : 'nombre' }])
  return barajar([...deElementos, ...deRadicales], azar).flat()
}

export function correctosDe(dictada: Dictada): number[] {
  return dictada.tipo === 'elemento'
    ? dictada.elemento.numeros.filter((numero) => numero !== 0)
    : [numeroDeRadical(dictada.radical)]
}

export function correccionDeElemento(elemento: Elemento, respuesta: number[]): { pregunta: Pregunta; correccion: Correccion } {
  const numeros = elemento.numeros.includes(0) ? [0, ...respuesta] : respuesta
  const opciones = [...new Set([...elemento.numeros, ...numeros])].sort((a, b) => a - b)
  const pregunta: Pregunta = { elemento, dadoPor: 'simbolo', paso: 'numeros', fallados: ['numeros'], opciones }
  return { pregunta, correccion: correccionDe(pregunta, { paso: 'numeros', numeros }) }
}

export function crearDictados(dominio: Dominio, azar: Azar) {
  function preguntados(): Elemento[] {
    const entradas = dominio.entradas()
    return elementos().filter(({ simbolo }) => entradas[simbolo] && !sinPreguntar(entradas[simbolo]))
  }

  function preguntarLaSiguiente(dictado: DictadoEnCurso): DictadoEnCurso {
    const [pregunta = null, ...pendientes] = dictado.pendientes
    return { ...dictado, pregunta, pendientes }
  }

  return {
    hayDictado(): boolean {
      return preguntados().some(sePregunta)
    },

    abrirDictado(): DictadoEnCurso {
      return preguntarLaSiguiente({
        pregunta: null,
        pendientes: componer(preguntados(), azar),
        respuesta: null,
        acertada: null,
        falladas: [],
      })
    },

    responderDictado(dictado: DictadoEnCurso, numeros: number[]): DictadoEnCurso {
      const { pregunta } = dictado
      if (!pregunta || dictado.respuesta) return dictado
      if (mismosNumeros(correctosDe(pregunta), numeros)) return preguntarLaSiguiente({ ...dictado, acertada: pregunta })
      if (pregunta.tipo === 'elemento' && !dictado.falladas.includes(pregunta)) {
        dominio.anotar(pregunta.elemento.simbolo, ['numeros'])
      }
      return { ...dictado, respuesta: numeros, acertada: null }
    },

    cerrarCorreccionDeDictado(dictado: DictadoEnCurso): DictadoEnCurso {
      const pregunta = dictado.pregunta!
      if (!dictado.respuesta) return dictado
      if (dictado.falladas.includes(pregunta)) return preguntarLaSiguiente({ ...dictado, respuesta: null })
      const pendientes = [...dictado.pendientes]
      pendientes.splice(PREGUNTAS_HASTA_LA_REINSERCION, 0, pregunta)
      return preguntarLaSiguiente({ ...dictado, respuesta: null, pendientes, falladas: [...dictado.falladas, pregunta] })
    },
  }
}
