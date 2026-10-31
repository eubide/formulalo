import { describe, expect, it } from 'vitest'
import { abrir, acertarCadena, acertarOleada as acertarOleadaEntera, estudiarElDia, fallar, montar } from '../estudio/ayudantes'
import { almacenEnMemoria, type Estudio } from '../estudio/estudio'
import { pintar } from './pintar'
import Portada from './Portada.svelte'

const BIENVENIDA =
  'Aprende dónde está cada elemento en la tabla y deduce de ahí sus números de oxidación, para poder formular. Cada oleada dura unos minutos: primero te presenta unos elementos, después te pregunta y acaba con fórmulas.'
const DESDE_EL_GAS_NOBLE = 'Grupos 18, 1, 2, 17, 16, 15, 14 y 13, y después los metales de transición.'
const POR_USO = 'Primero el H y el O; después los grupos 1, 2, 17, 16, 15, 14 y 13, los metales de transición y el 18.'

function pintarPortada(estudio: Estudio): string {
  return pintar(Portada, { estudio, alEmpezar: () => {}, alExplorar: () => {}, alDictado: () => {}, alRadicales: () => {} })
}

function conLaPrimeraCadenaRespondida() {
  const montado = montar()
  acertarCadena(montado.estudio, abrir(montado.estudio))
  return montado
}

describe('Portada la primera vez', () => {
  it.each(['Modo', 'Camino', 'Dictado', 'Radicales', 'Tu avance', 'Explorar la tabla', 'Guardar copia'])('no ofrece todavía «%s»', (oculto) => {
    expect(pintarPortada(montar().estudio)).not.toContain(oculto)
  })

  it('ofrece la Oleada, con lo que trae, y recuperar una copia de otro navegador', () => {
    expect(pintarPortada(montar().estudio)).toMatch(/Oleada Elemento .* Nueva oleada 6 nuevos · unos 3 min Recuperar copia$/)
  })

  it('sigue igual si solo ha visto la Presentación', () => {
    const { estudio } = montar()
    estudio.descartarPresentacion(estudio.abrirOleada())

    expect(pintarPortada(estudio)).not.toContain('Dictado')
  })

  it('con la primera Cadena respondida lo ofrece todo', () => {
    const texto = pintarPortada(conLaPrimeraCadenaRespondida().estudio)

    for (const visible of ['Modo', 'Camino', 'Dictado', 'Radicales', 'Tu avance', 'Explorar la tabla', 'Guardar copia']) expect(texto).toContain(visible)
  })

  it('un Dominio guardado sin Oleadas, pero con Elementos preguntados, tampoco es la primera vez', () => {
    const almacen = almacenEnMemoria()
    const entrada = { estado: 'sabido', intervalo: 3, vuelve: '2026-10-07', fallos: 0, pasosFallados: [] }
    almacen.setItem('formulalo:dominio', JSON.stringify({ version: 1, camino: 'gas-noble', elementos: { He: entrada } }))

    expect(pintarPortada(montar(() => 0, almacen).estudio)).toContain('Dictado')
  })
})

