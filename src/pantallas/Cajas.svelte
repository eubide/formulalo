<script lang="ts">
  import { cajasDe, filasDe, ocupacionDe, ultimoElectronDe, type Flecha, type Sitio } from '../catalogo/cajas'
  import type { Elemento } from '../catalogo/catalogo'
  import { escrito, signo } from './Numeros.svelte'

  interface Props {
    elemento: Elemento
    resuelta?: boolean
  }

  let { elemento, resuelta = false }: Props = $props()

  const ANCHO = 34
  const ENTRE_CAJAS = 4
  const ALTO = 30
  const ARRIBA = 26
  const FICHA = 40
  const PRIMERA_FILA = ARRIBA + 46
  const ENTRE_FILAS = 15
  const ANCHO_CON_FILA_DEL_CERO = 160
  const VOLADOS = '⁰¹²³⁴⁵⁶⁷⁸⁹'
  const FLECHAS: { flecha: Flecha; punta: string }[] = [
    { flecha: 'arriba', punta: '↑' },
    { flecha: 'abajo', punta: '↓' },
  ]

  function clave({ subnivel, orbital, flecha }: Sitio): string {
    return `${subnivel}/${orbital}/${flecha}`
  }

  function volado(numero: number): string {
    return [...String(numero)].map((cifra) => VOLADOS[Number(cifra)]).join('')
  }

  const dibujo = $derived.by(() => {
    const { gasNoble, partes } = cajasDe(elemento)
    const filas = resuelta ? filasDe(elemento) : []
    const ocupadas = new Set(partes.filter((parte) => !parte.recogida).flatMap((parte) => ocupacionDe(parte).map(clave)))
    const huecos = new Set(filas.filter((fila) => fila.numero < 0).flatMap((fila) => fila.marcas.map(clave)))
    const ultimo = clave(ultimoElectronDe(elemento).sitio)
    const centros = new Map<string, number>()
    const fichas: { x: number; texto: string }[] = []
    const cajas: { x: number; ancho: number; rotulo: string; mitades: { x: number; centro: number; punta: string; estado: string }[]; bordes: number[] }[] = []
    let x = 54
    if (gasNoble) {
      fichas.push({ x, texto: `[${gasNoble}]` })
      x += FICHA + 8
    }
    for (const parte of partes) {
      const nombre = `${parte.capa}${parte.letra}`
      const rotulo = `${nombre}${volado(parte.electrones)}`
      if (parte.recogida) {
        fichas.push({ x, texto: rotulo })
        x += FICHA + 8
        continue
      }
      const inicio = x
      const bordes = Array.from({ length: parte.orbitales }, (_, orbital) => inicio + orbital * (ANCHO + ENTRE_CAJAS))
      const mitades = bordes.flatMap((borde, orbital) =>
        FLECHAS.map(({ flecha, punta }, lado) => {
          const sitio = clave({ subnivel: nombre, orbital, flecha })
          const centro = borde + (ANCHO / 2) * lado + ANCHO / 4
          centros.set(sitio, centro)
          const estado = sitio === ultimo ? 'ultimo' : ocupadas.has(sitio) ? 'electron' : huecos.has(sitio) ? 'hueco' : 'vacia'
          return { x: borde + (ANCHO / 2) * lado, centro, punta, estado }
        }),
      )
      const ancho = parte.orbitales * (ANCHO + ENTRE_CAJAS) - ENTRE_CAJAS
      cajas.push({ x: inicio, ancho, rotulo, mitades, bordes })
      x += ancho + 12
    }
    return {
      ancho: Math.max(x - 6, filas.some((fila) => fila.numero === 0) ? ANCHO_CON_FILA_DEL_CERO : 0),
      alto: resuelta ? PRIMERA_FILA + filas.length * ENTRE_FILAS : ARRIBA + ALTO + 8,
      fichas,
      cajas,
      filas: filas.map(({ numero, marcas }, i) => ({
        numero,
        y: PRIMERA_FILA + i * ENTRE_FILAS,
        marcas: marcas.map((marca) => centros.get(clave(marca))!),
      })),
    }
  })
</script>

<svg
  class="cajas"
  viewBox="0 0 {dibujo.ancho} {dibujo.alto}"
  width={dibujo.ancho}
  height={dibujo.alto}
  role="img"
  aria-label="Cajas de {elemento.nombre}"
