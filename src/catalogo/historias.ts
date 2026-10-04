import { esDeTransicion, type Elemento } from './catalogo'

const DE_SIMBOLO: Record<string, string> = {
  Na: 'Como Nacli, el Pokémon de sal: la sal es NaCl, y Na es el sodio.',
  K: 'Como Koffing: empieza por K y lleva gases explosivos. El potasio explota al tocar el agua.',
  Fe: 'Del latín *ferrum*: ferretería, ferrocarril, férreo.',
  Cu: 'Como Cufant: empieza por Cu y tiene el cuerpo de cobre.',
  Ag: 'Del latín *argentum*: Argentina, «el país de la plata».',
  Au: 'Del latín *aurum*: áureo, aureola.',
  Hg: 'Del griego *hydrargyros*, «plata líquida»: agua + plata.',
  Sn: 'Del latín *stannum*: de ahí viene «estaño».',
  Pb: 'Del latín *plumbum*: plomada, plúmbeo.',
  Sb: 'Del latín *stibium*: su mineral se llama estibina.',
  S: 'Del latín *sulfur*: sulfuro, sulfato.',
  P: 'Del griego *phosphoros*, «portador de luz»: se escribía con ph.',
  I: 'Del griego *iodes*, «violeta»: se escribía con i.',
}

const DE_ORDEN: Record<number, string> = {
  1: '«**H**ay **Li**món, **Na**ranja y **K**iwi: **R**o**b**a **C**e**s**tas de **Fr**uta»',
  2: '«**Be**bé **M**a**g**o **Ca**za **S**e**r**pientes **Ba**ilando **Ra**p»',
  13: '«**B**usca **al** **Ga**to **Int**e**l**igente»',
  14: '«**C**asi **Si**empre la **Ge**nte **S**a**n**a del **P**ue**b**lo»',
  15: '«**N**o **P**idas **As**ado: **S**a**b**e a **Bi**zcocho»',
  16: '«**O**so **S**abio: **se** **te** **po**ne delante»',
  17: '«**F**ui a **Cl**ase y **Br**omeé: **I**dea **At**revida»',
  18: '«**He** **Ne**gado **Ar**mar **K**a**r**aokes: **Xe**nia **R**o**n**ca»',
}

const DE_TROZO: { elementos: string[]; historia: string }[] = [
  {
    elementos: ['Cu', 'Ag', 'Au'],
    historia:
      'Grupo 11: se porta como el 1. Los tres tienen +1. La plata se queda ahí; el cobre añade +2 y el oro +3.',
  },
  {
    elementos: ['Zn', 'Cd', 'Hg'],
    historia:
      'Grupo 12: se porta como el 2. Los tres tienen +2. El mercurio, el único metal líquido a temperatura ambiente, se escurre además a +1.',
  },
  {
    elementos: ['Fe', 'Co', 'Ni'],
    historia: 'Tres vecinos seguidos con dos números seguidos: +2 y +3.',
  },
  {
    elementos: ['Cr', 'Mn'],
    historia:
      'Como metales, igual que sus vecinos Fe, Co y Ni: +2 y +3. Como no metales, llegan a su número de grupo: el Cr, grupo 6, a +6; el Mn, grupo 7, a +7, pasando por +4 y +6.',
  },
  {
    elementos: ['Pt'],
    historia: 'Igual que Sn y Pb: los tres metales de +2 y +4.',
  },
]

export function historiaDeSimbolo(elemento: Elemento): string | null {
  return DE_SIMBOLO[elemento.simbolo] ?? null
}

export function historiaDeOrden(elemento: Elemento): string | null {
  return esDeTransicion(elemento) ? null : DE_ORDEN[elemento.grupo]
}

export function historiaDeTrozo(elemento: Elemento): string | null {
  return DE_TROZO.find((trozo) => trozo.elementos.includes(elemento.simbolo))?.historia ?? null
}

export function trozosDeTransicion(): string[][] {
  return DE_TROZO.map((trozo) => trozo.elementos)
}
