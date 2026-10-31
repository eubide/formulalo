import { trozosDe, type Camino } from '../catalogo/caminos'
import { elementoDe, elementos } from '../catalogo/catalogo'
import { ajustesDe, comentarioAlAcertar, type Modo } from '../catalogo/modos'
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
import { crearDictados, sitiosDeSorpresa, type Dictada } from './dictado'
import { crearDominio, diaLocal, sinPreguntar, type Almacen, type Entrada } from './dominio'
import { empezarAFormular, trasResponder, trasSeguir, type Formulando, type RespuestaDePieza } from './formular'
import { parteDeRepaso } from './serie'

export { almacenEnMemoria, diaLocal, type Almacen, type Entrada, type Estado } from './dominio'
export { aciertaDictada, correccionDeElemento, TECLADO, type AnuncioDeEjercicio, type Dictada, type DictadoEnCurso, type RespuestaDictada, type ResumenDeEjercicio } from './dictado'
export { etiquetaDePaso, pasosDe } from './cadena'
export { PIEZAS, type Formulando, type Pieza, type RespuestaDePieza } from './formular'
export type { Azar, Correccion, Paso, Pregunta, Respuesta } from './cadena'

export type Estudio = ReturnType<typeof crearEstudio>

export interface Oleada {
  presentacion: string[] | null
  pregunta: Pregunta | null
  correccion: Correccion | null
  pendientes: string[]
  rotulados: string[]
  sabidos: string[]
  vuelven: string[]
  sorpresasEn: number[]
  sorpresa: Dictada | null
  respuestaDeSorpresa: number[][] | null
  comentario: string | null
  formulando: Formulando | null
}

interface ConSorpresa {
  sorpresa: Dictada | null
  respuestaDeSorpresa: number[][] | null
}

export interface Anuncio {
  repaso: number
  nuevos: number
  practica: number
  minutos: number
  quedan: number
}

