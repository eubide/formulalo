import { bloques } from '../catalogo/bloques'
import { trozosDe, type Camino } from '../catalogo/caminos'
import { elementos, type Elemento } from '../catalogo/catalogo'
import { ajustesDe, comentarioAlAcertar } from '../catalogo/modos'
import { esSuFormula, esSuNombre, numeroDeRadical, radicales, type Radical } from '../catalogo/radicales'
import { barajar, correccionDe, mismosNumeros, RANGO, type Azar, type Correccion, type Pregunta } from './cadena'
import { sinPreguntar, type DelDictado, type Dominio } from './dominio'
import { parteDeRepaso } from './serie'

export type Dictada =
  | { tipo: 'bloque'; clave: string; elementos: Elemento[]; dadoPor: 'simbolo' | 'nombre'; numero: number }
  | { tipo: 'radical'; radical: Radical; dadoPor: 'formula' | 'nombre'; pide: 'escritura' | 'numero' }

export type RespuestaDictada = number[][] | string

export interface DictadoEnCurso {
  tipo: 'dictado' | 'radicales'
  presentacion: string[] | null
  pregunta: Dictada | null
  pendientes: Dictada[]
  bloques: number
  respuesta: RespuestaDictada | null
  acertada: Dictada | null
  elementosFallados: Elemento[]
  radicalesFallados: Radical[]
  anotadas: string[]
  vueltas: Dictada[]
  pideSeguridad: boolean
  comentario: string | null
  sorpresasEn: number[]
  sorpresa: Dictada | null
  respuestaDeSorpresa: number[][] | null
}

export interface ResumenDeEjercicio {
  vistos: number
  total: number
  tocan: number
}

export interface AnuncioDeEjercicio {
  nuevos: number
  deRepaso: number
}

interface BloqueDisponible {
  clave: string
  elementos: Elemento[]
}

export const TECLADO = [-5, ...RANGO.filter((numero) => numero !== 0)]

const BLOQUES_POR_DICTADO = 2
const ELEMENTOS_MINIMOS_POR_BLOQUE = 5
const RADICALES_POR_EJERCICIO = 10
const PREGUNTAS_HASTA_LA_REINSERCION = 3

function claveDe(bloque: Elemento[]): string {
  return bloque.map((elemento) => elemento.simbolo).join(' ')
}

function ordenDelCamino(camino: Camino): string[] {
  return trozosDe(camino).flat()
}

function bloquesPorElCamino(camino: Camino): BloqueDisponible[] {
  const orden = ordenDelCamino(camino)
  const ultimoDe = ({ elementos: delBloque }: BloqueDisponible) => Math.max(...delBloque.map(({ simbolo }) => orden.indexOf(simbolo)))
  return bloques()
    .map((bloque) => ({ clave: claveDe(bloque), elementos: bloque }))
    .sort((a, b) => ultimoDe(a) - ultimoDe(b))
}

function radicalesPorElCamino(camino: Camino): Radical[] {
  const orden = ordenDelCamino(camino)
  return [...radicales()].sort((a, b) => orden.indexOf(a.central) - orden.indexOf(b.central))
}

function bloquesEntre(preguntados: Elemento[]): BloqueDisponible[] {
  return bloques()
    .map((bloque) => ({ clave: claveDe(bloque), elementos: bloque.filter((elemento) => preguntados.includes(elemento)) }))
    .filter(({ elementos: delBloque }) => delBloque.length >= ELEMENTOS_MINIMOS_POR_BLOQUE)
}

function repartir<T>(
  candidatos: T[],
  claveDe: (candidato: T) => string,
  memoria: Record<string, DelDictado>,
  hoy: string,
  total: number,
  parte: number,
  azar: Azar,
): T[] {
  const nuevos = candidatos.filter((candidato) => !memoria[claveDe(candidato)])
  const vistos = barajar(
    candidatos.filter((candidato) => memoria[claveDe(candidato)]),
    azar,
  ).sort((a, b) => memoria[claveDe(a)].ultimo.localeCompare(memoria[claveDe(b)].ultimo))
  const toca = vistos.filter((candidato) => memoria[claveDe(candidato)].vuelve <= hoy)
  const practica = vistos.filter((candidato) => memoria[claveDe(candidato)].vuelve > hoy)
  const repasos = [...toca, ...practica]
  const deRepaso = repasos.slice(0, Math.round(total * parte))
  const deNuevos = nuevos.slice(0, total - deRepaso.length)
  return [...deNuevos, ...deRepaso, ...repasos.slice(deRepaso.length)].slice(0, total)
}

