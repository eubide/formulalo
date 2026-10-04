import { describe, expect, it } from 'vitest'
import { elementoDe, elementos, ultimoSubnivel, type Clase } from '../catalogo/catalogo'
import { historiaDeOrden, historiaDeSimbolo, historiaDeTrozo } from '../catalogo/historias'
import { REGLA_DE_CONFIGURACION } from '../catalogo/reglas'
import { almacenEnMemoria, crearEstudio, type Almacen, type Pregunta, type Respuesta, type Tanda } from './estudio'

type Estudio = ReturnType<typeof crearEstudio>

const DIA_1 = '2026-10-05'
const GRUPO_18 = ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn']
const GRUPO_1 = ['H', 'Li', 'Na', 'K', 'Rb', 'Cs', 'Fr']

function montar(azar = () => 0, almacen: Almacen = almacenEnMemoria()) {
  const reloj = { dia: DIA_1 }
  return { estudio: crearEstudio(almacen, () => reloj.dia, azar), reloj, almacen }
}

function correctaDe({ elemento, paso }: Pregunta): Respuesta {
  if (paso === 'posicion') return { paso, simbolo: elemento.simbolo }
  if (paso === 'clase') return { paso, clase: elemento.clase }
  if (paso === 'configuracion') return { paso, subnivel: ultimoSubnivel(elemento)! }
  return { paso, numeros: elemento.numeros }
}

function otraClase(clase: Clase): Clase {
  return clase === 'metal' ? 'no-metal' : 'metal'
}

function sigueLaMismaCadena(tanda: Tanda, simbolo: string): boolean {
  return tanda.pregunta?.elemento.simbolo === simbolo && tanda.pregunta.paso !== 'posicion'
}

function acertarCadena(estudio: Estudio, tanda: Tanda): Tanda {
  const simbolo = tanda.pregunta!.elemento.simbolo
  let actual = tanda
  do {
    actual = estudio.responder(actual, correctaDe(actual.pregunta!))
  } while (sigueLaMismaCadena(actual, simbolo))
  return actual
}

function fallarLaClase(estudio: Estudio, tanda: Tanda): Tanda {
  const { elemento } = tanda.pregunta!
  let actual = estudio.responder(tanda, correctaDe(tanda.pregunta!))
  actual = estudio.responder(actual, { paso: 'clase', clase: otraClase(elemento.clase) })
  actual = estudio.cerrarCorreccion(actual)
  while (sigueLaMismaCadena(actual, elemento.simbolo)) {
    actual = estudio.responder(actual, correctaDe(actual.pregunta!))
  }
  return actual
}

function abrir(estudio: Estudio): Tanda | null {
  const tanda = estudio.abrirTanda()
  return tanda?.presentacion ? estudio.descartarPresentacion(tanda) : tanda
}

function acertarTanda(estudio: Estudio, tanda: Tanda): Tanda {
  let actual = tanda
  while (actual.pregunta) actual = acertarCadena(estudio, actual)
  return actual
}

function estudiarElDia(estudio: Estudio) {
  for (let tanda = abrir(estudio); tanda; tanda = abrir(estudio)) acertarTanda(estudio, tanda)
}

function hastaPresentar(estudio: Estudio, simbolo: string): Tanda {
  for (let tanda = estudio.abrirTanda(); tanda; tanda = estudio.abrirTanda()) {
    if (tanda.presentacion?.includes(simbolo)) return estudio.descartarPresentacion(tanda)
    acertarTanda(estudio, tanda.presentacion ? estudio.descartarPresentacion(tanda) : tanda)
  }
  throw new Error(`${simbolo} no llega a presentarse`)
}

function hastaPreguntar(estudio: Estudio, simbolo: string): Tanda {
  let tanda = hastaPresentar(estudio, simbolo)
  while (tanda.pregunta!.elemento.simbolo !== simbolo) tanda = acertarCadena(estudio, tanda)
  return tanda
}

function enLaTanda(tanda: Tanda): string[] {
  return [...(tanda.pregunta ? [tanda.pregunta.elemento.simbolo] : []), ...tanda.pendientes]
}

