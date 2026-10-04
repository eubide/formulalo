<script lang="ts">
  import type { Elemento } from '../catalogo/catalogo'
  import Cajas from './Cajas.svelte'
  import { escrito, signo } from './Numeros.svelte'

  interface Props {
    elemento: Elemento
    opciones: number[]
    alResponder: (numeros: number[]) => void
  }

  let { elemento, opciones, alResponder }: Props = $props()

  let elegidos = $state<number[]>([])
  let conAyuda = $state(false)

  function alternar(numero: number) {
    elegidos = elegidos.includes(numero) ? elegidos.filter((otro) => otro !== numero) : [...elegidos, numero]
  }
</script>

<p>¿Qué números de oxidación tiene?</p>

<div class="opciones">
  {#each opciones as numero (numero)}
    <button
      type="button"
      class={signo(numero)}
      aria-pressed={elegidos.includes(numero)}
      onclick={() => alternar(numero)}
    >
      {escrito(numero)}
    </button>
  {/each}
</div>

<div class="botones">
  <button type="button" class="boton" disabled={elegidos.length === 0} onclick={() => alResponder(elegidos)}>
    Comprobar
  </button>
  {#if !conAyuda}
    <button type="button" class="boton secundario" onclick={() => (conAyuda = true)}>No lo sé</button>
  {/if}
</div>

{#if conAyuda}
  <div class="ayuda">
    <small>Sus cajas</small>
    <Cajas {elemento} />
  </div>
{/if}

<style>
  p {
    margin: 10px 0 8px;
  }

  .opciones {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .opciones button {
    min-width: 52px;
    min-height: 44px;
    border: 2px solid var(--borde);
    border-radius: 8px;
    background: var(--papel);
    font-size: 18px;
    font-weight: 700;
  }

  .opciones button[aria-pressed='true'] {
    border-color: currentColor;
    box-shadow: inset 0 0 0 2px currentColor;
  }

  .botones {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ayuda {
    margin-top: 12px;
    padding: 8px 10px;
    border: 1px dashed var(--borde);
    border-radius: 8px;
    background: var(--papel);
  }

  .ayuda small {
    color: var(--tenue);
  }
</style>
