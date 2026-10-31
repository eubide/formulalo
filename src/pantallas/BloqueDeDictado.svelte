<script lang="ts">
  import type { Elemento } from '../catalogo/catalogo'
  import { TECLADO } from '../estudio/estudio'
  import { casillasDeBloque } from './casillas'
  import Numeros from './Numeros.svelte'
  import TablaDeRefuerzo from './TablaDeRefuerzo.svelte'
  import Teclado from './Teclado.svelte'

  interface Props {
    elementos: Elemento[]
    dadoPor: 'simbolo' | 'nombre'
    pideSeguridad?: boolean
    alResponder: (respuesta: number[][], seguro?: boolean) => void
  }

  let { elementos, dadoPor, pideSeguridad = false, alResponder }: Props = $props()

  let marcados = $state<Record<string, number[]>>({})
  let fila = $state(0)

  const delElemento = (elemento: Elemento) => marcados[elemento.simbolo] ?? []
  const actual = $derived(elementos[fila])
  const completo = $derived(elementos.every((elemento) => delElemento(elemento).length > 0))

  function alternar(numero: number) {
    const puestos = delElemento(actual)
    marcados[actual.simbolo] = puestos.includes(numero)
      ? puestos.filter((otro) => otro !== numero)
      : [...puestos, numero].sort((a, b) => a - b)
  }
</script>

<p>Toca cada elemento y marca sus números de oxidación.</p>

<ul class="filas">
  {#each elementos as elemento, indice (elemento.simbolo)}
    <li>
      <button type="button" aria-pressed={indice === fila} onclick={() => (fila = indice)}>
        <b>{dadoPor === 'simbolo' ? elemento.simbolo : elemento.nombre}</b>
        <span><Numeros numeros={delElemento(elemento)} /></span>
      </button>
    </li>
  {/each}
</ul>

<Teclado opciones={TECLADO} marcados={delElemento(actual)} alAlternar={alternar} />

{#if pideSeguridad}
  <div class="botones">
    <button type="button" class="boton" disabled={!completo} onclick={() => alResponder(elementos.map(delElemento), true)}>Seguro</button>
    <button type="button" class="boton" disabled={!completo} onclick={() => alResponder(elementos.map(delElemento), false)}>Dudo</button>
  </div>
{:else}
  <button type="button" class="boton" disabled={!completo} onclick={() => alResponder(elementos.map(delElemento))}>Comprobar</button>
{/if}

<TablaDeRefuerzo casillas={casillasDeBloque(elementos, actual)} />

<style>
  .botones {
    display: flex;
    gap: 8px;
  }

  p {
    margin: 10px 0 8px;
  }

  .filas {
    display: grid;
    gap: 6px;
    margin: 0 0 12px;
    padding: 0;
    list-style: none;
  }

  .filas button {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 40px;
    padding: 4px 10px;
    border: 2px solid var(--borde);
    border-radius: 8px;
    background: var(--papel);
    text-align: left;
  }

  .filas button[aria-pressed='true'] {
    border-color: var(--acento);
    box-shadow: inset 0 0 0 1px var(--acento);
  }

  .filas b {
    min-width: 34px;
  }
</style>
