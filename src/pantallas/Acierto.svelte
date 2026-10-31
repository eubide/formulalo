<script lang="ts">
  import { onMount } from 'svelte'
  import type { Elemento } from '../catalogo/catalogo'

  interface Props {
    elemento: Elemento
    comentario?: string | null
    alSeguir: () => void
  }

  let { elemento, comentario = null, alSeguir }: Props = $props()

  const MILISEGUNDOS_A_LA_VISTA = 1000
  const MILISEGUNDOS_CON_COMENTARIO = 2500

  onMount(() => {
    const espera = setTimeout(() => alSeguir(), comentario ? MILISEGUNDOS_CON_COMENTARIO : MILISEGUNDOS_A_LA_VISTA)
    return () => clearTimeout(espera)
  })
</script>

<button type="button" class="acierto" onclick={alSeguir}>
  <span aria-hidden="true">✓</span>
  {elemento.simbolo} · {elemento.nombre}{#if comentario}<small>{comentario}</small>{/if}
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

  small {
    display: block;
    margin-top: 4px;
    font-size: 15px;
    font-weight: 400;
  }
</style>
