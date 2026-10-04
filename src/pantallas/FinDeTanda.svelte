<script lang="ts">
  import type { Estudio, Tanda } from '../estudio/estudio'
  import { fechaLarga } from './fecha'

  interface Props {
    tanda: Tanda
    estudio: Estudio
    alSeguir: () => void
    alVolver: () => void
  }

  let { tanda, estudio, alSeguir, alVolver }: Props = $props()

  const anuncio = $derived(estudio.anuncio())
  const proximaVuelta = $derived(estudio.proximaVuelta())
</script>

<main>
  <h1>Tanda terminada</h1>

  <p class="sabidos">
    <span aria-hidden="true">✓</span>
    {tanda.sabidos.length}
    {tanda.sabidos.length === 1 ? 'elemento sabido' : 'elementos sabidos'}
  </p>
  {#if tanda.vuelven.length > 0}
    <p class="vuelven"><span aria-hidden="true">✗</span> Vuelven mañana: {tanda.vuelven.join(', ')}</p>
  {/if}

  {#if anuncio}
    <p>
      Queda otra tanda: {anuncio.repaso} de repaso · {anuncio.nuevos}
      {anuncio.nuevos === 1 ? 'nuevo' : 'nuevos'} · unos {anuncio.minutos} min
    </p>
    <button type="button" class="boton" onclick={alSeguir}>Otra tanda</button>
  {:else if proximaVuelta}
    <p>Hoy no queda nada. Lo siguiente vuelve el {fechaLarga(proximaVuelta)}.</p>
  {/if}
  <button type="button" class="boton secundario" onclick={alVolver}>Portada</button>
</main>

<style>
  main {
    max-width: 960px;
    margin: 0 auto;
    padding: 16px 12px 40px;
  }

  h1 {
    margin: 0 0 12px;
    font-size: 24px;
  }

  .sabidos span {
    color: var(--acierto);
  }

  .vuelven span {
    color: var(--fallo);
  }
</style>