describe('Portada', () => {
  it('con el Dominio vacío da la bienvenida bajo el lema', () => {
    const { estudio } = montar()

    expect(pintarPortada(estudio)).toContain(`No lo memorices: dedúcelo. ${BIENVENIDA}`)
  })

  it('con un Elemento visto ya no da la bienvenida', () => {
    const { estudio } = montar()
    estudio.descartarPresentacion(estudio.abrirOleada())

    const texto = pintarPortada(estudio)

    expect(texto).toContain('No lo memorices: dedúcelo.')
    expect(texto).not.toContain('Aprende dónde está')
  })

  it('bajo el selector dice el orden del Camino elegido', () => {
    const { estudio } = conLaPrimeraCadenaRespondida()

    expect(pintarPortada(estudio)).toContain(`Camino Desde el gas noble Por uso al formular ${DESDE_EL_GAS_NOBLE}`)
    expect(pintarPortada(estudio)).not.toContain(POR_USO)

    estudio.elegirCamino('uso')

    expect(pintarPortada(estudio)).toContain(`Camino Desde el gas noble Por uso al formular ${POR_USO}`)
    expect(pintarPortada(estudio)).not.toContain(DESDE_EL_GAS_NOBLE)
  })

  it('la Oleada y el Dictado salen juntos, cada uno con lo que es y con lo que trae', () => {
    const { estudio } = montar()
    estudiarElDia(estudio)

    const texto = pintarPortada(estudio)

    expect(texto).toContain('Oleada Elemento a elemento: dónde está, qué es y sus números. Nueva oleada 8 de práctica')
    expect(texto).toContain('Dictado Solo los números de oxidación, por bloques. Nuevo dictado Bloques: 2 nuevos 0 de 10 bloques')
    expect(texto).toContain(
      'Radicales Iones como ClO₃⁻, el clorato: escribe su nombre o su fórmula y calcula su número. Nuevos radicales Radicales: 10 nuevos 0 de 39 radicales Tu avance',
    )
  })

  it('el Dictado no depende de las Oleadas, y dice qué trae', () => {
    const { estudio } = conLaPrimeraCadenaRespondida()

    expect(pintarPortada(estudio)).toContain('Nuevo dictado Bloques: 2 nuevos 0 de 10 bloques')
  })

  it('dice cuánto hay por repasar, también en una Oleada que no trae repaso', () => {
    const { estudio, reloj } = montar()
    acertarOleadaEntera(estudio, abrir(estudio))
    reloj.dia = '2026-10-06'

    expect(pintarPortada(estudio)).toContain('6 por repasar hoy')
  })

  it('el Camino desaparece cuando ya no queda nada nuevo que ordenar', () => {
    const { estudio } = montar()
    estudiarElDia(estudio)

    expect(pintarPortada(estudio)).not.toContain('Desde el gas noble')
  })

  it('el Modo va antes de los tres ejercicios, el Camino dentro de la Oleada, y Explorar junto a la tabla', () => {
    const { estudio } = conLaPrimeraCadenaRespondida()

    expect(pintarPortada(estudio)).toMatch(
      /Modo Normal Vacilón Molesto Sin sorpresas\. Oleada Elemento .* Nueva oleada .* Camino .* Dictado Solo .* Radicales Iones .* Tu avance 1 sabido · 5 flojos · 52 sin ver, de 58 1 2 3 .* Explorar la tabla/,
    )
  })

  it('dice dónde vive lo estudiado antes de ofrecer la copia', () => {
    const { estudio } = conLaPrimeraCadenaRespondida()

    expect(pintarPortada(estudio)).toMatch(/Lo estudiado se guarda solo en este navegador\. Guardar copia Recuperar copia$/)
  })

  it('escribe en singular lo que es uno', () => {
    const { estudio } = montar()
    acertarOleadaEntera(estudio, fallar(estudio, abrir(estudio), ['posicion']))

    expect(pintarPortada(estudio)).toContain('1 flojo')
    expect(pintarPortada(estudio)).not.toContain('1 flojos')
  })

  it('ofrece los tres Modos y describe el elegido', () => {
    const { estudio } = conLaPrimeraCadenaRespondida()

    expect(pintarPortada(estudio)).toContain('Modo Normal Vacilón Molesto Sin sorpresas.')

    estudio.elegirModo('molesto')

    expect(pintarPortada(estudio)).toContain('no se calla')
  })

  it('lleva el seguimiento de las Oleadas hechas', () => {
    const { estudio, reloj } = montar()
    expect(pintarPortada(estudio)).not.toContain('al día')

    const oleada = abrir(estudio)
    acertarOleadaEntera(estudio, oleada)
    reloj.hora = '11:00'

    expect(pintarPortada(estudio)).toContain('Hoy: 1 oleada · la última hace 1 h · 1,0 al día')
  })

  it('al final ofrece guardar y recuperar una copia, sin pedir ni avisar nada hasta que se elige un archivo', () => {
    const { estudio } = montar()
    const oleada = abrir(estudio)
    fallar(estudio, oleada, ['clase'])

    expect(pintarPortada(estudio)).toMatch(/Dónde se rompe la cadena .*: Clase .*Guardar copia Recuperar copia$/)
  })

  it('con 58 Elementos por repasar lo dice, además de lo que trae la Oleada', () => {
    const { estudio, reloj } = montar()
    estudiarElDia(estudio)
    reloj.dia = '2026-10-06'

    const texto = pintarPortada(estudio)

    expect(texto).toContain('Nueva oleada 8 de repaso · unos 4 min 58 por repasar hoy')
  })

  it('no escribe las partes del anuncio que valen cero, y con un minuto dice «1 min»', () => {
    const { estudio } = montar()
    estudio.elegirCamino('uso')

    const texto = pintarPortada(estudio)

    expect(texto).toContain('Nueva oleada 2 nuevos · 1 min')
    expect(texto).not.toContain('por repasar')
  })

  it('sin nada que toque dice cuándo vuelve lo siguiente, y que seguir es práctica', () => {
    const { estudio } = montar()
    estudiarElDia(estudio)

    expect(pintarPortada(estudio)).toContain(
      'Nueva oleada 8 de práctica · unos 4 min Nada por repasar hasta el martes, 6 de octubre: esto es práctica y no adelanta los repasos.',
    )
  })

  it('lista el paso fallado en «Dónde se rompe la cadena» aunque el Elemento esté Sabido', () => {
    const { estudio } = montar()
    const oleada = abrir(estudio)
    const { simbolo, nombre } = oleada.pregunta!.elemento
    fallar(estudio, oleada, ['clase'])

    const texto = pintarPortada(estudio)

    expect(texto).toContain('1 sabido')
    expect(texto).toContain(`Dónde se rompe la cadena ${simbolo} ${nombre}: Clase`)
  })
})
