<script lang="ts">
  import { tiraDe, type Elemento } from '../catalogo/catalogo'
  import { escrito, signo } from './Numeros.svelte'

  interface Props {
    elemento: Elemento
    marcadas?: number[]
    alAlternar?: (numero: number) => void
  }

  let { elemento, marcadas, alAlternar }: Props = $props()

  const tira = $derived(tiraDe(elemento))
  const paradas = $derived(marcadas ?? elemento.numeros)
  const huecosLlenos = $derived(Math.max(0, ...paradas.map((numero) => -numero)))
  const electronesUsados = $derived(Math.max(0, ...paradas))
  const sitios = $derived([
    ...Array.from({ length: tira.huecos }, (_, i) => i - tira.huecos),
    0,
    ...Array.from({ length: tira.electrones }, (_, i) => i + 1),
  ])

  function nombreDe(numero: number): string {
    if (numero === 0) return 'Ni llena ni usa'
    return numero < 0 ? `Hueco ${-numero}` : `Electrón ${numero}`
  }

  function enUso(numero: number): boolean {
    return numero < 0 ? -numero <= huecosLlenos : numero <= electronesUsados
  }
</script>

{#snippet dibujo(numero: number, parada: boolean)}
  {#if numero === 0}
    <span class="simbolo">{elemento.simbolo}</span>
  {:else}
    <span class={numero < 0 ? 'hueco' : 'electron'}></span>
  {/if}
  <span class="cifra">{parada ? escrito(numero) : ''}</span>
{/snippet}

<div class="tira" class:resuelta={!alAlternar}>
  {#each sitios as numero (numero)}
    {@const parada = paradas.includes(numero)}
    {@const enUsoAhora = numero !== 0 && enUso(numero)}
    {#if alAlternar}
      <button
        type="button"
        class="sitio {signo(numero)}"
        class:parada
        class:en-uso={enUsoAhora}
        aria-label={nombreDe(numero)}
        aria-pressed={parada}
        onclick={() => alAlternar(numero)}
      >
        {@render dibujo(numero, parada)}
      </button>
    {:else}
      <span class="sitio {signo(numero)}" class:parada class:en-uso={enUsoAhora}>
        {@render dibujo(numero, parada)}
      </span>
    {/if}
  {/each}
</div>

<style>
  .tira {
    --sitio: min(40px, calc((100vw - 28px) / 9));
    display: flex;
    align-items: flex-start;
  }

  .sitio {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: var(--sitio);
    padding: 4px 0;
    border: 0;
    background: none;
    color: var(--tenue);
    -webkit-tap-highlight-color: transparent;
  }

  .hueco,
  .electron {
    width: calc(var(--sitio) * 0.55);
    height: calc(var(--sitio) * 0.55);
    border-radius: 50%;
    box-sizing: border-box;
  }

  .hueco {
    border: 2px dashed currentColor;
  }

  .electron {
    background: currentColor;
  }

  .simbolo {
    display: grid;
    place-items: center;
    width: calc(var(--sitio) - 4px);
    height: calc(var(--sitio) * 0.8);
    margin-top: calc(var(--sitio) * -0.125);
    border: 1.5px solid var(--tinta);
    border-radius: 6px;
    background: var(--papel);
    color: var(--tinta);
    font-weight: 800;
    box-sizing: border-box;
  }

  .cifra {
    min-height: 18px;
    font-size: 14px;
    font-weight: 800;
  }

  .resuelta .sitio {
    color: #b8bcc2;
  }

  .sitio.en-uso.negativo,
  .sitio.parada.negativo {
    color: var(--negativo);
  }

  .sitio.en-uso.positivo,
  .sitio.parada.positivo {
    color: var(--positivo);
  }

  .sitio.parada:not(.negativo, .positivo) .cifra {
    color: var(--tinta);
  }

  button.sitio.parada .hueco,
  button.sitio.parada .electron,
  button.sitio.parada .simbolo {
    outline: 2px solid var(--acento);
    outline-offset: 2px;
  }
</style>
