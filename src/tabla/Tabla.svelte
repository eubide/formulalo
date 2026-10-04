<script lang="ts" module>
  import type { Clase } from '../catalogo/catalogo'

  export interface Casilla {
    rotulada?: boolean
    clase?: Clase
    senal?: 'iluminada' | 'tentativa' | 'acierto' | 'fallo' | 'floja'
  }
</script>

<script lang="ts">
  import { elementos } from '../catalogo/catalogo'

  interface Props {
    casillas: Record<string, Casilla>
    alTocar?: (simbolo: string) => void
  }

  let { casillas, alTocar }: Props = $props()

  const GRUPOS = Array.from({ length: 18 }, (_, i) => i + 1)
  const PERIODOS = Array.from({ length: 7 }, (_, i) => i + 1)

  const estudiados = new Map(elementos().map((elemento) => [`${elemento.grupo}/${elemento.periodo}`, elemento]))

  function existe(grupo: number, periodo: number): boolean {
    if (periodo === 1) return grupo === 1 || grupo === 18
    if (periodo <= 3) return grupo <= 2 || grupo >= 13
    return true
  }
</script>

<div class="tabla" role="grid" aria-label="Tabla periódica">
  <span></span>
  {#each GRUPOS as grupo (grupo)}
    <span class="cabecera" style:grid-column={grupo + 1}>{grupo}</span>
  {/each}
  {#each PERIODOS as periodo (periodo)}
    <span class="cabecera" style:grid-row={periodo + 1} style:grid-column="1">{periodo}</span>
    {#each GRUPOS as grupo (grupo)}
      {@const elemento = estudiados.get(`${grupo}/${periodo}`)}
      {#if elemento}
        {@const casilla = casillas[elemento.simbolo] ?? {}}
        <button
          type="button"
          class="casilla {casilla.senal ?? ''} {casilla.clase ?? ''}"
          style:grid-row={periodo + 1}
          style:grid-column={grupo + 1}
          disabled={!alTocar}
          aria-label={casilla.rotulada ? elemento.nombre : `Grupo ${grupo}, periodo ${periodo}`}
          onclick={() => alTocar?.(elemento.simbolo)}
        >
          {#if casilla.rotulada}
            <b>{elemento.simbolo}</b>
            <small>{elemento.nombre}</small>
          {/if}
        </button>
      {:else if existe(grupo, periodo)}
        <span class="casilla fuera" style:grid-row={periodo + 1} style:grid-column={grupo + 1}></span>
      {/if}
    {/each}
  {/each}
</div>

<style>
  .tabla {
    --lado: calc((min(100vw, 960px) - 24px) / 18.6);
    display: grid;
    grid-template-columns: calc(var(--lado) * 0.6) repeat(18, var(--lado));
    grid-auto-rows: var(--lado);
    gap: 0;
    justify-content: center;
  }

  .tabla > :first-child {
    grid-row: 1;
    grid-column: 1;
  }

  .cabecera {
    display: grid;
    place-items: center;
    grid-row: 1;
    font-size: clamp(8px, calc(var(--lado) * 0.3), 13px);
    font-weight: 700;
    color: var(--tenue);
  }

  .casilla {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 1px;
    padding: 0;
    min-width: 0;
    overflow: hidden;
    border: 1px solid var(--borde);
    border-radius: 3px;
    background: var(--papel);
    line-height: 1.05;
  }

  .casilla:disabled {
    cursor: default;
    color: inherit;
  }

  .casilla b {
    font-size: clamp(9px, calc(var(--lado) * 0.4), 18px);
  }

  .casilla small {
    max-width: 100%;
    overflow: hidden;
    font-size: clamp(5px, calc(var(--lado) * 0.17), 9px);
    white-space: nowrap;
  }

  .fuera {
    border-color: transparent;
    background: var(--fuera);
  }

  .metal {
    background: var(--clase-metal);
  }

  .metaloide {
    background: var(--clase-metaloide);
  }

  .no-metal {
    background: var(--clase-no-metal);
  }

  .iluminada {
    border: 2px solid var(--acento);
  }

  .tentativa {
    border: 2px dashed var(--acento);
    background: #ecebf5;
  }

  .acierto {
    border: 2px solid var(--acierto);
    background: var(--acierto-fondo);
  }

  .fallo {
    border: 2px solid var(--fallo);
    background: var(--fallo-fondo);
  }

  .floja {
    border-style: dashed;
    border-color: var(--tenue);
  }

  @media (max-width: 520px) {
    .casilla small {
      display: none;
    }
  }
</style>
