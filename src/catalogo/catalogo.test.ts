import { describe, expect, it } from 'vitest'
import { trozoPorGrupoDe, trozosDe, type Camino } from './caminos'
import {
  configuracionDe,
  electronesDeValencia,
  elementoDe,
  elementos,
  esDeTransicion,
  ultimoSubnivel,
  type Subnivel,
} from './catalogo'
import { familiaDe, familiaDeGrupo } from './familias'
import { historiaDeOrden, historiaDeSimbolo, historiaDeTrozo } from './historias'
import { excepcionDe, pierdeElNegativo, reglaDe } from './reglas'

const estudiados = elementos()
const deTransicion = estudiados.filter(esDeTransicion)
const deducibles = estudiados.filter((elemento) => !esDeTransicion(elemento))

function escrito(subniveles: Subnivel[]): string {
  return subniveles.map(({ capa, letra, electrones }) => `${capa}${letra}${electrones}`).join(' ')
}

describe('Los 56 Elementos', () => {
  it('son 56, con Símbolos distintos', () => {
    expect(estudiados).toHaveLength(56)
    expect(new Set(estudiados.map((elemento) => elemento.simbolo)).size).toBe(56)
  })

  it('42 traen sus Números de oxidación de la Hoja de oxidación y 14 de la Tabla del libro', () => {
    expect(estudiados.filter((elemento) => elemento.fuente === 'hoja')).toHaveLength(42)
    expect(estudiados.filter((elemento) => elemento.fuente === 'libro')).toHaveLength(14)
  })

  it('doce son metales de transición', () => {
    expect(deTransicion.map((elemento) => elemento.simbolo)).toEqual([
      'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ag', 'Cd', 'Pt', 'Au', 'Hg',
    ])
  })

  it('ningún metal tiene un Número de oxidación negativo', () => {
    const metales = estudiados.filter((elemento) => elemento.clase === 'metal')

    expect(metales.filter((elemento) => elemento.numeros.some((numero) => numero < 0))).toEqual([])
  })

  it('todo no metal tiene un Número de oxidación negativo, o el 0 de los gases nobles', () => {
    const noMetales = estudiados.filter((elemento) => elemento.clase === 'no-metal')

    expect(noMetales.filter((elemento) => !elemento.numeros.some((numero) => numero <= 0))).toEqual([])
  })

  it('los metaloides son justo B, Si, Ge, As, Sb, Te, Po y At', () => {
    const metaloides = estudiados.filter((elemento) => elemento.clase === 'metaloide')

    expect(metaloides.map((elemento) => elemento.simbolo)).toEqual(['B', 'Si', 'Ge', 'As', 'Sb', 'Te', 'Po', 'At'])
  })

  it('el B lleva solo el +3 de la Tabla del libro', () => {
    expect(elementoDe('B').numeros).toEqual([3])
    expect(elementoDe('B').fuente).toBe('libro')
  })
})

describe('Configuración', () => {
  it('los electrones de cada Configuración suman su número atómico', () => {
    for (const elemento of estudiados) {
      const electrones = configuracionDe(elemento).subniveles.reduce((suma, subnivel) => suma + subnivel.electrones, 0)

      expect(electrones, elemento.simbolo).toBe(elemento.z)
    }
  })

  it('se escribe entera en orden de llenado o abreviada desde el gas noble anterior', () => {
    const azufre = configuracionDe(elementoDe('S'))

    expect(escrito(azufre.subniveles)).toBe('1s2 2s2 2p6 3s2 3p4')
    expect(azufre.gasNoble).toBe('Ne')
    expect(escrito(azufre.trasElGasNoble)).toBe('3s2 3p4')
  })

  it('el H y el He no tienen gas noble anterior', () => {
    expect(configuracionDe(elementoDe('He')).gasNoble).toBeNull()
    expect(escrito(configuracionDe(elementoDe('He')).trasElGasNoble)).toBe('1s2')
  })

  it('en los 44 que se preguntan, el subnivel del último electrón se deduce de la Posición', () => {
    for (const elemento of deducibles) {
      const { grupo, periodo, simbolo } = elemento
      const esperado: Subnivel =
        simbolo === 'He'
          ? { capa: 1, letra: 's', electrones: 2 }
          : grupo <= 2
            ? { capa: periodo, letra: 's', electrones: grupo }
            : { capa: periodo, letra: 'p', electrones: grupo - 12 }

      expect(ultimoSubnivel(elemento), simbolo).toEqual(esperado)
    }
  })

  it('a un metal de transición no se le pregunta ningún subnivel', () => {
    expect(deTransicion.map(ultimoSubnivel)).toEqual(deTransicion.map(() => null))
  })

  it('la Capa de valencia lleva los electrones que dice el Grupo', () => {
    expect(electronesDeValencia(elementoDe('O'))).toBe(6)
    expect(electronesDeValencia(elementoDe('Na'))).toBe(1)
    expect(electronesDeValencia(elementoDe('Pb'))).toBe(4)
    expect(electronesDeValencia(elementoDe('He'))).toBe(2)
  })
})