function pasosDeLaCadena(estudio: Estudio, tanda: Tanda): string[] {
  const simbolo = tanda.pregunta!.elemento.simbolo
  const pasos: string[] = []
  let actual = tanda
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
    acertarTanda(estudio, abrir(estudio)!)

    estudio.elegirCamino('uso')

    const otroDia = montar(() => 0, almacen).estudio
    expect(otroDia.camino()).toBe('uso')
    expect(Object.keys(otroDia.entradas()).sort()).toEqual([...GRUPO_18].sort())
  })

  it('por uso al formular, la primera Tanda presenta el H y el O', () => {
    const { estudio } = montar()
    estudio.elegirCamino('uso')

    expect(estudio.abrirTanda()!.presentacion).toEqual(['H', 'O'])
  })
})

describe('Presentación', () => {
  it('sin nada visto, la Tanda presenta el Grupo 18 entero y no pregunta nada', () => {
    const { estudio } = montar()

    const tanda = estudio.abrirTanda()!

    expect(tanda.presentacion).toEqual(GRUPO_18)
    expect(tanda.pregunta).toBeNull()
    expect(estudio.entradas()).toEqual({})
  })

  it('descartarla deja sus Elementos Flojos y pendientes para hoy, y empieza a preguntar', () => {
    const { estudio } = montar()

    const tanda = estudio.descartarPresentacion(estudio.abrirTanda()!)

    expect(tanda.presentacion).toBeNull()
    expect(enLaTanda(tanda).sort()).toEqual([...GRUPO_18].sort())
    expect(estudio.entradas().He).toEqual({ estado: 'flojo', intervalo: 0, vuelve: DIA_1, fallos: 0, pasosFallados: [] })
    expect(Object.keys(estudio.entradas())).toHaveLength(6)
  })

  it('anuncia lo que trae la Tanda y cuánto dura', () => {
    expect(montar().estudio.anuncio()).toEqual({ repaso: 0, nuevos: 6, minutos: 3 })
  })
})

describe('Cadena', () => {
  it('los pasos van siempre en el mismo orden: Posición, Clase, Configuración y Números de oxidación', () => {
    const { estudio } = montar()

    expect(pasosDeLaCadena(estudio, abrir(estudio)!)).toEqual(['posicion', 'clase', 'configuracion', 'numeros'])
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
    const tanda = abrir(estudio)!
    const { simbolo } = tanda.pregunta!.elemento

    const despues = acertarCadena(estudio, tanda)

    expect(estudio.entradas()[simbolo]).toEqual({
      estado: 'sabido',
      intervalo: 1,
      vuelve: '2026-10-06',
      fallos: 0,
      pasosFallados: [],
    })
    expect(despues.enteros).toEqual([simbolo])
    expect(despues.rotulados).toEqual([simbolo])
  })

  it('un fallo abre la Corrección, y al cerrarla la Cadena sigue en el paso siguiente', () => {
    const { estudio } = montar()
    let tanda = abrir(estudio)!
    const { elemento } = tanda.pregunta!
    tanda = estudio.responder(tanda, correctaDe(tanda.pregunta!))

    tanda = estudio.responder(tanda, { paso: 'clase', clase: otraClase(elemento.clase) })

    expect(tanda.correccion?.paso).toBe('clase')
    expect(tanda.pregunta!.paso).toBe('clase')
    expect(tanda.pregunta!.fallados).toEqual(['clase'])

    tanda = estudio.cerrarCorreccion(tanda)

    expect(tanda.correccion).toBeNull()
    expect(tanda.pregunta!.elemento).toBe(elemento)
    expect(tanda.pregunta!.paso).toBe('configuracion')
  })

  it('con la Corrección abierta no se puede responder', () => {
    const { estudio } = montar()
    let tanda = abrir(estudio)!
    tanda = estudio.responder(tanda, { paso: 'posicion', simbolo: 'Fr' })

    expect(estudio.responder(tanda, correctaDe(tanda.pregunta!))).toBe(tanda)
  })

  it('una Cadena dejada a medias no se anota', () => {
    const { estudio, almacen } = montar()
    const tanda = abrir(estudio)!
    const { simbolo } = tanda.pregunta!.elemento

    estudio.responder(tanda, correctaDe(tanda.pregunta!))

    const alVolver = montar(() => 0, almacen).estudio
    expect(alVolver.entradas()[simbolo]).toEqual({ estado: 'flojo', intervalo: 0, vuelve: DIA_1, fallos: 0, pasosFallados: [] })
  })
})

