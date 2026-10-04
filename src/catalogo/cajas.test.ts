import { describe, expect, it } from 'vitest'
import { cajasDe, filasDe, ocupacionDe, ultimoElectronDe, type Sitio } from './cajas'
import { elementoDe, elementos, esDeTransicion } from './catalogo'

function escritas(simbolo: string): string {
  const { gasNoble, partes } = cajasDe(elementoDe(simbolo))
  const subniveles = partes.map(({ capa, letra, electrones, recogida }) =>
    recogida ? `(${capa}${letra}${electrones})` : `${capa}${letra}${electrones}`,
  )
  return [...(gasNoble ? [`[${gasNoble}]`] : []), ...subniveles].join(' ')
}

function marcasDe(simbolo: string, numero: number): string[] {
  const fila = filasDe(elementoDe(simbolo)).find((candidata) => candidata.numero === numero)!
  return fila.marcas.map(escrito)
}

function escrito({ subnivel, orbital, flecha }: Sitio): string {
  return `${subnivel}/${orbital}${flecha === 'arriba' ? '↑' : '↓'}`
}

describe('Cajas', () => {
  it('van en orden de llenado, detrás del gas noble anterior', () => {
    expect(escritas('S')).toBe('[Ne] 3s2 3p4')
    expect(escritas('C')).toBe('[He] 2s2 2p2')
  })

  it('un subnivel lleno que queda entre dos Cajas va recogido en una ficha', () => {
    expect(escritas('Se')).toBe('[Ar] 4s2 (3d10) 4p4')
    expect(escritas('Pb')).toBe('[Xe] 6s2 (4f14) (5d10) 6p2')
  })

  it('un metal de transición lleva la Caja s y la Caja d, con los electrones de su Configuración real', () => {
    expect(escritas('Fe')).toBe('[Ar] 4s2 3d6')
    expect(escritas('Cr')).toBe('[Ar] 4s1 3d5')
    expect(escritas('Pt')).toBe('[Xe] 6s1 (4f14) 5d9')
  })

  it('el H y el He llevan solo la Caja 1s, sin gas noble delante', () => {
    expect(escritas('H')).toBe('1s1')
    expect(escritas('He')).toBe('1s2')
  })

  it('un metal de los Grupos 1 y 2 lleva su Caja p vacía', () => {
    expect(escritas('Na')).toBe('[Ne] 3s1 3p0')
    expect(escritas('Ca')).toBe('[Ar] 4s2 4p0')
  })

  it('la s es 1 caja, la p son 3 y la d son 5', () => {
    const orbitales = (simbolo: string) =>
      cajasDe(elementoDe(simbolo))
        .partes.filter((parte) => !parte.recogida)
        .map((parte) => parte.orbitales)

    expect(orbitales('S')).toEqual([1, 3])
    expect(orbitales('Fe')).toEqual([1, 5])
  })

  it('se llenan primero las mitades de la flecha arriba y después las parejas', () => {
    const caja3p = cajasDe(elementoDe('S')).partes[1]

    expect(ocupacionDe(caja3p).map(escrito)).toEqual(['3p/0↑', '3p/1↑', '3p/2↑', '3p/0↓'])
  })
})