describe('Reglas', () => {
  it('cada Elemento que no es de transición tiene la Regla de su Grupo', () => {
    for (const elemento of deducibles) {
      expect(reglaDe(elemento)?.grupo, elemento.simbolo).toBe(elemento.grupo)
    }
  })

  it('un metal de transición no tiene Regla', () => {
    expect(deTransicion.map(reglaDe)).toEqual(deTransicion.map(() => null))
  })

  it('un Elemento lleva excepción justo cuando sus Números de oxidación no son los de su Regla, sin el negativo si es metal', () => {
    for (const elemento of deducibles) {
      const deLaRegla = reglaDe(elemento)!.numeros.filter((numero) => elemento.clase !== 'metal' || numero >= 0)
      const seAparta = JSON.stringify(elemento.numeros) !== JSON.stringify(deLaRegla)

      expect(excepcionDe(elemento) !== null, elemento.simbolo).toBe(seAparta)
    }
  })

  it('pierden el negativo de su Regla por ser metales Sn, Pb y Bi', () => {
    expect(estudiados.filter(pierdeElNegativo).map((elemento) => elemento.simbolo)).toEqual(['Sn', 'Pb', 'Bi'])
  })
})

describe('Familias', () => {
  it('los 56 Elementos tienen Familia, salvo el H', () => {
    const sinFamilia = estudiados.filter((elemento) => familiaDe(elemento) === null)

    expect(sinFamilia.map((elemento) => elemento.simbolo)).toEqual(['H'])
  })

  it('cada Grupo que no es de transición lleva el nombre de su Familia', () => {
    const porGrupo = Object.fromEntries(deducibles.map((elemento) => [elemento.grupo, familiaDeGrupo(elemento.grupo)]))

    expect(porGrupo).toEqual({
      1: 'Alcalinos',
      2: 'Alcalinotérreos',
      13: 'Térreos o boroideos',
      14: 'Carbonoideos',
      15: 'Nitrogenoideos',
      16: 'Anfígenos o calcógenos',
      17: 'Halógenos',
      18: 'Gases nobles',
    })
  })

  it('un Elemento con Familia lleva la de su Grupo', () => {
    for (const elemento of estudiados.filter((elemento) => elemento.simbolo !== 'H')) {
      expect(familiaDe(elemento), elemento.simbolo).toBe(familiaDeGrupo(elemento.grupo))
    }
  })

  it('los doce metales de transición son de la misma Familia', () => {
    expect(deTransicion.map(familiaDe)).toEqual(deTransicion.map(() => 'Metales de transición'))
  })
})

describe('Historias', () => {
  it('cada metal de transición tiene la Historia de su trozo', () => {
    expect(deTransicion.filter((elemento) => historiaDeTrozo(elemento) === null)).toEqual([])
    expect(deducibles.filter((elemento) => historiaDeTrozo(elemento) !== null)).toEqual([])
  })

  it('cada Grupo que no es de transición tiene su Historia de orden', () => {
    expect(deducibles.filter((elemento) => historiaDeOrden(elemento) === null)).toEqual([])
    expect(deTransicion.filter((elemento) => historiaDeOrden(elemento) !== null)).toEqual([])
  })

  it('trece Elementos tienen Historia de Símbolo', () => {
    const conHistoria = estudiados.filter((elemento) => historiaDeSimbolo(elemento) !== null)

    expect(conHistoria.map((elemento) => elemento.simbolo)).toEqual([
      'Na', 'P', 'S', 'K', 'Fe', 'Cu', 'Ag', 'Sn', 'Sb', 'I', 'Au', 'Hg', 'Pb',
    ])
  })
})

describe('Caminos', () => {
  it.each<Camino>(['gas-noble', 'uso'])('en el Camino %s cada Elemento llega en un trozo y solo en uno', (camino) => {
    const llegados = trozosDe(camino).flat()

    expect(llegados).toHaveLength(56)
    expect(new Set(llegados)).toEqual(new Set(estudiados.map((elemento) => elemento.simbolo)))
  })

  it('desde el gas noble se empieza por el Grupo 18 y se acaba por el Pt', () => {
    const trozos = trozosDe('gas-noble')

    expect(trozos[0]).toEqual(['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn'])
    expect(trozos[1]).toEqual(['H', 'Li', 'Na', 'K', 'Rb', 'Cs', 'Fr'])
    expect(trozos.slice(-5)).toEqual([['Cu', 'Ag', 'Au'], ['Zn', 'Cd', 'Hg'], ['Fe', 'Co', 'Ni'], ['Cr', 'Mn'], ['Pt']])
  })

  it('por uso al formular llegan primero el H y el O juntos, y el Grupo 18 al final', () => {
    const trozos = trozosDe('uso')

    expect(trozos[0]).toEqual(['H', 'O'])
    expect(trozos[1]).toEqual(['Li', 'Na', 'K', 'Rb', 'Cs', 'Fr'])
    expect(trozos.at(-1)).toEqual(['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn'])
  })

  it('por Grupo, un Elemento va con su Grupo entero, y un metal de transición con su trozo', () => {
    expect(trozoPorGrupoDe(elementoDe('O'))).toEqual(['O', 'S', 'Se', 'Te', 'Po'])
    expect(trozoPorGrupoDe(elementoDe('Na'))).toEqual(['H', 'Li', 'Na', 'K', 'Rb', 'Cs', 'Fr'])
    expect(trozoPorGrupoDe(elementoDe('Ag'))).toEqual(['Cu', 'Ag', 'Au'])
  })
})