describe('Corrección', () => {
  it('la de Posición trae la Historia de orden del Grupo y la de Símbolo', () => {
    const { estudio } = montar()
    const tanda = hastaPreguntar(estudio, 'Na')
    const sodio = elementoDe('Na')

    const { correccion } = estudio.responder(tanda, { paso: 'posicion', simbolo: 'K' })

    expect(correccion).toMatchObject({ paso: 'posicion', historias: [historiaDeOrden(sodio), historiaDeSimbolo(sodio)] })
  })

  it('la de Configuración trae la regla para deducirla de la Posición', () => {
    const { estudio } = montar()
    let tanda = abrir(estudio)!
    tanda = estudio.responder(tanda, correctaDe(tanda.pregunta!))
    tanda = estudio.responder(tanda, correctaDe(tanda.pregunta!))

    const { correccion } = estudio.responder(tanda, { paso: 'configuracion', subnivel: { capa: 7, letra: 'd', electrones: 9 } })

    expect(correccion).toMatchObject({ paso: 'configuracion', historias: [REGLA_DE_CONFIGURACION] })
  })

  it('la de Números de oxidación dice cuáles faltaron y cuáles sobraron, con la Regla del Grupo', () => {
    const { estudio } = montar()
    let tanda = hastaPreguntar(estudio, 'Na')
    while (tanda.pregunta!.paso !== 'numeros') tanda = estudio.responder(tanda, correctaDe(tanda.pregunta!))

    const { correccion } = estudio.responder(tanda, { paso: 'numeros', numeros: [-1] })

    expect(correccion).toMatchObject({ paso: 'numeros', faltaron: [1], sobraron: [-1], excepcion: null, historias: [] })
    expect(correccion!.regla!.grupo).toBe(1)
  })

  it('avisa de la excepción cuando el Elemento se aparta de la Regla de su Grupo', () => {
    const { estudio } = montar()
    let tanda = hastaPreguntar(estudio, 'H')
    while (tanda.pregunta!.paso !== 'numeros') tanda = estudio.responder(tanda, correctaDe(tanda.pregunta!))

    const { correccion } = estudio.responder(tanda, { paso: 'numeros', numeros: [1] })

    expect(correccion).toMatchObject({ faltaron: [-1], sobraron: [] })
    expect(correccion!.excepcion).toContain('además −1')
  })

  it('en un metal de transición trae la Historia de su trozo en vez de una Regla', () => {
    const { estudio } = montar()
    let tanda = hastaPreguntar(estudio, 'Cu')
    while (tanda.pregunta!.paso !== 'numeros') tanda = estudio.responder(tanda, correctaDe(tanda.pregunta!))

    const { correccion } = estudio.responder(tanda, { paso: 'numeros', numeros: [1] })

    expect(correccion).toMatchObject({ faltaron: [2], regla: null, historias: [historiaDeTrozo(elementoDe('Cu'))] })
  })
})

