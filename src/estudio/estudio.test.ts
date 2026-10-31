import { describe, expect, it } from 'vitest'
import { elementoDe, elementos, type Clase } from '../catalogo/catalogo'
import { historiaDeOrden, historiaDeSimbolo, historiaDeTrozo } from '../catalogo/historias'
import { REGLA_DE_CLASE, REGLA_DE_CONFIGURACION } from '../catalogo/reglas'
import {
  abrir,
  acertarCadena,
  acertarOleada,
  correctaDe,
  DIA_1,
  estudiarElDia,
  fallar,
  montar,
  sigueLaMismaCadena,
} from './ayudantes'
import { almacenEnMemoria, type Estudio, type Oleada } from './estudio'

const GRUPO_18 = ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn']
const GRUPO_1 = ['H', 'Li', 'Na', 'K', 'Rb', 'Cs', 'Fr']
const GRUPO_2 = ['Be', 'Mg', 'Ca', 'Sr', 'Ba', 'Ra']
const GRUPO_17 = ['F', 'Cl', 'Br', 'I', 'At']

function otraClase(clase: Clase): Clase {
  return clase === 'metal' ? 'no-metal' : 'metal'
}

function hastaPresentar(estudio: Estudio, simbolo: string): Oleada {
  while (estudio.resumen().sinVer > 0) {
    const oleada = estudio.abrirOleada()
    if (oleada.presentacion?.includes(simbolo)) return estudio.descartarPresentacion(oleada)
    acertarOleada(estudio, oleada.presentacion ? estudio.descartarPresentacion(oleada) : oleada)
  }
  throw new Error(`${simbolo} no llega a presentarse`)
}

function hastaPreguntar(estudio: Estudio, simbolo: string): Oleada {
  let oleada = hastaPresentar(estudio, simbolo)
  while (oleada.pregunta!.elemento.simbolo !== simbolo) oleada = acertarCadena(estudio, oleada)
  return oleada
}

function hastaQueLlegue(estudio: Estudio, primero: string) {
  for (let oleadas = 0; oleadas < 20; oleadas++) {
    if (estudio.abrirOleada().presentacion?.[0] === primero) return
    acertarOleada(estudio, abrir(estudio))
  }
  throw new Error(`Ninguna Presentación empieza por ${primero}`)
}

function enLaOleada(oleada: Oleada): string[] {
  return [...(oleada.pregunta ? [oleada.pregunta.elemento.simbolo] : []), ...oleada.pendientes]
}

function pasosDeLaCadena(estudio: Estudio, oleada: Oleada): string[] {
  const simbolo = oleada.pregunta!.elemento.simbolo
  const pasos: string[] = []
  let actual = oleada
  do {
    pasos.push(actual.pregunta!.paso)
    actual = estudio.responder(actual, correctaDe(actual.pregunta!))
  } while (sigueLaMismaCadena(actual, simbolo))
  return pasos
}

describe('Camino', () => {
  it('el Camino desde el gas noble viene puesto', () => {
    expect(montar().estudio.camino()).toBe('gas-noble')
  })

  it('el Camino elegido se recuerda y cambiarlo no borra el Dominio', () => {
    const { estudio, almacen } = montar()
    acertarOleada(estudio, abrir(estudio))

    estudio.elegirCamino('uso')

    const otroDia = montar(() => 0, almacen).estudio
    expect(otroDia.camino()).toBe('uso')
    expect(Object.keys(otroDia.entradas()).sort()).toEqual([...GRUPO_18].sort())
  })

  it('por uso al formular, la primera Oleada presenta el H y el O', () => {
    const { estudio } = montar()
    estudio.elegirCamino('uso')

    expect(estudio.abrirOleada().presentacion).toEqual(['H', 'O'])
  })
})

describe('Presentación', () => {
  it('sin nada visto, la Oleada presenta el Grupo 18 entero y no pregunta nada', () => {
    const { estudio } = montar()

    const oleada = estudio.abrirOleada()

    expect(oleada.presentacion).toEqual(GRUPO_18)
    expect(oleada.pregunta).toBeNull()
    expect(estudio.entradas()).toEqual({})
  })

  it('descartarla deja sus Elementos Flojos y pendientes para hoy, y empieza a preguntar', () => {
    const { estudio } = montar()

    const oleada = estudio.descartarPresentacion(estudio.abrirOleada())

    expect(oleada.presentacion).toBeNull()
    expect(enLaOleada(oleada).sort()).toEqual([...GRUPO_18].sort())
    expect(estudio.entradas().He).toEqual({ estado: 'flojo', intervalo: 0, vuelve: DIA_1, fallos: 0, pasosFallados: [] })
    expect(Object.keys(estudio.entradas())).toHaveLength(6)
  })

  it('anuncia lo que trae la Oleada y cuánto dura', () => {
    expect(montar().estudio.anuncio()).toEqual({ repaso: 0, nuevos: 6, practica: 0, minutos: 3, quedan: 0 })
  })
})