>
  <rect class="simbolo" x="1" y={ARRIBA - 4} width="44" height={ALTO + 8} rx="6" />
  <text class="letras" x="23" y={ARRIBA + 21}>{elemento.simbolo}</text>

  {#each dibujo.fichas as ficha (ficha.x)}
    <rect class="ficha" x={ficha.x} y={ARRIBA} width={FICHA} height={ALTO} rx="5" />
    <text class="en-ficha" x={ficha.x + FICHA / 2} y={ARRIBA + 20}>{ficha.texto}</text>
  {/each}

  {#each dibujo.cajas as caja (caja.x)}
    <text class="rotulo" x={caja.x + caja.ancho / 2} y={ARRIBA - 8}>{caja.rotulo}</text>
    {#each caja.mitades as mitad (mitad.x)}
      {#if mitad.estado === 'electron' || mitad.estado === 'ultimo'}
        <rect class={mitad.estado} x={mitad.x} y={ARRIBA} width={ANCHO / 2} height={ALTO} />
        <text class="flecha {mitad.estado}" x={mitad.centro} y={ARRIBA + 22}>{mitad.punta}</text>
      {:else if mitad.estado === 'hueco'}
        <text class="flecha hueco" x={mitad.centro} y={ARRIBA + 22}>{mitad.punta}</text>
      {/if}
    {/each}
    {#each caja.bordes as borde (borde)}
      <line class="mitad" x1={borde + ANCHO / 2} y1={ARRIBA} x2={borde + ANCHO / 2} y2={ARRIBA + ALTO} />
      <rect class="orbital" x={borde} y={ARRIBA} width={ANCHO} height={ALTO} />
    {/each}
  {/each}

  {#each dibujo.filas as fila (fila.numero)}
    <text class="numero {signo(fila.numero)}" x="48" y={fila.y + 4}>{escrito(fila.numero)}</text>
    {#each fila.marcas as centro (centro)}
      <line class="marca {signo(fila.numero)}" x1={centro - 7.5} y1={fila.y} x2={centro + 7.5} y2={fila.y} />
    {/each}
    {#if fila.numero === 0}
      <text class="sin-marcas" x="58" y={fila.y + 4}>ni suelta ni coge</text>
    {/if}
  {/each}
</svg>

<style>
  .cajas {
    display: block;
    max-width: 100%;
    height: auto;
  }

  text {
    text-anchor: middle;
    fill: var(--tinta);
  }

  .simbolo {
    fill: var(--papel);
    stroke: var(--tinta);
    stroke-width: 1.6;
  }

  .letras {
    font-size: 18px;
    font-weight: 800;
  }

  .ficha {
    fill: #e3e7ec;
    stroke: #b8bcc2;
  }

  .en-ficha {
    font-size: 11px;
    font-weight: 700;
    fill: var(--tenue);
  }

  .rotulo {
    font-size: 12px;
    font-weight: 800;
  }

  rect.electron {
    fill: var(--positivo);
  }

  rect.ultimo {
    fill: var(--electron-destacado);
  }

  .flecha {
    font-size: 17px;
    font-weight: 600;
    fill: #fff;
  }

  .flecha.ultimo {
    font-size: 21px;
    font-weight: 900;
  }

  .flecha.hueco {
    font-size: 19px;
    font-weight: 800;
    fill: none;
    stroke: var(--negativo);
    stroke-width: 1.3;
    stroke-dasharray: 2 1.6;
  }

  .mitad {
    stroke: #b8bcc2;
  }

  .orbital {
    fill: none;
    stroke: var(--tinta);
    stroke-width: 1.4;
  }

  .numero {
    text-anchor: end;
    font-size: 13px;
    font-weight: 800;
  }

  .numero.negativo {
    fill: var(--negativo);
  }

  .numero.positivo {
    fill: var(--positivo);
  }

  .marca {
    stroke-width: 5;
  }

  .marca.negativo {
    stroke: var(--negativo);
  }

  .marca.positivo {
    stroke: var(--positivo);
  }

  .sin-marcas {
    text-anchor: start;
    font-size: 11px;
    fill: var(--tenue);
  }
</style>
