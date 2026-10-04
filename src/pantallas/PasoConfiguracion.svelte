<script lang="ts">
  import type { Letra, Subnivel } from '../catalogo/catalogo'

  interface Props {
    alResponder: (subnivel: Subnivel) => void
  }

  let { alResponder }: Props = $props()

  const CAPAS = [1, 2, 3, 4, 5, 6, 7]
  const LETRAS: Letra[] = ['s', 'p', 'd']
  const ELECTRONES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  let capa = $state<number | null>(null)
  let letra = $state<Letra | null>(null)
  let electrones = $state<number | null>(null)
</script>

<p>¿En qué subnivel entra su último electrón?</p>

<div class="fila" role="radiogroup" aria-label="Capa">
  <span>Capa</span>
  {#each CAPAS as opcion (opcion)}
    <button type="button" role="radio" aria-checked={capa === opcion} onclick={() => (capa = opcion)}>{opcion}</button>
  {/each}
</div>
<div class="fila" role="radiogroup" aria-label="Subnivel">
  <span>Subnivel</span>
  {#each LETRAS as opcion (opcion)}
    <button type="button" role="radio" aria-checked={letra === opcion} onclick={() => (letra = opcion)}>{opcion}</button>
  {/each}
</div>
<div class="fila" role="radiogroup" aria-label="Electrones">
  <span>Electrones</span>
  {#each ELECTRONES as opcion (opcion)}
    <button type="button" role="radio" aria-checked={electrones === opcion} onclick={() => (electrones = opcion)}>
      {opcion}
    </button>
  {/each}
</div>

<button
  type="button"
  class="boton"
  disabled={capa === null || letra === null || electrones === null}
  onclick={() => alResponder({ capa: capa!, letra: letra!, electrones: electrones! })}
>
  Comprobar{#if capa !== null && letra !== null && electrones !== null}: {capa}{letra}<sup>{electrones}</sup>{/if}
</button>

<style>
  p {
    margin: 0 0 8px;
  }

  .fila {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
  }

  .fila span {
    width: 78px;
    color: var(--tenue);
    font-size: 13px;
  }

  .fila button {
    min-width: 36px;
    min-height: 36px;
    border: 1px solid var(--borde);
    border-radius: 6px;
    background: var(--papel);
    font-family: ui-monospace, Menlo, monospace;
    font-size: 15px;
  }

  .fila button[aria-checked='true'] {
    border-color: var(--acento);
    background: var(--acento);
    color: #fff;
  }

  @media (max-width: 520px) {
    .fila span {
      width: 100%;
    }
  }
</style>