describe('Cadena', () => {
  it('los pasos van siempre en el mismo orden: Posición, Clase, Configuración y Números de oxidación', () => {
    const { estudio } = montar()

    expect(pasosDeLaCadena(estudio, abrir(estudio))).toEqual(['posicion', 'clase', 'configuracion', 'numeros'])
  })

  it('la Cadena de un metal de transición no lleva Configuración', () => {
    const { estudio } = montar()

    expect(pasosDeLaCadena(estudio, hastaPreguntar(estudio, 'Cu'))).toEqual(['posicion', 'clase', 'numeros'])
  })

  it('el Elemento se da por su Símbolo o por su nombre, según el azar', () => {
    expect(abrir(montar(() => 0).estudio)!.pregunta!.dadoPor).toBe('simbolo')
    expect(abrir(montar(() => 0.9).estudio)!.pregunta!.dadoPor).toBe('nombre')
  })

  it('acertarla entera deja el Elemento Sabido, con Intervalo de 1 día', () => {
    const { estudio } = montar()
    const oleada = abrir(estudio)
    const { simbolo } = oleada.pregunta!.elemento

    const despues = acertarCadena(estudio, oleada)

    expect(estudio.entradas()[simbolo]).toEqual({
      estado: 'sabido',
      intervalo: 1,
      vuelve: '2026-10-06',
      fallos: 0,
      pasosFallados: [],
    })
    expect(despues.sabidos).toEqual([simbolo])
    expect(despues.rotulados).toEqual([simbolo])
  })

  it('un fallo abre la Corrección, y al cerrarla la Cadena sigue en el paso siguiente', () => {
    const { estudio } = montar()
    let oleada = abrir(estudio)
    const { elemento } = oleada.pregunta!
    oleada = estudio.responder(oleada, correctaDe(oleada.pregunta!))

    oleada = estudio.responder(oleada, { paso: 'clase', clase: otraClase(elemento.clase) })

    expect(oleada.correccion?.paso).toBe('clase')
    expect(oleada.pregunta!.paso).toBe('clase')
    expect(oleada.pregunta!.fallados).toEqual(['clase'])

    oleada = estudio.cerrarCorreccion(oleada)

    expect(oleada.correccion).toBeNull()
    expect(oleada.pregunta!.elemento).toBe(elemento)
    expect(oleada.pregunta!.paso).toBe('configuracion')
  })

  it('con la Corrección abierta no se puede responder', () => {
    const { estudio } = montar()
    let oleada = abrir(estudio)
    oleada = estudio.responder(oleada, { paso: 'posicion', simbolo: 'Fr' })

    expect(estudio.responder(oleada, correctaDe(oleada.pregunta!))).toBe(oleada)
  })

  it('una Cadena dejada a medias no se anota', () => {
    const { estudio, almacen } = montar()
    const oleada = abrir(estudio)
    const { simbolo } = oleada.pregunta!.elemento

    estudio.responder(oleada, correctaDe(oleada.pregunta!))

    const alVolver = montar(() => 0, almacen).estudio
    expect(alVolver.entradas()[simbolo]).toEqual({ estado: 'flojo', intervalo: 0, vuelve: DIA_1, fallos: 0, pasosFallados: [] })
  })
})

describe('Corrección', () => {
  it('la de Posición trae la Historia de orden del Grupo y la de Símbolo', () => {
    const { estudio } = montar()
    const oleada = hastaPreguntar(estudio, 'Na')
    const sodio = elementoDe('Na')

    const { correccion } = estudio.responder(oleada, { paso: 'posicion', simbolo: 'K' })

    expect(correccion).toMatchObject({ paso: 'posicion', historias: [historiaDeOrden(sodio), historiaDeSimbolo(sodio)] })
  })

  it('la de Clase trae la regla para deducirla de la Posición', () => {
    const { estudio } = montar()
    let oleada = abrir(estudio)
    const { elemento } = oleada.pregunta!
    oleada = estudio.responder(oleada, correctaDe(oleada.pregunta!))

    const { correccion } = estudio.responder(oleada, { paso: 'clase', clase: otraClase(elemento.clase) })

    expect(correccion).toMatchObject({ paso: 'clase', historias: [REGLA_DE_CLASE] })
  })

  it('la de Configuración trae la regla para deducirla de la Posición', () => {
    const { estudio } = montar()
    let oleada = abrir(estudio)
    oleada = estudio.responder(oleada, correctaDe(oleada.pregunta!))
    oleada = estudio.responder(oleada, correctaDe(oleada.pregunta!))

    const { correccion } = estudio.responder(oleada, { paso: 'configuracion', subnivel: { capa: 7, letra: 'd', electrones: 9 } })

    expect(correccion).toMatchObject({ paso: 'configuracion', historias: [REGLA_DE_CONFIGURACION] })
  })

  it('la de Números de oxidación dice cuáles faltaron y cuáles sobraron, con la Regla del Grupo', () => {
    const { estudio } = montar()
    let oleada = hastaPreguntar(estudio, 'Na')
    while (oleada.pregunta!.paso !== 'numeros') oleada = estudio.responder(oleada, correctaDe(oleada.pregunta!))

    const { correccion } = estudio.responder(oleada, { paso: 'numeros', numeros: [-1] })

    expect(correccion).toMatchObject({ paso: 'numeros', faltaron: [1], sobraron: [-1], excepcion: null, historias: [] })
    expect(correccion!.regla!.grupo).toBe(1)
  })

  it('avisa de la excepción cuando el Elemento se aparta de la Regla de su Grupo', () => {
    const { estudio } = montar()
    let oleada = hastaPreguntar(estudio, 'H')
    while (oleada.pregunta!.paso !== 'numeros') oleada = estudio.responder(oleada, correctaDe(oleada.pregunta!))

    const { correccion } = estudio.responder(oleada, { paso: 'numeros', numeros: [1] })

    expect(correccion).toMatchObject({ faltaron: [-1], sobraron: [] })
    expect(correccion!.excepcion).toContain('además −1')
  })

  it('a un metal no le cuenta como excepción perder el negativo de la Regla de su Grupo', () => {
    const { estudio } = montar()
    let oleada = hastaPreguntar(estudio, 'Sn')
    while (oleada.pregunta!.paso !== 'numeros') oleada = estudio.responder(oleada, correctaDe(oleada.pregunta!))

    const { correccion } = estudio.responder(oleada, { paso: 'numeros', numeros: [2] })

    expect(correccion).toMatchObject({ excepcion: null, pierdeElNegativo: true })
    expect(correccion!.regla!.numeros).toEqual([-4, 2, 4])
  })

  it('en un metal de transición trae la Historia de su trozo en vez de una Regla', () => {
    const { estudio } = montar()
    let oleada = hastaPreguntar(estudio, 'Cu')
    while (oleada.pregunta!.paso !== 'numeros') oleada = estudio.responder(oleada, correctaDe(oleada.pregunta!))

    const { correccion } = estudio.responder(oleada, { paso: 'numeros', numeros: [1] })

    expect(correccion).toMatchObject({ faltaron: [2], regla: null, historias: [historiaDeTrozo(elementoDe('Cu'))] })
  })
})

