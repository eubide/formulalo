<script lang="ts">
  import { onMount } from 'svelte'
  import type { Elemento } from '../catalogo/catalogo'

  interface Props {
    elemento: Elemento
    alSeguir: () => void
  }

  let { elemento, alSeguir }: Props = $props()

  const MILISEGUNDOS_A_LA_VISTA = 1000

  onMount(() => {
    const espera = setTimeout(() => alSeguir(), MILISEGUNDOS_A_LA_VISTA)
    return () => clearTimeout(espera)
  })
</script>

<button type="button" class="acierto" onclick={alSeguir}>
  <span aria-hidden="true">✓</span>
  {elemento.simbolo} · {elemento.nombre}
</button>

<style>
  .acierto {
    display: block;
    width: 100%;
    border: 2px solid var(--acierto);
    border-radius: 10px;
    background: var(--acierto-fondo);
    padding: 12px 14px;
    font-size: 17px;
    font-weight: 700;
    text-align: left;
  }

  span {
    color: var(--acierto);
  }
</style>
