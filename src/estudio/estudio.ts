import { trozosDe, type Camino } from '../catalogo/caminos'
import { elementoDe, elementos } from '../catalogo/catalogo'
import {
  acierta,
  barajar,
  correccionDe,
  pasosDe,
  preguntar,
  type Azar,
  type Correccion,
  type Pregunta,
  type Respuesta,
} from './cadena'
import { crearDominio, type Almacen, type Entrada } from './dominio'

export { almacenEnMemoria, diaLocal, type Almacen, type Entrada, type Estado } from './dominio'
export { etiquetaDePaso, pasosDe } from './cadena'
export type { Azar, Correccion, Paso, Pregunta, Respuesta } from './cadena'

export type Estudio = ReturnType<typeof crearEstudio>

export interface Tanda {
  presentacion: string[] | null
  pregunta: Pregunta | null
  correccion: Correccion | null
  pendientes: string[]
  rotulados: string[]
  enteros: string[]
  vuelven: string[]
}

export interface Anuncio {
  repaso: number
  nuevos: number
  minutos: number
}

export interface Resumen {
  sabidos: number
  flojos: number
  sinVer: number
  total: number
}

interface Composicion {
  repaso: string[]
  presentacion: string[] | null
  nuevos: string[]
}

const ELEMENTOS_POR_TANDA = 8
const MINUTOS_DE_UNA_TANDA_LLENA = 4
const ELEMENTOS_HASTA_LA_REINSERCION = 3

// Un Flojo sin fallos solo puede venir de una Presentación: todavía no se le ha preguntado nada.
function sinPreguntar(entrada: Entrada): boolean {
  return entrada.estado === 'flojo' && entrada.fallos === 0
}

function queTocan(entradas: Record<string, Entrada>, hoy: string): string[] {
  const tocan = elementos()
    .map((elemento) => elemento.simbolo)
    .filter((simbolo) => entradas[simbolo] && entradas[simbolo].vuelve <= hoy)
  const flojos = tocan
    .filter((simbolo) => entradas[simbolo].estado === 'flojo')
    .sort((a, b) => entradas[b].fallos - entradas[a].fallos)
  const sabidos = tocan
    .filter((simbolo) => entradas[simbolo].estado === 'sabido')
    .sort((a, b) => entradas[a].vuelve.localeCompare(entradas[b].vuelve))
  return [...flojos, ...sabidos]
}

function componer(entradas: Record<string, Entrada>, camino: Camino, hoy: string): Composicion | null {
  const repaso = queTocan(entradas, hoy).slice(0, ELEMENTOS_POR_TANDA)
  const huecos = ELEMENTOS_POR_TANDA - repaso.length
  const sinVer = trozosDe(camino)
    .map((trozo) => trozo.filter((simbolo) => !entradas[simbolo]))
    .find((trozo) => trozo.length > 0)
  const quedaAlgoSinPreguntar = Object.values(entradas).some(sinPreguntar)
  const presentacion = huecos > 0 && sinVer && !quedaAlgoSinPreguntar ? sinVer : null
  if (repaso.length === 0 && !presentacion) return null
  return { repaso, presentacion, nuevos: presentacion?.slice(0, huecos) ?? [] }
}