describe('Números de oxidación', () => {
  function hastaLosNumeros(estudio: Estudio, simbolo: string): Oleada {
    let oleada = hastaPreguntar(estudio, simbolo)
    while (oleada.pregunta!.paso !== 'numeros') oleada = estudio.responder(oleada, correctaDe(oleada.pregunta!))
    return oleada
  }

  it('solo es acierto el conjunto exacto de los verdaderos, en cualquier orden', () => {
    const { estudio } = montar()
    const oleada = hastaLosNumeros(estudio, 'Xe')

    expect(estudio.responder(oleada, { paso: 'numeros', numeros: [6, 4, 2, 0] }).correccion).toBeNull()
    expect(estudio.responder(oleada, { paso: 'numeros', numeros: [0, 2, 4] }).correccion).toMatchObject({ faltaron: [6] })
    expect(estudio.responder(oleada, { paso: 'numeros', numeros: [-2, 0, 2, 4, 6] }).correccion).toMatchObject({ sobraron: [-2] })
  })

  it('los Distractores prefieren el signo contrario y los números del Grupo contiguo', () => {
    const { estudio } = montar()

    expect(hastaLosNumeros(estudio, 'Na').pregunta!.opciones).toEqual([-1, 1, 2])
  })

  it.each([0, 0.3, 0.6, 0.9])('con el azar en %s, cada Elemento ofrece sus verdaderos y dos o tres Distractores, ordenados', (valor) => {
    const { estudio } = montar(() => valor)
    const vistos = new Set<string>()

    while (vistos.size < 58) {
      let oleada = abrir(estudio)
      while (oleada.pregunta) {
        const { elemento, opciones } = oleada.pregunta
        const distractores = opciones.filter((numero) => !elemento.numeros.includes(numero))
        expect(opciones.filter((numero) => elemento.numeros.includes(numero)), elemento.simbolo).toEqual(elemento.numeros)
        expect(distractores.length, elemento.simbolo).toBe(valor < 0.5 ? 2 : 3)
        expect(opciones, elemento.simbolo).toEqual([...new Set(opciones)].sort((a, b) => a - b))
        expect(opciones.every((numero) => numero >= -4 && numero <= 7), elemento.simbolo).toBe(true)
        expect(distractores, `${elemento.simbolo}: el 0 no es un Distractor`).not.toContain(0)
        if (elemento.clase === 'metal') {
          expect(distractores.some((numero) => numero > 0), `${elemento.simbolo}: un metal recibe algún Distractor positivo`).toBe(true)
        }
        vistos.add(elemento.simbolo)
        oleada = acertarCadena(estudio, oleada)
      }
    }

    expect(vistos.size).toBe(58)
  })
})

describe('Fallo en la Cadena', () => {
  it.each([
    ['la Posición', 'posicion'],
    ['los Números de oxidación', 'numeros'],
  ] as const)('fallar %s deja el Elemento Flojo para mañana, con el paso fallado y un fallo más', (_, paso) => {
    const { estudio } = montar()
    const oleada = abrir(estudio)
    const { simbolo } = oleada.pregunta!.elemento

    const despues = fallar(estudio, oleada, [paso])

    expect(estudio.entradas()[simbolo]).toEqual({
      estado: 'flojo',
      intervalo: 0,
      vuelve: '2026-10-06',
      fallos: 1,
      pasosFallados: [paso],
    })
    expect(despues.vuelven).toEqual([simbolo])
    expect(enLaOleada(despues)).toContain(simbolo)
  })

  it('fallar solo la Clase deja el Elemento Sabido con Intervalo de 1 día, con el paso fallado, y no vuelve en la Oleada', () => {
    const { estudio } = montar()
    const oleada = abrir(estudio)
    const { simbolo } = oleada.pregunta!.elemento

    const despues = fallar(estudio, oleada, ['clase'])

    expect(estudio.entradas()[simbolo]).toEqual({
      estado: 'sabido',
      intervalo: 1,
      vuelve: '2026-10-06',
      fallos: 0,
      pasosFallados: ['clase'],
    })
    expect(despues.sabidos).toEqual([simbolo])
    expect(despues.vuelven).toEqual([])
    expect(enLaOleada(despues)).not.toContain(simbolo)
  })

  it('fallar solo la Configuración trae su Corrección, pero no deja rastro en el Dominio ni vuelve en la Oleada', () => {
    const { estudio } = montar()
    const oleada = abrir(estudio)
    const { simbolo } = oleada.pregunta!.elemento

    const despues = fallar(estudio, oleada, ['configuracion'])

    expect(estudio.entradas()[simbolo]).toEqual({
      estado: 'sabido',
      intervalo: 1,
      vuelve: '2026-10-06',
      fallos: 0,
      pasosFallados: [],
    })
    expect(despues.sabidos).toEqual([simbolo])
    expect(despues.vuelven).toEqual([])
    expect(enLaOleada(despues)).not.toContain(simbolo)
  })

  it('un Elemento Flojo que al día siguiente falla solo la Clase queda Sabido con Intervalo de 1 día', () => {
    const { estudio, reloj } = montar()
    const primera = abrir(estudio)
    const { simbolo } = primera.pregunta!.elemento
    fallar(estudio, primera, ['posicion'])
    reloj.dia = '2026-10-06'
    let oleada = abrir(estudio)
    while (oleada.pregunta!.elemento.simbolo !== simbolo) oleada = acertarCadena(estudio, oleada)

    fallar(estudio, oleada, ['clase'])

    expect(estudio.entradas()[simbolo]).toEqual({
      estado: 'sabido',
      intervalo: 1,
      vuelve: '2026-10-07',
      fallos: 1,
      pasosFallados: ['clase'],
    })
  })

  it.each([
    ['la Clase', 'sabido', 'clase'],
    ['los Números de oxidación', 'flojo', 'numeros'],
  ] as const)('en un metal de transición, sin paso de Configuración, fallar %s lo deja %s', (_, estado, paso) => {
    const { estudio } = montar()

    fallar(estudio, hastaPreguntar(estudio, 'Cu'), [paso])

    expect(estudio.entradas().Cu).toMatchObject({ estado, pasosFallados: [paso] })
  })

  it('el Elemento vuelve una vez en la misma Oleada, tres Elementos después', () => {
    const { estudio } = montar()
    let oleada = abrir(estudio)
    const { simbolo } = oleada.pregunta!.elemento
    oleada = fallar(estudio, oleada, ['posicion'])

    const siguientes: string[] = []
    while (oleada.pregunta!.elemento.simbolo !== simbolo) {
      siguientes.push(oleada.pregunta!.elemento.simbolo)
      oleada = acertarCadena(estudio, oleada)
    }

    expect(siguientes).toHaveLength(3)
  })

  it('acertarlo al volver no lo saca de Flojo', () => {
    const { estudio } = montar()
    let oleada = abrir(estudio)
    const { simbolo } = oleada.pregunta!.elemento
    oleada = fallar(estudio, oleada, ['posicion'])

    oleada = acertarOleada(estudio, oleada)

    expect(estudio.entradas()[simbolo]).toMatchObject({ estado: 'flojo', fallos: 1, vuelve: '2026-10-06' })
    expect(oleada.vuelven).toEqual([simbolo])
    expect(oleada.sabidos).toHaveLength(5)
  })

  it('fallarlo otra vez al volver no lo trae una tercera vez ni suma otro fallo', () => {
    const { estudio } = montar()
    let oleada = abrir(estudio)
    const { simbolo } = oleada.pregunta!.elemento
    oleada = fallar(estudio, oleada, ['posicion'])
    while (oleada.pregunta!.elemento.simbolo !== simbolo) oleada = acertarCadena(estudio, oleada)

    oleada = fallar(estudio, oleada, ['posicion'])

    expect(enLaOleada(oleada)).not.toContain(simbolo)
    expect(estudio.entradas()[simbolo].fallos).toBe(1)
    expect(oleada.vuelven).toEqual([simbolo])
  })

  it('si quedan menos de tres Elementos, vuelve al final', () => {
    const { estudio } = montar()
    let oleada = abrir(estudio)
    for (let i = 0; i < 4; i++) oleada = acertarCadena(estudio, oleada)
    const { simbolo } = oleada.pregunta!.elemento

    oleada = fallar(estudio, oleada, ['posicion'])

    expect(oleada.pendientes).toEqual([simbolo])
  })
})

