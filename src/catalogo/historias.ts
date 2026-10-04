import { esDeTransicion, type Elemento } from './catalogo'

const DE_SIMBOLO: Record<string, string> = {
  Na: 'Del latín *natrium*, por el natrón, una sal de sodio.',
  K: 'Del latín *kalium*, la misma raíz árabe que «álcali».',
  Fe: 'Del latín *ferrum*: ferretería, ferrocarril, férreo.',
  Cu: 'Del latín *cuprum*, «metal de Chipre».',
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
  1: '«**H**ay **Li**món, **Na**ranja y **K**iwi: el **R**o**b**ot **C**o**s**echa **Fr**esas»',
  2: '«**Be**bé **M**a**g**o **Ca**brea **S**e**r**pientes **Ba**ilando con la **Ra**dio»',
  13: '«**B**usca **Al** **Ga**mberro: **In**undó el **T**a**l**ler»',
  14: '«**C**opio **Si**empre al **Ge**nio: **S**i**n** **P**ro**b**lemas»',
  15: '«**N**o **P**idas **As**ado: **S**a**b**e a **Bi**zcocho»',
  16: '«**O**so **S**invergüenza: **Se** **Te** **Po**ne chulo»',
  17: '«**F**ui a **Cl**ase en **Br**agas: **I**dea **At**roz»',
  18: '«**He** **Ne**gado **Ar**mar al **Kr**aken: **Xe**rneas **R**o**n**ca»',
}

const DE_TROZO: { elementos: string[]; historia: string }[] = [
  {
    elementos: ['Cu', 'Ag', 'Au'],
    historia:
      'El podio: las tres medallas tienen +1. La plata, solo eso. El cobre añade +2 y el oro, que para eso gana, +3.',
  },
  {
    elementos: ['Zn', 'Cd', 'Hg'],
    historia:
      'Grupo 12, como el 2: los tres tienen +2. El mercurio es líquido y no para quieto: se escurre además a +1.',
  },
  {
    elementos: ['Fe', 'Co', 'Ni'],
    historia: 'Tres vecinos de pupitre que se copian: los tres ponen dos números seguidos, +2 y +3.',
  },
  {
    elementos: ['Cr', 'Mn'],
    historia:
      'Tienen dos caras. De metales copian a Fe, Co y Ni: +2 y +3. De no metales suben a su número de grupo: el Cr, grupo 6, a +6; el Mn, grupo 7, a +7, pasando por +4 y +6.',
  },
  {
    elementos: ['Pt'],
    historia: 'El platino copia de lejos: +2 y +4, como el Sn y el Pb.',
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
