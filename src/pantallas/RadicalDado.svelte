<script lang="ts">
  import { formulaDe, type Radical } from '../catalogo/radicales'

  interface Props {
    radical: Radical
    enseña: 'formula' | 'nombre' | 'los dos'
  }

  let { radical, enseña }: Props = $props()
</script>

<div class="radical">
  <small>Radical</small>
  {#if enseña === 'nombre'}
    <b>{radical.nombre}</b>
  {:else}
    <b>{formulaDe(radical)}</b>
    {#if enseña === 'los dos'}<span>{radical.nombre}</span>{/if}
  {/if}
</div>

<style>
  small {
    display: block;
    color: var(--tenue);
    font-size: 13px;
    font-weight: 600;
  }

  b {
    font-size: 34px;
  }

  span {
    margin-left: 8px;
    color: var(--tenue);
    font-size: 18px;
  }
</style>