describe('Oleada', () => {
  it('un trozo entra entero: del Grupo 1 entran los siete', () => {
    const { estudio } = montar()
    acertarOleada(estudio, abrir(estudio))

    const oleada = estudio.abrirOleada()

    expect(oleada.presentacion).toEqual(GRUPO_1)
    expect(enLaOleada(estudio.descartarPresentacion(oleada))).toEqual(expect.arrayContaining(GRUPO_1))
  })

  it('con repaso de sobra, el trozo nuevo entra entero y el repaso ocupa lo que sobra', () => {
    const { estudio, reloj } = montar()
    acertarOleada(estudio, abrir(estudio))
    reloj.dia = '2026-10-06'

    expect(estudio.anuncio()).toEqual({ repaso: 3, nuevos: 7, practica: 0, minutos: 5, quedan: 3 })
    const oleada = estudio.abrirOleada()
    expect(oleada.presentacion).toEqual(GRUPO_1)

    const preguntados = enLaOleada(estudio.descartarPresentacion(oleada))
    expect(preguntados).toHaveLength(10)
    expect(preguntados).toEqual(expect.arrayContaining(GRUPO_1))
  })

  it('no presenta un trozo nuevo mientras quede algún Elemento presentado sin preguntar', () => {
    const { estudio, almacen } = montar()
    acertarCadena(estudio, abrir(estudio))

    const alVolver = montar(() => 0, almacen).estudio

    expect(alVolver.anuncio()).toEqual({ repaso: 0, nuevos: 5, practica: 1, minutos: 3, quedan: 0 })
    const oleada = alVolver.abrirOleada()
    expect(oleada.presentacion).toBeNull()
    expect(enLaOleada(oleada)).toHaveLength(6)

    acertarOleada(alVolver, oleada)
    expect(alVolver.abrirOleada().presentacion).toEqual(GRUPO_1)
  })

  it('un Elemento Flojo por haberlo fallado no frena el trozo siguiente', () => {
    const { estudio } = montar()
    const oleada = abrir(estudio)

    acertarOleada(estudio, fallar(estudio, oleada, ['posicion']))

    expect(estudio.abrirOleada().presentacion).toEqual(GRUPO_1)
  })

  it('con la serie en el 0 %, trae el trozo nuevo y ningún repaso aunque haya por repasar', () => {
    const { estudio, reloj } = montar()
    acertarOleada(estudio, abrir(estudio))
    acertarOleada(estudio, abrir(estudio))
    acertarOleada(estudio, abrir(estudio))
    reloj.dia = '2026-10-06'

    expect(estudio.anuncio()).toEqual({ repaso: 0, nuevos: 5, practica: 0, minutos: 3, quedan: 19 })
    const oleada = estudio.abrirOleada()
    expect(oleada.presentacion).toEqual(GRUPO_17)

    const preguntados = enLaOleada(estudio.descartarPresentacion(oleada))
    expect(preguntados).toHaveLength(5)
    expect(preguntados).toEqual(expect.arrayContaining(GRUPO_17))
  })

  it('los presentados que esperan entran antes que un trozo nuevo, y no se presenta otro mientras quede alguno', () => {
    const { estudio, reloj } = montar()
    acertarOleada(estudio, abrir(estudio))
    reloj.dia = '2026-10-06'
    acertarCadena(estudio, acertarCadena(estudio, abrir(estudio)))
    const esperan = GRUPO_1.filter((simbolo) => estudio.entradas()[simbolo].intervalo === 0)

    expect(estudio.anuncio().nuevos).toBe(esperan.length)
    const oleada = estudio.abrirOleada()
    expect(oleada.presentacion).toBeNull()
    expect(enLaOleada(oleada)).toEqual(expect.arrayContaining(esperan))

    acertarOleada(estudio, oleada)
    expect(estudio.abrirOleada().presentacion).toEqual(GRUPO_2)
  })

  it('con los últimos nuevos, el repaso ocupa lo que sobra', () => {
    const { estudio, reloj } = montar()
    hastaPresentar(estudio, 'Sc')
    reloj.dia = '2026-10-06'

    expect(estudio.anuncio()).toEqual({ repaso: 2, nuevos: 3, practica: 0, minutos: 3, quedan: 53 })
    expect(enLaOleada(estudio.abrirOleada())).toContain('Sc')
  })

  it('sin nada nuevo, la Oleada es toda de repaso', () => {
    const { estudio, reloj } = montar()
    estudiarElDia(estudio)
    reloj.dia = '2026-10-06'

    expect(estudio.anuncio()).toEqual({ repaso: 8, nuevos: 0, practica: 0, minutos: 4, quedan: 50 })
    const oleada = estudio.abrirOleada()
    expect(oleada.presentacion).toBeNull()
    expect(enLaOleada(oleada)).toHaveLength(8)
  })

  it('el anuncio cuenta los nuevos y el repaso de la Oleada, y lo que queda por repasar hoy después de ella', () => {
    const { estudio, reloj } = montar()
    acertarOleada(estudio, abrir(estudio))
    acertarOleada(estudio, abrir(estudio))
    reloj.dia = '2026-10-06'

    expect(estudio.anuncio()).toEqual({ repaso: 4, nuevos: 6, practica: 0, minutos: 5, quedan: 9 })

    acertarOleada(estudio, abrir(estudio))
    expect(estudio.anuncio()).toEqual({ repaso: 0, nuevos: 5, practica: 0, minutos: 3, quedan: 9 })
  })

  it('con 5 Flojos y Sabidos de sobra por repasar, trae 3 Flojos y 5 Sabidos', () => {
    const { estudio, reloj } = montar()
    estudiarElDia(estudio, ['He', 'Li', 'Be', 'F', 'O'])
    reloj.dia = '2026-10-06'

    expect(estadosDe(estudio, estudio.abrirOleada())).toEqual({ flojo: 3, sabido: 5 })
  })

  it('con menos de 3 Flojos entran todos y el resto son Sabidos', () => {
    const { estudio, reloj } = montar()
    estudiarElDia(estudio, ['He', 'Li'])
    reloj.dia = '2026-10-06'

    const oleada = estudio.abrirOleada()

    expect(enLaOleada(oleada)).toEqual(expect.arrayContaining(['He', 'Li']))
    expect(estadosDe(estudio, oleada)).toEqual({ flojo: 2, sabido: 6 })
  })

  it('sin Sabidos bastantes, la Oleada se llena con más Flojos', () => {
    const { estudio, reloj } = montar()
    estudiarElDia(estudio, elementos().map(({ simbolo }) => simbolo).filter((simbolo) => !['He', 'Ne'].includes(simbolo)))
    reloj.dia = '2026-10-06'

    const oleada = estudio.abrirOleada()

    expect(enLaOleada(oleada)).toEqual(expect.arrayContaining(['He', 'Ne']))
    expect(estadosDe(estudio, oleada)).toEqual({ flojo: 6, sabido: 2 })
  })

  it('con más de 3 Flojos por repasar, no entran siempre los mismos', () => {
    let semilla = 1
    const { estudio, reloj } = montar(() => (semilla = (semilla * 9301 + 49297) % 233280) / 233280)
    estudiarElDia(estudio, ['He', 'Li', 'Be', 'F', 'O'])
    reloj.dia = '2026-10-06'

    const elegidos = Array.from({ length: 10 }, () =>
      enLaOleada(estudio.abrirOleada())
        .filter((simbolo) => estudio.entradas()[simbolo].estado === 'flojo')
        .sort()
        .join(),
    )

    expect(new Set(elegidos).size).toBeGreaterThan(1)
  })

  it('entre los Sabidos va primero el que más lleva esperando', () => {
    const { estudio, reloj } = montar()
    acertarOleada(estudio, abrir(estudio))
    acertarOleada(estudio, abrir(estudio))
    reloj.dia = '2026-10-06'
    const repasados = enLaOleada(acertarOleadaYDevolverla(estudio))
    const sinRepasar = [...GRUPO_18, ...GRUPO_1].filter((simbolo) => !repasados.includes(simbolo))
    reloj.dia = '2026-10-09'
    acertarOleada(estudio, abrir(estudio))

    const preguntados = enLaOleada(estudio.descartarPresentacion(estudio.abrirOleada()))

    expect(sinRepasar).toHaveLength(9)
    expect(preguntados.filter((simbolo) => sinRepasar.includes(simbolo))).toHaveLength(1)
  })

  it('al terminar no queda pregunta, y dice cuáles quedan Sabidos y cuáles vuelven', () => {
    const { estudio } = montar()
    let oleada = abrir(estudio)
    const fallado = oleada.pregunta!.elemento.simbolo

    oleada = acertarOleada(estudio, fallar(estudio, oleada, ['posicion']))

    expect(oleada.pregunta).toBeNull()
    expect(oleada.pendientes).toEqual([])
    expect(oleada.vuelven).toEqual([fallado])
    expect([...oleada.sabidos].sort()).toEqual(GRUPO_18.filter((simbolo) => simbolo !== fallado).sort())
  })

  it('dice en cuántos días vuelve cada Elemento de la Oleada, del día más cercano al más lejano', () => {
    const { estudio, reloj } = montar()
    acertarOleada(estudio, abrir(estudio))
    reloj.dia = '2026-10-06'
    let oleada = abrir(estudio)
    while (oleada.pregunta!.elemento.simbolo !== 'Li') oleada = acertarCadena(estudio, oleada)

    oleada = acertarOleada(estudio, fallar(estudio, oleada, ['posicion']))

    expect(estudio.vueltas(oleada).map(({ dias, simbolos }) => [dias, [...simbolos].sort()])).toEqual([
      [1, [...GRUPO_1].sort()],
      [3, ['Ar', 'He', 'Ne']],
    ])
  })

  it('sin nada que toque ni nada por ver, dice el día en que vuelve a tocar', () => {
    const { estudio } = montar()

    estudiarElDia(estudio)

    expect(estudio.proximaVuelta()).toBe('2026-10-06')
    expect(estudio.resumen()).toEqual({ sabidos: 58, flojos: 0, sinVer: 0, total: 58 })
  })

  function estadosDe(estudio: Estudio, oleada: Oleada) {
    const estados = enLaOleada(oleada).map((simbolo) => estudio.entradas()[simbolo].estado)
    return { flojo: estados.filter((estado) => estado === 'flojo').length, sabido: estados.filter((estado) => estado === 'sabido').length }
  }

  function acertarOleadaYDevolverla(estudio: Estudio): Oleada {
    const oleada = abrir(estudio)
    acertarOleada(estudio, oleada)
    return oleada
  }
})