export function crearEstudio(almacen: Almacen, hoy: () => string, azar: Azar) {
  const dominio = crearDominio(almacen, hoy)

  function preguntarElSiguiente(tanda: Tanda): Tanda {
    const [siguiente, ...pendientes] = tanda.pendientes
    return { ...tanda, pendientes, pregunta: siguiente ? preguntar(elementoDe(siguiente), azar) : null }
  }

  function terminarCadena(tanda: Tanda): Tanda {
    const { elemento, fallados } = tanda.pregunta!
    const { simbolo } = elemento
    const rotulados = tanda.rotulados.includes(simbolo) ? tanda.rotulados : [...tanda.rotulados, simbolo]
    if (tanda.vuelven.includes(simbolo)) return preguntarElSiguiente({ ...tanda, rotulados })

    dominio.anotar(simbolo, fallados)
    if (fallados.length === 0) {
      return preguntarElSiguiente({ ...tanda, rotulados, enteros: [...tanda.enteros, simbolo] })
    }
    const pendientes = [...tanda.pendientes]
    pendientes.splice(ELEMENTOS_HASTA_LA_REINSERCION, 0, simbolo)
    return preguntarElSiguiente({ ...tanda, rotulados, pendientes, vuelven: [...tanda.vuelven, simbolo] })
  }

  function avanzar(tanda: Tanda): Tanda {
    const pregunta = tanda.pregunta!
    const pasos = pasosDe(pregunta.elemento)
    const siguiente = pasos[pasos.indexOf(pregunta.paso) + 1]
    return siguiente ? { ...tanda, pregunta: { ...pregunta, paso: siguiente } } : terminarCadena(tanda)
  }

  return {
    camino(): Camino {
      return dominio.camino()
    },

    elegirCamino(camino: Camino) {
      dominio.elegirCamino(camino)
    },

    entradas(): Record<string, Entrada> {
      return dominio.entradas()
    },

    resumen(): Resumen {
      const estados = Object.values(dominio.entradas()).map((entrada) => entrada.estado)
      const sabidos = estados.filter((estado) => estado === 'sabido').length
      const total = elementos().length
      return { sabidos, flojos: estados.length - sabidos, sinVer: total - estados.length, total }
    },

    anuncio(): Anuncio | null {
      const entradas = dominio.entradas()
      const composicion = componer(entradas, dominio.camino(), hoy())
      if (!composicion) return null
      const cuantos = composicion.repaso.length + composicion.nuevos.length
      const yaPreguntados = composicion.repaso.filter((simbolo) => !sinPreguntar(entradas[simbolo])).length
      return {
        repaso: yaPreguntados,
        nuevos: cuantos - yaPreguntados,
        minutos: Math.max(1, Math.round((cuantos * MINUTOS_DE_UNA_TANDA_LLENA) / ELEMENTOS_POR_TANDA)),
      }
    },

    proximaVuelta(): string | null {
      const vueltas = Object.values(dominio.entradas()).map((entrada) => entrada.vuelve)
      return vueltas.length > 0 ? vueltas.reduce((primera, vuelve) => (vuelve < primera ? vuelve : primera)) : null
    },

    abrirTanda(): Tanda | null {
      const composicion = componer(dominio.entradas(), dominio.camino(), hoy())
      if (!composicion) return null
      const tanda: Tanda = {
        presentacion: composicion.presentacion,
        pregunta: null,
        correccion: null,
        pendientes: barajar([...composicion.repaso, ...composicion.nuevos], azar),
        rotulados: [],
        enteros: [],
        vuelven: [],
      }
      return tanda.presentacion ? tanda : preguntarElSiguiente(tanda)
    },

    descartarPresentacion(tanda: Tanda): Tanda {
      if (!tanda.presentacion) return tanda
      dominio.presentar(tanda.presentacion)
      return preguntarElSiguiente({ ...tanda, presentacion: null })
    },

    responder(tanda: Tanda, respuesta: Respuesta): Tanda {
      const { pregunta } = tanda
      if (!pregunta || tanda.correccion || respuesta.paso !== pregunta.paso) return tanda
      if (acierta(pregunta, respuesta)) return avanzar(tanda)
      return {
        ...tanda,
        pregunta: { ...pregunta, fallados: [...pregunta.fallados, pregunta.paso] },
        correccion: correccionDe(pregunta, respuesta),
      }
    },

    cerrarCorreccion(tanda: Tanda): Tanda {
      return tanda.correccion ? avanzar({ ...tanda, correccion: null }) : tanda
    },

    copia(): string {
      return dominio.copia()
    },

    esCopia(copia: string): boolean {
      return dominio.esCopia(copia)
    },

    recuperar(copia: string): boolean {
      return dominio.recuperar(copia)
    },
  }
}
