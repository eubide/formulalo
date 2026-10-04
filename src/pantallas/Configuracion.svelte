<script lang="ts">
  import { configuracionDe, ultimoSubnivel, type Elemento } from '../catalogo/catalogo'

  interface Props {
    elemento: Elemento
    siempreAbreviada?: boolean
  }

  let { elemento, siempreAbreviada = false }: Props = $props()

  let elegidaAbreviada = $state(false)

  const abreviada = $derived(siempreAbreviada || elegidaAbreviada)

  const configuracion = $derived(configuracionDe(elemento))
  const subniveles = $derived(abreviada ? configuracion.trasElGasNoble : configuracion.subniveles)
  const resaltado = $derived(ultimoSubnivel(elemento) ? configuracion.subniveles.length - 1 : -1)
  const desplazamiento = $derived(configuracion.subniveles.length - subniveles.length)
</script>

<p class="configuracion">
  {#if abreviada && configuracion.gasNoble}<span>[{configuracion.gasNoble}]</span>{/if}
  {#each subniveles as { capa, letra, electrones }, i (i)}
    <span class:ultimo={i + desplazamiento === resaltado}>{capa}{letra}<sup>{electrones}</sup></span>
  {/each}
  {#if configuracion.gasNoble && !siempreAbreviada}
    <button type="button" class="conmutador" onclick={() => (elegidaAbreviada = !elegidaAbreviada)}>
      {abreviada ? 'Entera' : 'Abreviada'}
    </button>
  {/if}
</p>

<style>
  .configuracion {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 8px;
    margin: 0;
    font-family: ui-monospace, Menlo, monospace;
    font-size: 16px;
  }

  .ultimo {
    padding: 0 3px;
    border-radius: 3px;
    background: var(--ultimo-electron);
    font-weight: 700;
  }

  .conmutador {
    border: 1px solid var(--borde);
    border-radius: 6px;
    background: var(--papel);
    padding: 2px 8px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
  }
</style>