describe('Práctica', () => {
  it('con todo visto y nada que toque hoy, se puede abrir una Oleada de 8 Elementos', () => {
    const { estudio } = montar()
    estudiarElDia(estudio)

    expect(estudio.anuncio()).toEqual({ repaso: 0, nuevos: 0, practica: 8, minutos: 4, quedan: 0 })
    expect(enLaOleada(estudio.abrirOleada())).toHaveLength(8)
  })

  it('lo nuevo y lo que toca hoy entran antes, y la Práctica llena lo que sobra', () => {
    const { estudio, reloj } = montar()
    acertarOleada(estudio, abrir(estudio))
    reloj.dia = '2026-10-06'
    acertarOleada(estudio, abrir(estudio))

    expect(estudio.anuncio()).toEqual({ repaso: 3, nuevos: 6, practica: 1, minutos: 5, quedan: 0 })
  })

  it('con más de 3 Flojos que tocan y Sabidos solo de Práctica, la Oleada no pasa de 3 Flojos', () => {
    const fallados = ['He', 'Li', 'Be', 'F', 'O']
    const { estudio, reloj } = montar()
    estudiarElDia(estudio, fallados)
    reloj.dia = '2026-10-06'
    estudiarElDia(estudio, fallados)
    reloj.dia = '2026-10-07'

    expect(estudio.anuncio()).toEqual({ repaso: 3, nuevos: 0, practica: 5, minutos: 4, quedan: 2 })
  })

  it('un Flojo fallado hoy vuelve en otra Oleada del mismo día, y acertarlo lo deja Sabido con Intervalo de 1 día', () => {
    const { estudio } = montar()
    let oleada = abrir(estudio)
    while (oleada.pregunta!.elemento.simbolo !== 'He') oleada = acertarCadena(estudio, oleada)
    acertarOleada(estudio, fallar(estudio, oleada, ['numeros']))

    oleada = abrir(estudio)
    expect(enLaOleada(oleada)).toContain('He')
    while (oleada.pregunta!.elemento.simbolo !== 'He') oleada = acertarCadena(estudio, oleada)
    acertarCadena(estudio, oleada)

    expect(estudio.entradas().He).toEqual({ estado: 'sabido', intervalo: 1, vuelve: '2026-10-06', fallos: 1, pasosFallados: [] })
  })

  it('acertar un Sabido que aún no tocaba no cambia su Intervalo ni el día en que vuelve', () => {
    const { estudio } = montar()
    estudiarElDia(estudio)
    const oleada = abrir(estudio)
    const { simbolo } = oleada.pregunta!.elemento

    acertarCadena(estudio, oleada)

    expect(estudio.entradas()[simbolo]).toEqual({ estado: 'sabido', intervalo: 1, vuelve: '2026-10-06', fallos: 0, pasosFallados: [] })
  })

  it('fallar solo la Clase a un Sabido que aún no tocaba anota el paso sin mover su día', () => {
    const { estudio } = montar()
    estudiarElDia(estudio)
    const oleada = abrir(estudio)
    const { simbolo } = oleada.pregunta!.elemento

    fallar(estudio, oleada, ['clase'])

    expect(estudio.entradas()[simbolo]).toEqual({ estado: 'sabido', intervalo: 1, vuelve: '2026-10-06', fallos: 0, pasosFallados: ['clase'] })
  })

  it('fallar los Números de oxidación a un Sabido que aún no tocaba lo deja Flojo', () => {
    const { estudio } = montar()
    estudiarElDia(estudio)
    const oleada = abrir(estudio)
    const { simbolo } = oleada.pregunta!.elemento

    fallar(estudio, oleada, ['numeros'])

    expect(estudio.entradas()[simbolo]).toMatchObject({ estado: 'flojo', intervalo: 0, vuelve: '2026-10-06', fallos: 1 })
  })
})