describe('Números de oxidación', () => {
  function hastaLosNumeros(estudio: Estudio, simbolo: string): Tanda {
    let tanda = hastaPreguntar(estudio, simbolo)
    while (tanda.pregunta!.paso !== 'numeros') tanda = estudio.responder(tanda, correctaDe(tanda.pregunta!))
    return tanda
  }

  it('solo es acierto el conjunto exacto de los verdaderos, en cualquier orden', () => {
    const { estudio } = montar()
    const tanda = hastaLosNumeros(estudio, 'Xe')

    expect(estudio.responder(tanda, { paso: 'numeros', numeros: [6, 4, 2, 0] }).correccion).toBeNull()
    expect(estudio.responder(tanda, { paso: 'numeros', numeros: [0, 2, 4] }).correccion).toMatchObject({ faltaron: [6] })
    expect(estudio.responder(tanda, { paso: 'numeros', numeros: [-2, 0, 2, 4, 6] }).correccion).toMatchObject({ sobraron: [-2] })
  })

  it('los Distractores prefieren el signo contrario y los números del Grupo contiguo', () => {
    const { estudio } = montar()

    expect(hastaLosNumeros(estudio, 'Na').pregunta!.opciones).toEqual([-1, 1, 2])
  })

  it.each([0, 0.9])('con el azar en %s, cada Elemento ofrece sus verdaderos y dos o tres Distractores, ordenados', (valor) => {
    const { estudio } = montar(() => valor)
    const vistos = new Set<string>()

    for (let tanda = abrir(estudio); tanda; tanda = abrir(estudio)) {
      while (tanda.pregunta) {
        const { elemento, opciones } = tanda.pregunta
        const distractores = opciones.filter((numero) => !elemento.numeros.includes(numero))
        expect(opciones.filter((numero) => elemento.numeros.includes(numero)), elemento.simbolo).toEqual(elemento.numeros)
        expect(distractores.length, elemento.simbolo).toBe(valor < 0.5 ? 2 : 3)
        expect(opciones, elemento.simbolo).toEqual([...new Set(opciones)].sort((a, b) => a - b))
        expect(opciones.every((numero) => numero >= -4 && numero <= 7), elemento.simbolo).toBe(true)
        vistos.add(elemento.simbolo)
        tanda = acertarCadena(estudio, tanda)
      }
    }

    expect(vistos.size).toBe(56)
  })
})

describe('Fallo en la Cadena', () => {
  it('deja el Elemento Flojo para mañana, con el paso fallado y un fallo más', () => {
    const { estudio } = montar()
    const tanda = abrir(estudio)!
    const { simbolo } = tanda.pregunta!.elemento

    const despues = fallarLaClase(estudio, tanda)

    expect(estudio.entradas()[simbolo]).toEqual({
      estado: 'flojo',
      intervalo: 0,
      vuelve: '2026-10-06',
      fallos: 1,
      pasosFallados: ['clase'],
    })
    expect(despues.vuelven).toEqual([simbolo])
  })

  it('el Elemento vuelve una vez en la misma Tanda, tres Elementos después', () => {
    const { estudio } = montar()
    let tanda = abrir(estudio)!
    const { simbolo } = tanda.pregunta!.elemento
    tanda = fallarLaClase(estudio, tanda)

    const siguientes: string[] = []
    while (tanda.pregunta!.elemento.simbolo !== simbolo) {
      siguientes.push(tanda.pregunta!.elemento.simbolo)
      tanda = acertarCadena(estudio, tanda)
    }

    expect(siguientes).toHaveLength(3)
  })

  it('acertarlo al volver no lo saca de Flojo', () => {
    const { estudio } = montar()
    let tanda = abrir(estudio)!
    const { simbolo } = tanda.pregunta!.elemento
    tanda = fallarLaClase(estudio, tanda)

    tanda = acertarTanda(estudio, tanda)

    expect(estudio.entradas()[simbolo]).toMatchObject({ estado: 'flojo', fallos: 1, vuelve: '2026-10-06' })
    expect(tanda.vuelven).toEqual([simbolo])
    expect(tanda.enteros).toHaveLength(5)
  })

  it('fallarlo otra vez al volver no lo trae una tercera vez ni suma otro fallo', () => {
    const { estudio } = montar()
    let tanda = abrir(estudio)!
    const { simbolo } = tanda.pregunta!.elemento
    tanda = fallarLaClase(estudio, tanda)
    while (tanda.pregunta!.elemento.simbolo !== simbolo) tanda = acertarCadena(estudio, tanda)

    tanda = fallarLaClase(estudio, tanda)

    expect(enLaTanda(tanda)).not.toContain(simbolo)
    expect(estudio.entradas()[simbolo].fallos).toBe(1)
    expect(tanda.vuelven).toEqual([simbolo])
  })

  it('si quedan menos de tres Elementos, vuelve al final', () => {
    const { estudio } = montar()
    let tanda = abrir(estudio)!
    for (let i = 0; i < 4; i++) tanda = acertarCadena(estudio, tanda)
    const { simbolo } = tanda.pregunta!.elemento

    tanda = fallarLaClase(estudio, tanda)

    expect(tanda.pendientes).toEqual([simbolo])
  })
})