function elegirBloques(disponibles: BloqueDisponible[], memoria: Record<string, DelDictado>, hoy: string, parte: number, azar: Azar): BloqueDisponible[] {
  const elegidos: BloqueDisponible[] = []
  const claveDeBloque = (bloque: BloqueDisponible) => bloque.clave
  for (const bloque of [...repartir(disponibles, claveDeBloque, memoria, hoy, BLOQUES_POR_DICTADO, parte, azar), ...disponibles]) {
    const yaSale = bloque.elementos.some((elemento) => elegidos.some((elegido) => elegido.elementos.includes(elemento)))
    if (elegidos.length < BLOQUES_POR_DICTADO && !yaSale) elegidos.push(bloque)
  }
  return elegidos
}

function dictadasDeBloques(elegidos: BloqueDisponible[], azar: Azar): Dictada[] {
  return barajar(elegidos, azar).map(
    (bloque, indice): Dictada => ({ tipo: 'bloque', ...bloque, dadoPor: azar() < 0.5 ? 'simbolo' : 'nombre', numero: indice + 1 }),
  )
}

function preguntasDe(radical: Radical, azar: Azar): Dictada[] {
  const dadoPor = azar() < 0.5 ? 'formula' : 'nombre'
  return [
    { tipo: 'radical', radical, dadoPor, pide: 'escritura' },
    { tipo: 'radical', radical, dadoPor, pide: 'numero' },
  ]
}

function claveDeDictada(dictada: Dictada): string {
  return dictada.tipo === 'bloque' ? dictada.clave : dictada.radical.nombre
}

function fallidos(elementosDelBloque: Elemento[], respuesta: number[][]): Elemento[] {
  return elementosDelBloque.filter((elemento, fila) => !mismosNumeros(elemento.numeros, respuesta[fila]))
}

export function sitiosDeSorpresa(preguntas: number, sorpresas: number, azar: Azar): number[] {
  const sitios = Array.from({ length: Math.max(0, preguntas - 1) }, (_, sitio) => sitio)
  return barajar(sitios, azar).slice(0, sorpresas)
}

export function aciertaDictada(dictada: Dictada, respuesta: RespuestaDictada): boolean {
  if (typeof respuesta === 'string') {
    if (dictada.tipo !== 'radical') return false
    return dictada.dadoPor === 'formula' ? esSuNombre(dictada.radical, respuesta) : esSuFormula(dictada.radical, respuesta)
  }
  return dictada.tipo === 'bloque'
    ? fallidos(dictada.elementos, respuesta).length === 0
    : mismosNumeros([numeroDeRadical(dictada.radical)], respuesta[0])
}

export function correccionDeElemento(elemento: Elemento, numeros: number[]): Correccion {
  const pregunta: Pregunta = {
    elemento,
    dadoPor: 'simbolo',
    paso: 'numeros',
    fallados: ['numeros'],
    saltados: [],
    opciones: [],
    pideSeguridad: false,
    dudo: false,
  }
  return correccionDe(pregunta, { paso: 'numeros', numeros })
}