describe('Intervalos', () => {
  it('un Elemento Sabido vuelve a los 1, 3, 7, 14 y 30 días, y desde ahí cada 30', () => {
    const { estudio, reloj } = montar()
    const vueltas: [number, string][] = []

    for (let i = 0; i < 6; i++) {
      estudiarElDia(estudio)
      const { intervalo, vuelve } = estudio.entradas().He
      vueltas.push([intervalo, vuelve])
      reloj.dia = vuelve
    }

    expect(vueltas).toEqual([
      [1, '2026-10-06'],
      [3, '2026-10-09'],
      [7, '2026-10-16'],
      [14, '2026-10-30'],
      [30, '2026-11-29'],
      [30, '2026-12-29'],
    ])
  })

  it('antes de que se cumpla su Intervalo, un Elemento solo entra como Práctica', () => {
    const { estudio, reloj } = montar()
    estudiarElDia(estudio)
    reloj.dia = '2026-10-06'
    estudiarElDia(estudio)

    reloj.dia = '2026-10-08'

    expect(estudio.anuncio()).toEqual({ repaso: 0, nuevos: 0, practica: 8, minutos: 4, quedan: 0 })
    expect(estudio.proximaVuelta()).toBe('2026-10-09')
  })

  it('fallar solo la Clase deja el Intervalo que tenía', () => {
    const { estudio, reloj } = montar()
    estudiarElDia(estudio)
    reloj.dia = '2026-10-06'
    estudiarElDia(estudio)
    reloj.dia = '2026-10-09'
    const oleada = abrir(estudio)
    const { simbolo } = oleada.pregunta!.elemento
    expect(estudio.entradas()[simbolo].intervalo).toBe(3)

    fallar(estudio, oleada, ['clase'])

    expect(estudio.entradas()[simbolo]).toMatchObject({ estado: 'sabido', intervalo: 3, vuelve: '2026-10-12' })
  })

  it('fallar solo la Configuración deja crecer el Intervalo', () => {
    const { estudio, reloj } = montar()
    estudiarElDia(estudio)
    reloj.dia = '2026-10-06'
    estudiarElDia(estudio)
    reloj.dia = '2026-10-09'
    const oleada = abrir(estudio)
    const { simbolo } = oleada.pregunta!.elemento
    expect(estudio.entradas()[simbolo].intervalo).toBe(3)

    fallar(estudio, oleada, ['configuracion'])

    expect(estudio.entradas()[simbolo]).toMatchObject({ estado: 'sabido', intervalo: 7, vuelve: '2026-10-16' })
  })

  it('un fallo en la Posición devuelve el Elemento al día siguiente y su Intervalo empieza de nuevo', () => {
    const { estudio, reloj } = montar()
    estudiarElDia(estudio)
    reloj.dia = '2026-10-06'
    estudiarElDia(estudio)
    reloj.dia = '2026-10-09'
    let oleada = abrir(estudio)
    const { simbolo } = oleada.pregunta!.elemento
    expect(estudio.entradas()[simbolo].intervalo).toBe(3)

    oleada = fallar(estudio, oleada, ['posicion'])

    expect(estudio.entradas()[simbolo]).toMatchObject({ estado: 'flojo', intervalo: 0, vuelve: '2026-10-10' })

    acertarOleada(estudio, oleada)
    reloj.dia = '2026-10-10'
    estudiarElDia(estudio)

    expect(estudio.entradas()[simbolo]).toMatchObject({ estado: 'sabido', intervalo: 1, vuelve: '2026-10-11' })
  })
})

