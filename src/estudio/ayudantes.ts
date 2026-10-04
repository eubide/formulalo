import { ultimoSubnivel } from '../catalogo/catalogo'
import {
  almacenEnMemoria,
  crearEstudio,
  type Almacen,
  type Estudio,
  type Paso,
  type Pregunta,
  type Respuesta,
  type Tanda,
} from './estudio'

export const DIA_1 = '2026-10-05'

export function montar(azar = () => 0, almacen: Almacen = almacenEnMemoria()) {
  const reloj = { dia: DIA_1 }
  return { estudio: crearEstudio(almacen, () => reloj.dia, azar), reloj, almacen }
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

export function sigueLaMismaCadena(tanda: Tanda, simbolo: string): boolean {
  return tanda.pregunta?.elemento.simbolo === simbolo && tanda.pregunta.paso !== 'posicion'
}

export function acertarCadena(estudio: Estudio, tanda: Tanda): Tanda {
  return fallar(estudio, tanda, [])
}

export function fallar(estudio: Estudio, tanda: Tanda, pasos: Paso[]): Tanda {
  const simbolo = tanda.pregunta!.elemento.simbolo
  let actual = tanda
  do {
    const pregunta = actual.pregunta!
    actual = pasos.includes(pregunta.paso)
      ? estudio.cerrarCorreccion(estudio.responder(actual, equivocadaDe(pregunta)))
      : estudio.responder(actual, correctaDe(pregunta))
  } while (sigueLaMismaCadena(actual, simbolo))
  return actual
}

export function abrir(estudio: Estudio): Tanda | null {
  const tanda = estudio.abrirTanda()
  return tanda?.presentacion ? estudio.descartarPresentacion(tanda) : tanda
}

export function acertarTanda(estudio: Estudio, tanda: Tanda): Tanda {
  let actual = tanda
  while (actual.pregunta) actual = acertarCadena(estudio, actual)
  return actual
}

export function estudiarElDia(estudio: Estudio, fallados: string[] = []) {
  for (let tanda = abrir(estudio); tanda; tanda = abrir(estudio)) {
    while (tanda.pregunta) {
      const { simbolo } = tanda.pregunta.elemento
      const falla = fallados.includes(simbolo) && !tanda.vuelven.includes(simbolo)
      tanda = fallar(estudio, tanda, falla ? ['numeros'] : [])
    }
  }
}