export function crearDictados(dominio: Dominio, hoy: () => string, azar: Azar) {
  function preguntados(): Elemento[] {
    const entradas = dominio.entradas()
    return elementos().filter(({ simbolo }) => entradas[simbolo] && !sinPreguntar(entradas[simbolo]))
  }

  function parteDe(tipo: DictadoEnCurso['tipo']): number {
    return parteDeRepaso(dominio.oleadas().filter((hecha) => hecha.tipo === tipo).length)
  }

  function bloquesDelSiguiente(): BloqueDisponible[] {
    return elegirBloques(bloquesPorElCamino(dominio.camino()), dominio.delDictado(), hoy(), parteDe('dictado'), azar)
  }

  function radicalesDelSiguiente(): Radical[] {
    const claveDeRadical = (radical: Radical) => radical.nombre
    return repartir(
      radicalesPorElCamino(dominio.camino()),
      claveDeRadical,
      dominio.delDictado(),
      hoy(),
      RADICALES_POR_EJERCICIO,
      parteDe('radicales'),
      azar,
    )
  }

  function elegirSorpresa(tipo?: Dictada['tipo']): Dictada | null {
    const conocidos = preguntados()
    const deBloques = bloquesEntre(conocidos).map(
      (bloque): Dictada => ({ tipo: 'bloque', ...bloque, dadoPor: azar() < 0.5 ? 'simbolo' : 'nombre', numero: 1 }),
    )
    const deRadicales = radicales()
      .filter((radical) => conocidos.some((elemento) => elemento.simbolo === radical.central))
      .map((radical): Dictada => ({ tipo: 'radical', radical, dadoPor: 'formula', pide: 'numero' }))
    const candidatas = [...deBloques, ...deRadicales].filter((candidata) => !tipo || candidata.tipo === tipo)
    return barajar(candidatas, azar)[0] ?? null
  }

  function preguntarLaSiguiente(dictado: DictadoEnCurso): DictadoEnCurso {
    const [pregunta = null, ...pendientes] = dictado.pendientes
    if (!pregunta && dictado.pregunta) dominio.registrarOleada(dictado.tipo)
    const tocaSorpresa = pregunta !== null && dictado.sorpresasEn.includes(pendientes.length)
    return {
      ...dictado,
      pregunta,
      pendientes,
      pideSeguridad: azar() < ajustesDe(dominio.modo()).seguro,
      sorpresasEn: tocaSorpresa ? dictado.sorpresasEn.filter((sitio) => sitio !== pendientes.length) : dictado.sorpresasEn,
      sorpresa: tocaSorpresa ? elegirSorpresa(dictado.tipo === 'dictado' ? 'radical' : 'bloque') : null,
    }
  }

  function comentarioDe(bien: boolean, seguro: boolean | undefined): string | null {
    const modo = dominio.modo()
    const { alAcertarDudando, alFallarSeguro } = ajustesDe(modo)
    if (!bien) return seguro ? alFallarSeguro : null
    return (seguro === false ? alAcertarDudando : null) ?? comentarioAlAcertar(modo, azar)
  }

  function vacio(tipo: DictadoEnCurso['tipo'], pendientes: Dictada[], presentacion: string[] | null): DictadoEnCurso {
    return {
      tipo,
      presentacion,
      pregunta: null,
      pendientes,
      bloques: pendientes.filter((dictada) => dictada.tipo === 'bloque').length,
      respuesta: null,
      acertada: null,
      elementosFallados: [],
      radicalesFallados: [],
      anotadas: [],
      vueltas: [],
      pideSeguridad: false,
      comentario: null,
      sorpresasEn: sitiosDeSorpresa(pendientes.length, ajustesDe(dominio.modo()).sorpresas, azar),
      sorpresa: null,
      respuestaDeSorpresa: null,
    }
  }

  function anuncioDe(claves: string[]): AnuncioDeEjercicio {
    const memoria = dominio.delDictado()
    return { nuevos: claves.filter((clave) => !memoria[clave]).length, deRepaso: claves.filter((clave) => memoria[clave]).length }
  }

  function resumenDe(claves: string[]): ResumenDeEjercicio {
    const memoria = dominio.delDictado()
    return {
      vistos: claves.filter((clave) => memoria[clave]).length,
      total: claves.length,
      tocan: claves.filter((clave) => memoria[clave]?.vuelve <= hoy()).length,
    }
  }

  return {
    elegirSorpresa,

    memoriaDelDictado(): Record<string, DelDictado> {
      return dominio.delDictado()
    },

    resumenDelDictado(): ResumenDeEjercicio {
      return resumenDe(bloques().map(claveDe))
    },

    resumenDeRadicales(): ResumenDeEjercicio {
      return resumenDe(radicales().map((radical) => radical.nombre))
    },

    anuncioDelDictado(): AnuncioDeEjercicio {
      return anuncioDe(bloquesDelSiguiente().map((bloque) => bloque.clave))
    },

    anuncioDeRadicales(): AnuncioDeEjercicio {
      return anuncioDe(radicalesDelSiguiente().map((radical) => radical.nombre))
    },

    abrirDictado(): DictadoEnCurso {
      const elegidos = bloquesDelSiguiente()
      const entradas = dominio.entradas()
      const sinVer = elegidos
        .flatMap((bloque) => bloque.elementos)
        .map(({ simbolo }) => simbolo)
        .filter((simbolo) => !entradas[simbolo])
      const dictado = vacio('dictado', dictadasDeBloques(elegidos, azar), sinVer.length > 0 ? sinVer : null)
      return dictado.presentacion ? dictado : preguntarLaSiguiente(dictado)
    },

    abrirRadicales(): DictadoEnCurso {
      const pendientes = barajar(radicalesDelSiguiente(), azar).flatMap((radical) => preguntasDe(radical, azar))
      return preguntarLaSiguiente(vacio('radicales', pendientes, null))
    },

    descartarPresentacionDelDictado(dictado: DictadoEnCurso): DictadoEnCurso {
      if (!dictado.presentacion) return dictado
      dominio.presentar(dictado.presentacion)
      return preguntarLaSiguiente({ ...dictado, presentacion: null })
    },

    responderDictado(dictado: DictadoEnCurso, respuesta: RespuestaDictada, seguro?: boolean): DictadoEnCurso {
      const { pregunta } = dictado
      if (!pregunta || dictado.respuesta !== null || dictado.sorpresa) return dictado
      const clave = claveDeDictada(pregunta)
      const yaAnotada = dictado.anotadas.includes(clave)
      const anotadas = yaAnotada ? dictado.anotadas : [...dictado.anotadas, clave]
      const bien = aciertaDictada(pregunta, respuesta)
      if (!yaAnotada || !bien) dominio.anotarDictado(clave, bien)
      const comentario = comentarioDe(bien, seguro)
      if (bien) return preguntarLaSiguiente({ ...dictado, anotadas, acertada: pregunta, comentario })
      if (pregunta.tipo === 'bloque' && typeof respuesta !== 'string') {
        const entradas = dominio.entradas()
        for (const { simbolo } of fallidos(pregunta.elementos, respuesta).filter((elemento) => !dictado.elementosFallados.includes(elemento))) {
          if (!sinPreguntar(entradas[simbolo])) dominio.anotar(simbolo, ['numeros'])
        }
      }
      return { ...dictado, anotadas, respuesta, acertada: null, comentario }
    },

    cerrarCorreccionDeDictado(dictado: DictadoEnCurso): DictadoEnCurso {
      const { pregunta, respuesta } = dictado
      if (!pregunta || respuesta === null) return dictado
      const pendientes = [...dictado.pendientes]
      if (pregunta.tipo === 'radical') {
        const primeraVez = !dictado.vueltas.includes(pregunta)
        if (primeraVez) pendientes.splice(PREGUNTAS_HASTA_LA_REINSERCION, 0, pregunta)
        return preguntarLaSiguiente({
          ...dictado,
          respuesta: null,
          comentario: null,
          pendientes,
          vueltas: primeraVez ? [...dictado.vueltas, pregunta] : dictado.vueltas,
          radicalesFallados: dictado.radicalesFallados.includes(pregunta.radical)
            ? dictado.radicalesFallados
            : [...dictado.radicalesFallados, pregunta.radical],
        })
      }
      const nuevos = fallidos(pregunta.elementos, respuesta as number[][]).filter((elemento) => !dictado.elementosFallados.includes(elemento))
      if (nuevos.length > 0) pendientes.splice(PREGUNTAS_HASTA_LA_REINSERCION, 0, { ...pregunta, elementos: nuevos })
      return preguntarLaSiguiente({
        ...dictado,
        respuesta: null,
        comentario: null,
        pendientes,
        elementosFallados: [...dictado.elementosFallados, ...nuevos],
      })
    },
  }
}
