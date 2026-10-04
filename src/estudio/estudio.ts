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
  sabidos: string[]
  vuelven: string[]
}

export interface Anuncio {
  repaso: number
  nuevos: number
  practica: number
  minutos: number
  quedan: number
}

export interface Vuelta {
  dias: number
  simbolos: string[]
}

export interface Resumen {
  sabidos: number
  flojos: number
  sinVer: number
  total: number
}

interface Composicion {
  repaso: string[]
  practica: string[]
  presentacion: string[] | null
  nuevos: string[]
  quedan: number
}

const ELEMENTOS_POR_TANDA = 8
const FLOJOS_POR_TANDA = 3
const MINUTOS_DE_UNA_TANDA_LLENA = 4
const ELEMENTOS_HASTA_LA_REINSERCION = 3
const MILISEGUNDOS_DE_UN_DIA = 86_400_000

// Un Flojo sin fallos solo puede venir de una Presentación: todavía no se le ha preguntado nada.
function sinPreguntar(entrada: Entrada): boolean {
  return entrada.estado === 'flojo' && entrada.fallos === 0
}

function componer(entradas: Record<string, Entrada>, camino: Camino, hoy: string, azar: Azar): Composicion {
  const esperan = Object.keys(entradas).filter((simbolo) => sinPreguntar(entradas[simbolo]))
  const sinVer = trozosDe(camino)
    .map((trozo) => trozo.filter((simbolo) => !entradas[simbolo]))
    .find((trozo) => trozo.length > 0)
  const presentacion = esperan.length === 0 && sinVer ? sinVer : null
  const nuevos = (presentacion ?? esperan).slice(0, ELEMENTOS_POR_TANDA)
  const sitios = ELEMENTOS_POR_TANDA - nuevos.length

  const preguntados = elementos()
    .map((elemento) => elemento.simbolo)
    .filter((simbolo) => entradas[simbolo] && !sinPreguntar(entradas[simbolo]))
  const toca = (simbolo: string) => entradas[simbolo].vuelve <= hoy
  const esFlojo = (simbolo: string) => entradas[simbolo].estado === 'flojo'
  const flojos = barajar(preguntados.filter(esFlojo), azar)
  const sabidos = preguntados.filter((simbolo) => !esFlojo(simbolo))
  const queTocan = preguntados.filter(toca)
  const flojosDeHoy = flojos.filter((simbolo) => !toca(simbolo))
  const deIntervaloMasCorto = barajar(
    sabidos.filter((simbolo) => !toca(simbolo)),
    azar,
  ).sort((a, b) => entradas[a].intervalo - entradas[b].intervalo)

  const elegidos: string[] = []
  const coger = (candidatos: string[], tope = sitios) => {
    const libres = Math.min(tope, sitios - elegidos.length)
    elegidos.push(...candidatos.filter((simbolo) => !elegidos.includes(simbolo)).slice(0, Math.max(0, libres)))
  }
  coger(flojos.filter(toca), FLOJOS_POR_TANDA)
  coger(sabidos.filter(toca).sort((a, b) => entradas[a].vuelve.localeCompare(entradas[b].vuelve)))
  coger(flojosDeHoy, FLOJOS_POR_TANDA - elegidos.filter(esFlojo).length)
  coger(deIntervaloMasCorto)
  coger(flojos.filter(toca))
  coger(flojosDeHoy)

  const repaso = elegidos.filter(toca)
  return {
    repaso,
    practica: elegidos.filter((simbolo) => !toca(simbolo)),
    presentacion,
    nuevos,
    quedan: queTocan.length - repaso.length,
  }
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

    if (dominio.anotar(simbolo, fallados) === 'sabido') {
      return preguntarElSiguiente({ ...tanda, rotulados, sabidos: [...tanda.sabidos, simbolo] })
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

    anuncio(): Anuncio {
      const { repaso, nuevos, practica, quedan } = componer(dominio.entradas(), dominio.camino(), hoy(), azar)
      const cuantos = repaso.length + nuevos.length + practica.length
      return {
        repaso: repaso.length,
        nuevos: nuevos.length,
        practica: practica.length,
        minutos: Math.max(1, Math.round((cuantos * MINUTOS_DE_UNA_TANDA_LLENA) / ELEMENTOS_POR_TANDA)),
        quedan,
      }
    },

    proximaVuelta(): string | null {
      const vueltas = Object.values(dominio.entradas()).map((entrada) => entrada.vuelve)
      return vueltas.length > 0 ? vueltas.reduce((primera, vuelve) => (vuelve < primera ? vuelve : primera)) : null
    },

    vueltas(tanda: Tanda): Vuelta[] {
      const entradas = dominio.entradas()
      const vuelve = (simbolo: string) => (entradas[simbolo].vuelve < hoy() ? hoy() : entradas[simbolo].vuelve)
      const dias = [...new Set(tanda.rotulados.map(vuelve))].sort()
      return dias.map((dia) => ({
        dias: (Date.parse(dia) - Date.parse(hoy())) / MILISEGUNDOS_DE_UN_DIA,
        simbolos: tanda.rotulados.filter((simbolo) => vuelve(simbolo) === dia),
      }))
    },

    abrirTanda(): Tanda {
      const { presentacion, repaso, nuevos, practica } = componer(dominio.entradas(), dominio.camino(), hoy(), azar)
      const tanda: Tanda = {
        presentacion,
        pregunta: null,
        correccion: null,
        pendientes: barajar([...repaso, ...nuevos, ...practica], azar),
        rotulados: [],
        sabidos: [],
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
