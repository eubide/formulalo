<script lang="ts">
  import type { Elemento } from '../catalogo/catalogo'
  import Cajas from './Cajas.svelte'
  import Teclado from './Teclado.svelte'

  interface Props {
    elemento?: Elemento
    opciones: number[]
    enunciado?: string
    pideSeguridad?: boolean
    alResponder: (numeros: number[], seguro?: boolean) => void
  }

  let { elemento, opciones, enunciado = '¿Qué números de oxidación tiene?', pideSeguridad = false, alResponder }: Props = $props()

  let elegidos = $state<number[]>([])
  let conAyuda = $state(false)

  function alternar(numero: number) {
    elegidos = elegidos.includes(numero) ? elegidos.filter((otro) => otro !== numero) : [...elegidos, numero]
  }
</script>

<p>{enunciado}</p>

<Teclado {opciones} marcados={elegidos} alAlternar={alternar} />

<div class="botones">
  {#if pideSeguridad}
    <button type="button" class="boton" disabled={elegidos.length === 0} onclick={() => alResponder(elegidos, true)}>Seguro</button>
    <button type="button" class="boton" disabled={elegidos.length === 0} onclick={() => alResponder(elegidos, false)}>Dudo</button>
  {:else}
    <button type="button" class="boton" disabled={elegidos.length === 0} onclick={() => alResponder(elegidos)}>
      Comprobar
    </button>
  {/if}
  {#if elemento && !conAyuda}
    <button type="button" class="boton secundario" onclick={() => (conAyuda = true)}>Ver sus cajas</button>
  {/if}
</div>

{#if elemento && conAyuda}
  <div class="ayuda">
    <small>Sus cajas</small>
    <Cajas {elemento} />
  </div>
{/if}

<style>
  p {
    margin: 10px 0 8px;
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