describe('Reparto de una Oleada', () => {
  it('el repaso sigue la serie 20, 30, 40 y 0 % en Oleadas sucesivas, y vuelve a empezar', () => {
    const { estudio, reloj } = montar()
    const reparto: [number, number][] = []
    for (let dia = 5; dia <= 13; dia++) {
      reloj.dia = `2026-10-${String(dia).padStart(2, '0')}`
      const { nuevos, repaso, practica } = estudio.anuncio()
      reparto.push([nuevos, repaso + practica])
      acertarOleada(estudio, abrir(estudio))
    }

    expect(reparto).toEqual([
      [6, 0],
      [7, 3],
      [6, 4],
      [5, 0],
      [5, 1],
      [5, 2],
      [5, 3],
      [5, 0],
      [6, 2],
    ])
  })

  it('un trozo pequeño trae también el siguiente', () => {
    const { estudio } = montar()
    hastaQueLlegue(estudio, 'Cu')

    expect(estudio.abrirOleada().presentacion).toEqual(['Cu', 'Ag', 'Au', 'Zn', 'Cd', 'Hg'])
  })

  it('sin nada nuevo, la Oleada entera es repaso aunque la serie toque 0 %', () => {
    const { estudio, reloj } = montar()
    estudiarElDia(estudio)
    reloj.dia = '2026-10-06'

    expect(estudio.anuncio()).toMatchObject({ repaso: 8, nuevos: 0 })
  })

  it('con muy pocos nuevos, una Oleada con repaso en la serie lleva al menos uno', () => {
    const entrada = { estado: 'sabido', intervalo: 3, vuelve: DIA_1, fallos: 0, pasosFallados: [] }
    const almacen = almacenEnMemoria()
    const vistos = elementos().filter((elemento) => elemento.simbolo !== 'Sc')
    almacen.setItem(
      'formulalo:dominio',
      JSON.stringify({ version: 1, camino: 'gas-noble', elementos: Object.fromEntries(vistos.map((elemento) => [elemento.simbolo, entrada])) }),
    )

    expect(montar(() => 0, almacen).estudio.anuncio()).toMatchObject({ nuevos: 1, repaso: 1 })
  })

  it('la primera Oleada, sin nada visto, trae solo su trozo aunque sea pequeño', () => {
    const { estudio } = montar()
    estudio.elegirCamino('uso')

    expect(estudio.abrirOleada().presentacion).toEqual(['H', 'O'])
  })

  it('una Oleada abandonada no avanza la serie', () => {
    const { estudio } = montar()
    acertarOleada(estudio, abrir(estudio))
    const antes = estudio.anuncio()

    abrir(estudio)

    expect(estudio.anuncio()).toEqual(antes)
  })

  it('siempre se puede pedir otra: cada Oleada avanza hasta acabar el Camino', () => {
    const { estudio } = montar()

    while (estudio.resumen().sinVer > 0) acertarOleada(estudio, abrir(estudio))

    expect(estudio.resumen().sinVer).toBe(0)
  })
})