describe('Tanda', () => {
  it('un trozo que cabe entra entero: el Grupo 1 son siete Elementos', () => {
    const { estudio } = montar()
    acertarTanda(estudio, abrir(estudio)!)

    const tanda = estudio.abrirTanda()!

    expect(tanda.presentacion).toEqual(GRUPO_1)
    expect(enLaTanda(estudio.descartarPresentacion(tanda))).toHaveLength(7)
  })

  it('trae primero lo que toca hoy; del trozo nuevo entran los que caben y los demás quedan para la siguiente', () => {
    const { estudio, reloj } = montar()
    acertarTanda(estudio, abrir(estudio)!)
    reloj.dia = '2026-10-06'

    expect(estudio.anuncio()).toEqual({ repaso: 6, nuevos: 2, minutos: 4 })
    let tanda = estudio.abrirTanda()!
    expect(tanda.presentacion).toEqual(GRUPO_1)
    tanda = estudio.descartarPresentacion(tanda)

    const preguntados = enLaTanda(tanda)
    expect(preguntados).toHaveLength(8)
    expect(preguntados).toEqual(expect.arrayContaining(GRUPO_18))
    expect(Object.keys(estudio.entradas())).toHaveLength(13)

    acertarTanda(estudio, tanda)
    const siguiente = estudio.abrirTanda()!
    const delGrupo1PorPreguntar = GRUPO_1.filter((simbolo) => !preguntados.includes(simbolo))
    expect(siguiente.presentacion).toBeNull()
    expect(enLaTanda(siguiente).sort()).toEqual(delGrupo1PorPreguntar.sort())
  })

  it('no presenta un trozo nuevo mientras quede algún Elemento presentado sin preguntar', () => {
    const { estudio, almacen } = montar()
    acertarCadena(estudio, abrir(estudio)!)

    const alVolver = montar(() => 0, almacen).estudio

    expect(alVolver.anuncio()).toEqual({ repaso: 5, nuevos: 0, minutos: 3 })
    const tanda = alVolver.abrirTanda()!
    expect(tanda.presentacion).toBeNull()
    expect(enLaTanda(tanda)).toHaveLength(5)

    acertarTanda(alVolver, tanda)
    expect(alVolver.abrirTanda()!.presentacion).toEqual(GRUPO_1)
  })

  it('un Elemento Flojo por haberlo fallado no frena el trozo siguiente', () => {
    const { estudio } = montar()
    const tanda = abrir(estudio)!

    acertarTanda(estudio, fallarLaClase(estudio, tanda))

    expect(estudio.abrirTanda()!.presentacion).toEqual(GRUPO_1)
  })

  it('si lo que toca hoy llena la Tanda, no presenta nada nuevo', () => {
    const { estudio, reloj } = montar()
    acertarTanda(estudio, abrir(estudio)!)
    acertarTanda(estudio, abrir(estudio)!)
    reloj.dia = '2026-10-06'

    const tanda = estudio.abrirTanda()!

    expect(tanda.presentacion).toBeNull()
    expect(enLaTanda(tanda)).toHaveLength(8)
  })

  it('los Flojos van delante de los Sabidos', () => {
    const { estudio, reloj } = montar()
    let tanda = abrir(estudio)!
    while (tanda.pregunta!.elemento.simbolo !== 'Rn') tanda = acertarCadena(estudio, tanda)
    acertarTanda(estudio, fallarLaClase(estudio, tanda))
    acertarTanda(estudio, abrir(estudio)!)
    reloj.dia = '2026-10-06'
    const sabidosQueTocan = elementos().filter(({ simbolo }) => estudio.entradas()[simbolo]?.estado === 'sabido')

    const preguntados = enLaTanda(estudio.abrirTanda()!)

    expect(sabidosQueTocan).toHaveLength(12)
    expect(preguntados).toContain('Rn')
  })

  it('entre los Sabidos va primero el que más lleva esperando', () => {
    const { estudio, reloj } = montar()
    acertarTanda(estudio, abrir(estudio)!)
    acertarTanda(estudio, abrir(estudio)!)
    reloj.dia = '2026-10-06'
    const repasados = enLaTanda(acertarTandaYDevolverla(estudio))
    const sinRepasar = [...GRUPO_18, ...GRUPO_1].filter((simbolo) => !repasados.includes(simbolo))
    reloj.dia = '2026-10-09'

    const preguntados = enLaTanda(estudio.abrirTanda()!)

    expect(sinRepasar).toHaveLength(5)
    expect(preguntados).toEqual(expect.arrayContaining(sinRepasar))
  })

  it('al terminar no queda pregunta, y dice cuáles se acertaron enteros y cuáles vuelven', () => {
    const { estudio } = montar()
    let tanda = abrir(estudio)!
    const fallado = tanda.pregunta!.elemento.simbolo

    tanda = acertarTanda(estudio, fallarLaClase(estudio, tanda))

    expect(tanda.pregunta).toBeNull()
    expect(tanda.pendientes).toEqual([])
    expect(tanda.vuelven).toEqual([fallado])
    expect([...tanda.enteros].sort()).toEqual(GRUPO_18.filter((simbolo) => simbolo !== fallado).sort())
  })

  it('sin nada que toque ni nada por ver no hay Tanda, y dice el día en que vuelve a tocar', () => {
    const { estudio } = montar()

    estudiarElDia(estudio)

    expect(estudio.abrirTanda()).toBeNull()
    expect(estudio.anuncio()).toBeNull()
    expect(estudio.proximaVuelta()).toBe('2026-10-06')
    expect(estudio.resumen()).toEqual({ sabidos: 56, flojos: 0, sinVer: 0, total: 56 })
  })

  function acertarTandaYDevolverla(estudio: Estudio): Tanda {
    const tanda = abrir(estudio)!
    acertarTanda(estudio, tanda)
    return tanda
  }
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

  it('un Elemento no se repasa antes de que se cumpla su Intervalo', () => {
    const { estudio, reloj } = montar()
    estudiarElDia(estudio)
    reloj.dia = '2026-10-06'
    estudiarElDia(estudio)

    reloj.dia = '2026-10-08'

    expect(estudio.abrirTanda()).toBeNull()
    expect(estudio.proximaVuelta()).toBe('2026-10-09')
  })

  it('un fallo devuelve el Elemento al día siguiente y su Intervalo empieza de nuevo', () => {
    const { estudio, reloj } = montar()
    estudiarElDia(estudio)
    reloj.dia = '2026-10-06'
    estudiarElDia(estudio)
    reloj.dia = '2026-10-09'
    let tanda = abrir(estudio)!
    const { simbolo } = tanda.pregunta!.elemento
    expect(estudio.entradas()[simbolo].intervalo).toBe(3)

    tanda = fallarLaClase(estudio, tanda)

    expect(estudio.entradas()[simbolo]).toMatchObject({ estado: 'flojo', intervalo: 0, vuelve: '2026-10-10' })

    acertarTanda(estudio, tanda)
    reloj.dia = '2026-10-10'
    estudiarElDia(estudio)

    expect(estudio.entradas()[simbolo]).toMatchObject({ estado: 'sabido', intervalo: 1, vuelve: '2026-10-11' })
  })
})

describe('Dominio', () => {
  it('cuenta los Elementos Sabidos, Flojos y sin ver', () => {
    const { estudio } = montar()
    const tanda = abrir(estudio)!

    acertarCadena(estudio, tanda)

    expect(estudio.resumen()).toEqual({ sabidos: 1, flojos: 5, sinVer: 50, total: 56 })
  })

  it('lo estudiado sigue ahí al volver a abrir la aplicación', () => {
    const { estudio, almacen } = montar()
    acertarTanda(estudio, abrir(estudio)!)

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
      JSON.stringify({ version: 1, camino: 'uso', elementos: { He: buena, Pd: buena, Ne: { ...buena, vuelve: 'mañana' } } }),
    )

    const { estudio } = montar(() => 0, almacen)

    expect(estudio.entradas()).toEqual({ He: buena })
    expect(estudio.camino()).toBe('uso')
  })
})