export interface Seguimiento {
  oleadasDeHoy: number
  dictadosDeHoy: number
  radicalesDeHoy: number
  minutosDesdeLaUltima: number
  minutosEntreOleadas: number | null
  mediaPorDia: number
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

const ELEMENTOS_POR_OLEADA = 8
const NUEVOS_MINIMOS_POR_OLEADA = 4
const FLOJOS_POR_OLEADA = 3
const MINUTOS_DE_UNA_OLEADA_LLENA = 4
const ELEMENTOS_HASTA_LA_REINSERCION = 3
const MILISEGUNDOS_DE_UN_DIA = 86_400_000
const MILISEGUNDOS_DE_UN_MINUTO = 60_000

function trozosEnteros(trozos: string[][], minimo: number): string[] {
  const tomados: string[] = []
  for (const trozo of trozos) {
    if (tomados.length >= minimo) break
    tomados.push(...trozo)
  }
  return tomados
}

function preguntadosDe(entradas: Record<string, Entrada>): string[] {
  return elementos()
    .map((elemento) => elemento.simbolo)
    .filter((simbolo) => entradas[simbolo] && !sinPreguntar(entradas[simbolo]))
}

function componer(
  entradas: Record<string, Entrada>,
  camino: Camino,
  hoy: string,
  azar: Azar,
  oleadasHechas: number,
): Composicion {
  const esperan = Object.keys(entradas).filter((simbolo) => sinPreguntar(entradas[simbolo]))
  const sinVer = trozosDe(camino)
    .map((trozo) => trozo.filter((simbolo) => !entradas[simbolo]))
    .filter((trozo) => trozo.length > 0)
  const preguntados = preguntadosDe(entradas)

  const minimoDeNuevos = preguntados.length > 0 ? NUEVOS_MINIMOS_POR_OLEADA : 1
  const presentacion = esperan.length === 0 && sinVer.length > 0 ? trozosEnteros(sinVer, minimoDeNuevos) : null
  const nuevos = presentacion ?? esperan.slice(0, ELEMENTOS_POR_OLEADA)
  const parte = parteDeRepaso(oleadasHechas)
  const sitios =
    nuevos.length === 0 ? ELEMENTOS_POR_OLEADA : parte === 0 ? 0 : Math.max(1, Math.round((nuevos.length * parte) / (1 - parte)))

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
  coger(flojos.filter(toca), FLOJOS_POR_OLEADA)
  coger(sabidos.filter(toca).sort((a, b) => entradas[a].vuelve.localeCompare(entradas[b].vuelve)))
  coger(flojosDeHoy, FLOJOS_POR_OLEADA - elegidos.filter(esFlojo).length)
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

export function crearEstudio(almacen: Almacen, hoy: () => string, azar: Azar, ahora: () => string) {
  const dominio = crearDominio(almacen, hoy, ahora)
  const dictados = crearDictados(dominio, hoy, azar)

  function oleadasHechas(): number {
    return dominio.oleadas().filter(({ tipo }) => tipo === 'oleada').length
  }

  function compuestosAlCerrar(oleada: Oleada): Formulando | null {
    const entradas = dominio.entradas()
    return empezarAFormular((simbolo) => entradas[simbolo]?.estado === 'sabido', oleada.rotulados, azar)
  }

  function preguntarElSiguiente(oleada: Oleada): Oleada {
    const [siguiente, ...pendientes] = oleada.pendientes
    const terminada = !siguiente && oleada.pregunta !== null
    if (terminada) dominio.registrarOleada('oleada')
    const tocaSorpresa = siguiente !== undefined && oleada.sorpresasEn.includes(pendientes.length)
    return {
      ...oleada,
      pendientes,
      pregunta: siguiente ? preguntar(elementoDe(siguiente), azar, ajustesDe(dominio.modo()).seguro) : null,
      sorpresasEn: tocaSorpresa ? oleada.sorpresasEn.filter((sitio) => sitio !== pendientes.length) : oleada.sorpresasEn,
      sorpresa: tocaSorpresa ? dictados.elegirSorpresa() : null,
      formulando: terminada ? compuestosAlCerrar(oleada) : null,
    }
  }

  function terminarCadena(oleada: Oleada): Oleada {
    const { elemento, fallados, dudo } = oleada.pregunta!
    const { simbolo } = elemento
    const rotulados = oleada.rotulados.includes(simbolo) ? oleada.rotulados : [...oleada.rotulados, simbolo]
    if (oleada.vuelven.includes(simbolo)) return preguntarElSiguiente({ ...oleada, rotulados })

    const queCuentan = fallados.filter((paso) => paso !== 'configuracion')
    if (dominio.anotar(simbolo, queCuentan) === 'sabido') {
      const modo = dominio.modo()
      const comentario = (dudo ? ajustesDe(modo).alAcertarDudando : null) ?? comentarioAlAcertar(modo, azar)
      return preguntarElSiguiente({ ...oleada, rotulados, sabidos: [...oleada.sabidos, simbolo], comentario })
    }
    const pendientes = [...oleada.pendientes]
    pendientes.splice(ELEMENTOS_HASTA_LA_REINSERCION, 0, simbolo)
    return preguntarElSiguiente({ ...oleada, rotulados, pendientes, vuelven: [...oleada.vuelven, simbolo] })
  }

  function avanzar(oleada: Oleada): Oleada {
    const pregunta = oleada.pregunta!
    const pasos = pasosDe(pregunta.elemento)
    const siguiente = pasos[pasos.indexOf(pregunta.paso) + 1]
    return siguiente ? { ...oleada, pregunta: { ...pregunta, paso: siguiente } } : terminarCadena(oleada)
  }

  return {
    ...dictados,

    modo(): Modo {
      return dominio.modo()
    },

    elegirModo(modo: Modo) {
      dominio.elegirModo(modo)
    },

    responderSorpresa<Ejercicio extends ConSorpresa>(ejercicio: Ejercicio, respuesta: number[][]): Ejercicio {
      return ejercicio.sorpresa && !ejercicio.respuestaDeSorpresa ? { ...ejercicio, respuestaDeSorpresa: respuesta } : ejercicio
    },

    cerrarSorpresa<Ejercicio extends ConSorpresa>(ejercicio: Ejercicio): Ejercicio {
      return { ...ejercicio, sorpresa: null, respuestaDeSorpresa: null }
    },

    seguimiento(): Seguimiento | null {
      const hechas = dominio.oleadas()
      if (hechas.length === 0) return null
      const momentos = hechas.map((hecha) => Date.parse(hecha.fin))
      const deHoy = hechas.filter((hecha) => diaLocal(new Date(hecha.fin)) === hoy())
      const dias = (Date.parse(hoy()) - Date.parse(diaLocal(new Date(momentos[0])))) / MILISEGUNDOS_DE_UN_DIA + 1
      return {
        oleadasDeHoy: deHoy.filter((hecha) => hecha.tipo === 'oleada').length,
        dictadosDeHoy: deHoy.filter((hecha) => hecha.tipo === 'dictado').length,
        radicalesDeHoy: deHoy.filter((hecha) => hecha.tipo === 'radicales').length,
        minutosDesdeLaUltima: (Date.parse(ahora()) - momentos.at(-1)!) / MILISEGUNDOS_DE_UN_MINUTO,
        minutosEntreOleadas:
          momentos.length > 1 ? (momentos.at(-1)! - momentos[0]) / (momentos.length - 1) / MILISEGUNDOS_DE_UN_MINUTO : null,
        mediaPorDia: hechas.length / dias,
      }
    },

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
      const { repaso, nuevos, practica, quedan } = componer(dominio.entradas(), dominio.camino(), hoy(), azar, oleadasHechas())
      const cuantos = repaso.length + nuevos.length + practica.length
      return {
        repaso: repaso.length,
        nuevos: nuevos.length,
        practica: practica.length,
        minutos: Math.max(1, Math.round((cuantos * MINUTOS_DE_UNA_OLEADA_LLENA) / ELEMENTOS_POR_OLEADA)),
        quedan,
      }
    },

    proximaVuelta(): string | null {
      const vueltas = Object.values(dominio.entradas())
        .filter((entrada) => !sinPreguntar(entrada))
        .map((entrada) => entrada.vuelve)
      return vueltas.length > 0 ? vueltas.reduce((primera, vuelve) => (vuelve < primera ? vuelve : primera)) : null
    },

    vueltas(oleada: Oleada): Vuelta[] {
      const entradas = dominio.entradas()
      const vuelve = (simbolo: string) => (entradas[simbolo].vuelve < hoy() ? hoy() : entradas[simbolo].vuelve)
      const dias = [...new Set(oleada.rotulados.map(vuelve))].sort()
      return dias.map((dia) => ({
        dias: (Date.parse(dia) - Date.parse(hoy())) / MILISEGUNDOS_DE_UN_DIA,
        simbolos: oleada.rotulados.filter((simbolo) => vuelve(simbolo) === dia),
      }))
    },

    abrirOleada(): Oleada {
      const { presentacion, repaso, nuevos, practica } = componer(dominio.entradas(), dominio.camino(), hoy(), azar, oleadasHechas())
      const pendientes = barajar([...repaso, ...nuevos, ...practica], azar)
      const oleada: Oleada = {
        presentacion,
        pregunta: null,
        correccion: null,
        pendientes,
        rotulados: [],
        sabidos: [],
        vuelven: [],
        sorpresasEn: sitiosDeSorpresa(pendientes.length, ajustesDe(dominio.modo()).sorpresas, azar),
        sorpresa: null,
        respuestaDeSorpresa: null,
        comentario: null,
        formulando: null,
      }
      return oleada.presentacion ? oleada : preguntarElSiguiente(oleada)
    },

    descartarPresentacion(oleada: Oleada): Oleada {
      if (!oleada.presentacion) return oleada
      dominio.presentar(oleada.presentacion)
      return preguntarElSiguiente({ ...oleada, presentacion: null })
    },

    responder(oleada: Oleada, respuesta: Respuesta): Oleada {
      const { pregunta } = oleada
      if (!pregunta || oleada.correccion || oleada.sorpresa || respuesta.paso !== pregunta.paso) return oleada
      const seguro = respuesta.paso === 'numeros' ? respuesta.seguro : undefined
      if (acierta(pregunta, respuesta)) return avanzar({ ...oleada, pregunta: { ...pregunta, dudo: seguro === false } })
      const comentario = seguro ? ajustesDe(dominio.modo()).alFallarSeguro : null
      return {
        ...oleada,
        pregunta: { ...pregunta, fallados: [...pregunta.fallados, pregunta.paso] },
        correccion: { ...correccionDe(pregunta, respuesta), comentario },
      }
    },

    saltarConfiguracion(oleada: Oleada): Oleada {
      const { pregunta } = oleada
      if (!pregunta || oleada.correccion || pregunta.paso !== 'configuracion') return oleada
      return avanzar({ ...oleada, pregunta: { ...pregunta, saltados: ['configuracion'] } })
    },

    cerrarCorreccion(oleada: Oleada): Oleada {
      return oleada.correccion ? avanzar({ ...oleada, correccion: null }) : oleada
    },

    responderPieza(oleada: Oleada, respuesta: RespuestaDePieza): Oleada {
      return oleada.formulando ? { ...oleada, formulando: trasResponder(oleada.formulando, respuesta) } : oleada
    },

    seguirFormulando(oleada: Oleada): Oleada {
      return oleada.formulando ? { ...oleada, formulando: trasSeguir(oleada.formulando) } : oleada
    },

    dejarDeFormular(oleada: Oleada): Oleada {
      return { ...oleada, formulando: null }
    },

    esPrimeraVez(): boolean {
      return dominio.oleadas().length === 0 && preguntadosDe(dominio.entradas()).length === 0
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
