import { ultimoSubnivel } from '../catalogo/catalogo'
import {
  almacenEnMemoria,
  crearEstudio,
  type Almacen,
  type Estudio,
  type Paso,
  type Pregunta,
  type Respuesta,
  type Oleada,
} from './estudio'

export const DIA_1 = '2026-10-05'

// Con un almacén nuevo fija el Camino desde el gas noble: sus trozos son los Grupos enteros de los que parten los tests.
export function montar(azar = () => 0, almacenDado?: Almacen) {
  const almacen = almacenDado ?? almacenEnMemoria()
  const reloj = { dia: DIA_1, hora: '10:00' }
  const ahora = () => `${reloj.dia}T${reloj.hora}:00`
  const estudio = crearEstudio(almacen, () => reloj.dia, azar, ahora)
  if (!almacenDado) estudio.elegirCamino('gas-noble')
  return { estudio, reloj, almacen }
}

export function correctaDe({ elemento, paso }: Pregunta): Respuesta {
  if (paso === 'posicion') return { paso, simbolo: elemento.simbolo }
  if (paso === 'clase') return { paso, clase: elemento.clase }
  if (paso === 'configuracion') return { paso, subnivel: ultimoSubnivel(elemento)! }
  return { paso, numeros: elemento.numeros }
}

function equivocadaDe({ elemento, paso }: Pregunta): Respuesta {
  if (paso === 'posicion') return { paso, simbolo: elemento.simbolo === 'Fr' ? 'He' : 'Fr' }
  if (paso === 'clase') return { paso, clase: elemento.clase === 'metal' ? 'no-metal' : 'metal' }
  if (paso === 'configuracion') return { paso, subnivel: { capa: 7, letra: 'd', electrones: 9 } }
  return { paso, numeros: [] }
}

export function sigueLaMismaCadena(oleada: Oleada, simbolo: string): boolean {
  return oleada.pregunta?.elemento.simbolo === simbolo && oleada.pregunta.paso !== 'posicion'
}

export function acertarCadena(estudio: Estudio, oleada: Oleada): Oleada {
  return fallar(estudio, oleada, [])
}

export function fallar(estudio: Estudio, oleada: Oleada, pasos: Paso[]): Oleada {
  const simbolo = oleada.pregunta!.elemento.simbolo
  let actual = oleada
  do {
    const pregunta = actual.pregunta!
    actual = pasos.includes(pregunta.paso)
      ? estudio.cerrarCorreccion(estudio.responder(actual, equivocadaDe(pregunta)))
      : estudio.responder(actual, correctaDe(pregunta))
  } while (sigueLaMismaCadena(actual, simbolo))
  return actual
}

export function abrir(estudio: Estudio): Oleada {
  const oleada = estudio.abrirOleada()
  return oleada.presentacion ? estudio.descartarPresentacion(oleada) : oleada
}

export function acertarOleada(estudio: Estudio, oleada: Oleada): Oleada {
  let actual = oleada
  while (actual.pregunta) actual = acertarCadena(estudio, actual)
  return actual
}

export function estudiarElDia(estudio: Estudio, fallados: string[] = []) {
  while (estudio.anuncio().repaso + estudio.anuncio().nuevos > 0) {
    let oleada = abrir(estudio)
    while (oleada.pregunta) {
      const { simbolo } = oleada.pregunta.elemento
      const falla = fallados.includes(simbolo) && !oleada.vuelven.includes(simbolo)
      oleada = fallar(estudio, oleada, falla ? ['numeros'] : [])
    }
  }
}