describe('Filas de las Cajas resueltas', () => {
  it('cada Número de oxidación tiene su fila, con tantas marcas como indica', () => {
    for (const elemento of elementos()) {
      const filas = filasDe(elemento)

      expect(filas.map((fila) => fila.numero), elemento.simbolo).toEqual(elemento.numeros)
      for (const { numero, marcas } of filas) {
        expect(marcas.length, `${elemento.simbolo} ${numero}`).toBe(Math.abs(numero))
        expect(new Set(marcas.map(escrito)).size, `${elemento.simbolo} ${numero}`).toBe(marcas.length)
      }
    }
  })

  it('un positivo marca flechas que el Elemento tiene, y un negativo, mitades vacías de su última Caja', () => {
    for (const elemento of elementos()) {
      const { partes } = cajasDe(elemento)
      const ocupadas = new Set(partes.filter((parte) => !parte.recogida).flatMap((parte) => ocupacionDe(parte).map(escrito)))
      const ultima = partes.at(-1)!

      for (const { numero, marcas } of filasDe(elemento)) {
        if (numero === 0) continue
        const enLasOcupadas = marcas.every((marca) => ocupadas.has(escrito(marca)))
        expect(enLasOcupadas, `${elemento.simbolo} ${numero}`).toBe(numero > 0)
        if (numero < 0) {
          expect(marcas.every((marca) => marca.subnivel === `${ultima.capa}${ultima.letra}`), elemento.simbolo).toBe(true)
        }
      }
    }
  })

  it('un Elemento que no es de transición suelta primero la p, de derecha a izquierda, y después la s', () => {
    expect(marcasDe('S', 2)).toEqual(['3p/2↑', '3p/1↑'])
    expect(marcasDe('S', 4)).toEqual(['3p/2↑', '3p/1↑', '3p/0↓', '3p/0↑'])
    expect(marcasDe('S', 6)).toEqual(['3p/2↑', '3p/1↑', '3p/0↓', '3p/0↑', '3s/0↓', '3s/0↑'])
  })

  it('un metal de transición suelta primero la s y después la d', () => {
    expect(marcasDe('Fe', 2)).toEqual(['4s/0↓', '4s/0↑'])
    expect(marcasDe('Fe', 3)).toEqual(['4s/0↓', '4s/0↑', '3d/4↑'])
    expect(marcasDe('Cu', 1)).toEqual(['4s/0↑'])
    expect(marcasDe('Hg', 1)).toEqual(['6s/0↓'])
  })

  it('el negativo marca las mitades que le faltan a la p', () => {
    expect(marcasDe('S', -2)).toEqual(['3p/1↓', '3p/2↓'])
    expect(marcasDe('C', -4)).toEqual(['2p/2↑', '2p/0↓', '2p/1↓', '2p/2↓'])
    expect(marcasDe('H', -1)).toEqual(['1s/0↓'])
  })

  it('el 0 lleva su fila sin marcas', () => {
    expect(marcasDe('Xe', 0)).toEqual([])
  })
})

describe('Último electrón', () => {
  it.each([
    ['S', '3p/0↓', { n: 3, l: 1, m: -1, s: -0.5 }],
    ['C', '2p/1↑', { n: 2, l: 1, m: 0, s: 0.5 }],
    ['Na', '3s/0↑', { n: 3, l: 0, m: 0, s: 0.5 }],
    ['Fe', '3d/0↓', { n: 3, l: 2, m: -2, s: -0.5 }],
    ['Cr', '3d/4↑', { n: 3, l: 2, m: 2, s: 0.5 }],
    ['H', '1s/0↑', { n: 1, l: 0, m: 0, s: 0.5 }],
  ])('el del %s está en %s', (simbolo, sitio, cuanticos) => {
    const ultimo = ultimoElectronDe(elementoDe(simbolo))

    expect(escrito(ultimo.sitio)).toBe(sitio)
    expect(ultimo.cuanticos).toEqual(cuanticos)
  })

  it('está siempre en una Caja, nunca en una ficha', () => {
    for (const elemento of elementos()) {
      const { partes } = cajasDe(elemento)
      const { sitio } = ultimoElectronDe(elemento)
      const suCaja = partes.find((parte) => `${parte.capa}${parte.letra}` === sitio.subnivel)

      expect(suCaja?.recogida, elemento.simbolo).toBe(false)
    }
  })

  it('en un metal de transición está en la d', () => {
    const deTransicion = elementos().filter(esDeTransicion)

    expect(deTransicion.map((elemento) => ultimoElectronDe(elemento).sitio.subnivel[1])).toEqual(deTransicion.map(() => 'd'))
  })
})
