import { etiquetaDeCamino, type Camino } from '../catalogo/caminos'
import { elementos } from '../catalogo/catalogo'
import { PASOS, type Paso } from './cadena'

export type Almacen = Pick<Storage, 'getItem' | 'setItem'>

export type Estado = 'flojo' | 'sabido'

export interface Entrada {
  estado: Estado
  intervalo: number
  vuelve: string
  fallos: number
  pasosFallados: Paso[]
}

interface Registro {
  version: number
  camino: Camino
  elementos: Record<string, Entrada>
}

const CLAVE = 'formulalo:dominio'
const VERSION = 1
const CAMINO_PUESTO: Camino = 'gas-noble'
const INTERVALOS = [1, 3, 7, 14, 30]
const PASOS_QUE_HAY_QUE_SABER: Paso[] = ['posicion', 'numeros']
const DIA = /^\d{4}-\d{2}-\d{2}$/

const estudiados = new Set(elementos().map((elemento) => elemento.simbolo))

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}

function esCamino(valor: unknown): valor is Camino {
  return typeof valor === 'string' && Object.hasOwn(etiquetaDeCamino, valor)
}

function esEntrada(valor: unknown): valor is Entrada {
  return (
    esObjeto(valor) &&
    (valor.estado === 'flojo' || valor.estado === 'sabido') &&
    Number.isSafeInteger(valor.intervalo) &&
    typeof valor.vuelve === 'string' &&
    DIA.test(valor.vuelve) &&
    Number.isSafeInteger(valor.fallos) &&
    Array.isArray(valor.pasosFallados) &&
    valor.pasosFallados.every((paso) => PASOS.includes(paso))
  )
}

function registroVacio(): Registro {
  return { version: VERSION, camino: CAMINO_PUESTO, elementos: {} }
}

function registroValido(datos: unknown): Registro {
  if (!esObjeto(datos) || datos.version !== VERSION) return registroVacio()
  const guardados = esObjeto(datos.elementos) ? datos.elementos : {}
  return {
    version: VERSION,
    camino: esCamino(datos.camino) ? datos.camino : CAMINO_PUESTO,
    elementos: Object.fromEntries(
      Object.entries(guardados).flatMap(([simbolo, entrada]) => {
        if (!estudiados.has(simbolo) || !esEntrada(entrada)) return []
        const { estado, intervalo, vuelve, fallos, pasosFallados } = entrada
        return [[simbolo, { estado, intervalo, vuelve, fallos, pasosFallados }]]
      }),
    ),
  }
}

function registroDeCopia(copia: string): Registro | null {
  let datos: unknown
  try {
    datos = JSON.parse(copia)
  } catch {
    return null
  }
  const entera =
    esObjeto(datos) &&
    datos.version === VERSION &&
    esCamino(datos.camino) &&
    esObjeto(datos.elementos) &&
    Object.entries(datos.elementos).every(([simbolo, entrada]) => estudiados.has(simbolo) && esEntrada(entrada))
  return entera ? registroValido(datos) : null
}

function diasDespues(dia: string, dias: number): string {
  const fecha = new Date(`${dia}T00:00:00Z`)
  fecha.setUTCDate(fecha.getUTCDate() + dias)
  return fecha.toISOString().slice(0, 10)
}

export function diaLocal(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

export function almacenEnMemoria(): Almacen {
  const datos = new Map<string, string>()
  return {
    getItem: (clave) => datos.get(clave) ?? null,
    setItem: (clave, valor) => void datos.set(clave, valor),
  }
}

export function crearDominio(almacen: Almacen, hoy: () => string) {
  function leer(): Registro {
    try {
      return registroValido(JSON.parse(almacen.getItem(CLAVE) ?? 'null'))
    } catch {
      return registroVacio()
    }
  }

  function guardar(registro: Registro) {
    try {
      almacen.setItem(CLAVE, JSON.stringify(registro))
    } catch {}
  }

  return {
    camino(): Camino {
      return leer().camino
    },

    elegirCamino(camino: Camino) {
      guardar({ ...leer(), camino })
    },

    entradas(): Record<string, Entrada> {
      return leer().elementos
    },

    presentar(simbolos: string[]) {
      const registro = leer()
      for (const simbolo of simbolos) {
        registro.elementos[simbolo] ??= { estado: 'flojo', intervalo: 0, vuelve: hoy(), fallos: 0, pasosFallados: [] }
      }
      guardar(registro)
    },

    anotar(simbolo: string, pasosFallados: Paso[]): Estado {
      const registro = leer()
      const { intervalo = 0, fallos = 0 } = registro.elementos[simbolo] ?? {}
      if (pasosFallados.some((paso) => PASOS_QUE_HAY_QUE_SABER.includes(paso))) {
        registro.elementos[simbolo] = {
          estado: 'flojo',
          intervalo: 0,
          vuelve: diasDespues(hoy(), 1),
          fallos: fallos + 1,
          pasosFallados,
        }
      } else {
        const crecido = INTERVALOS.find((dias) => dias > intervalo) ?? INTERVALOS.at(-1)!
        const siguiente = pasosFallados.length > 0 ? intervalo || INTERVALOS[0] : crecido
        registro.elementos[simbolo] = {
          estado: 'sabido',
          intervalo: siguiente,
          vuelve: diasDespues(hoy(), siguiente),
          fallos,
          pasosFallados,
        }
      }
      guardar(registro)
      return registro.elementos[simbolo].estado
    },

    copia(): string {
      return JSON.stringify(leer())
    },

    esCopia(copia: string): boolean {
      return registroDeCopia(copia) !== null
    },

    recuperar(copia: string): boolean {
      const registro = registroDeCopia(copia)
      if (registro) guardar(registro)
      return registro !== null
    },
  }
}