describe('Saltar la Configuración', () => {
  function hastaLaConfiguracion(estudio: Estudio): Oleada {
    let oleada = abrir(estudio)
    while (oleada.pregunta!.paso !== 'configuracion') oleada = estudio.responder(oleada, correctaDe(oleada.pregunta!))
    return oleada
  }

  it('lleva a los Números de oxidación sin Corrección y deja el paso marcado como saltado', () => {
    const { estudio } = montar()

    const despues = estudio.saltarConfiguracion(hastaLaConfiguracion(estudio))

    expect(despues.correccion).toBeNull()
    expect(despues.pregunta).toMatchObject({ paso: 'numeros', saltados: ['configuracion'], fallados: [] })
  })

  it('deja el Elemento igual que acertarla, también para el Intervalo', () => {
    const { estudio, reloj } = montar()
    estudiarElDia(estudio)
    reloj.dia = '2026-10-06'
    estudiarElDia(estudio)
    reloj.dia = '2026-10-09'
    let oleada = hastaLaConfiguracion(estudio)
    const { simbolo } = oleada.pregunta!.elemento
    expect(estudio.entradas()[simbolo].intervalo).toBe(3)

    oleada = estudio.saltarConfiguracion(oleada)
    estudio.responder(oleada, correctaDe(oleada.pregunta!))

    expect(estudio.entradas()[simbolo]).toEqual({
      estado: 'sabido',
      intervalo: 7,
      vuelve: '2026-10-16',
      fallos: 0,
      pasosFallados: [],
    })
  })

  it('no perdona un fallo en los Números de oxidación', () => {
    const { estudio } = montar()
    let oleada = hastaLaConfiguracion(estudio)
    const { simbolo } = oleada.pregunta!.elemento

    oleada = estudio.saltarConfiguracion(oleada)
    estudio.cerrarCorreccion(estudio.responder(oleada, { paso: 'numeros', numeros: [] }))

    expect(estudio.entradas()[simbolo]).toMatchObject({ estado: 'flojo', pasosFallados: ['numeros'] })
  })

  it('no salta ningún otro paso', () => {
    const { estudio } = montar()
    const enLaPosicion = abrir(estudio)

    expect(estudio.saltarConfiguracion(enLaPosicion)).toBe(enLaPosicion)
  })

  it('no salta con la Corrección abierta', () => {
    const { estudio } = montar()
    const conCorreccion = estudio.responder(hastaLaConfiguracion(estudio), {
      paso: 'configuracion',
      subnivel: { capa: 7, letra: 'd', electrones: 9 },
    })

    expect(conCorreccion.correccion).not.toBeNull()
    expect(estudio.saltarConfiguracion(conCorreccion)).toBe(conCorreccion)
  })
})

describe('Dominio', () => {
  it('cuenta los Elementos Sabidos, Flojos y sin ver', () => {
    const { estudio } = montar()
    const oleada = abrir(estudio)

    acertarCadena(estudio, oleada)

    expect(estudio.resumen()).toEqual({ sabidos: 1, flojos: 5, sinVer: 52, total: 58 })
  })

  it('lo estudiado sigue ahí al volver a abrir la aplicación', () => {
    const { estudio, almacen } = montar()
    acertarOleada(estudio, abrir(estudio))

    expect(montar(() => 0, almacen).estudio.entradas()).toEqual(estudio.entradas())
  })

  it.each(['{no es json', '{"version":99,"camino":"uso","elementos":{}}', '[]'])(
    'un dato guardado que no se puede leer se descarta: %s',
    (guardado) => {
      const almacen = almacenEnMemoria()
      almacen.setItem('formulalo:dominio', guardado)

      const { estudio } = montar(() => 0, almacen)

      expect(estudio.entradas()).toEqual({})
      expect(estudio.camino()).toBe('gas-noble')
    },
  )

  it('una entrada guardada que no es de un Elemento estudiado, o está mal formada, se descarta sola', () => {
    const almacen = almacenEnMemoria()
    const buena = { estado: 'sabido', intervalo: 3, vuelve: '2026-10-09', fallos: 0, pasosFallados: [] }
    almacen.setItem(
      'formulalo:dominio',
      JSON.stringify({ version: 1, camino: 'uso', elementos: { He: buena, Ti: buena, Ne: { ...buena, vuelve: 'mañana' } } }),
    )

    const { estudio } = montar(() => 0, almacen)

    expect(estudio.entradas()).toEqual({ He: buena })
    expect(estudio.camino()).toBe('uso')
  })
})

describe('Copia del Dominio', () => {
  const ENTRADA = { estado: 'sabido', intervalo: 3, vuelve: '2026-10-09', fallos: 0, pasosFallados: [] }

  function conAlgoEstudiado(): Estudio {
    const { estudio } = montar()
    estudio.elegirCamino('uso')
    acertarOleada(estudio, fallar(estudio, abrir(estudio), ['clase']))
    return estudio
  }

  it('es el registro del Dominio: versión, Camino y Elementos', () => {
    const estudio = conAlgoEstudiado()

    expect(JSON.parse(estudio.copia())).toMatchObject({ version: 1, camino: 'uso', modo: 'normal', elementos: estudio.entradas() })
  })

  it('recuperarla en otro navegador deja el Dominio igual que cuando se guardó, Camino incluido', () => {
    const estudio = conAlgoEstudiado()
    const copia = estudio.copia()
    const { estudio: otro } = montar()

    expect(otro.esCopia(copia)).toBe(true)
    expect(otro.recuperar(copia)).toBe(true)

    expect(otro.entradas()).toEqual(estudio.entradas())
    expect(otro.camino()).toBe('uso')
    expect(otro.copia()).toBe(copia)
  })

  it('recuperarla sustituye el Dominio que había, sin mezclarlo', () => {
    const copia = conAlgoEstudiado().copia()
    const { estudio } = montar()
    acertarOleada(estudio, abrir(estudio))

    estudio.recuperar(copia)

    expect(Object.keys(estudio.entradas()).sort()).toEqual(['H', 'O'])
  })

  it.each([
    ['no es JSON', '{no es json'],
    ['está vacío', ''],
    ['no es un registro', '[]'],
    ['es de otra versión', JSON.stringify({ version: 2, camino: 'uso', elementos: {} })],
    ['no trae Camino', JSON.stringify({ version: 1, elementos: {} })],
    ['trae un Camino que no existe', JSON.stringify({ version: 1, camino: 'alfabetico', elementos: {} })],
    ['no trae Elementos', JSON.stringify({ version: 1, camino: 'uso' })],
    ['trae un Elemento que no se estudia', JSON.stringify({ version: 1, camino: 'uso', elementos: { He: ENTRADA, Ti: ENTRADA } })],
    [
      'trae una entrada mal formada',
      JSON.stringify({ version: 1, camino: 'uso', elementos: { He: ENTRADA, Ne: { ...ENTRADA, vuelve: 'mañana' } } }),
    ],
  ])('un archivo que %s se rechaza entero y el Dominio queda como estaba', (_, archivo) => {
    const estudio = conAlgoEstudiado()
    const antes = estudio.copia()

    expect(estudio.esCopia(archivo)).toBe(false)
    expect(estudio.recuperar(archivo)).toBe(false)

    expect(estudio.copia()).toBe(antes)
  })
})
