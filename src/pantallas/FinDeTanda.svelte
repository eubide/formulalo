<script lang="ts">
  import type { Estudio, Tanda } from '../estudio/estudio'
  import Tabla from '../tabla/Tabla.svelte'
  import { textoDelAnuncio, tocaAlgo } from './anuncio'
  import { casillasDelDominio } from './casillas'
  import { fechaLarga } from './fecha'

  interface Props {
    tanda: Tanda
    estudio: Estudio
    alSeguir: () => void
    alVolver: () => void
  }

  let { tanda, estudio, alSeguir, alVolver }: Props = $props()

  function mirar() {
    return {
      anuncio: estudio.anuncio(),
      proximaVuelta: estudio.proximaVuelta(),
      entradas: estudio.entradas(),
      vueltas: estudio.vueltas(tanda),
    }
  }

  let aLaVista = $state.raw(mirar())
  const { anuncio, proximaVuelta, entradas, vueltas } = $derived(aLaVista)

  const casillas = $derived.by(() => {
    const mapa = casillasDelDominio(entradas)
    for (const simbolo of tanda.rotulados) mapa[simbolo] = { ...mapa[simbolo], senal: 'iluminada' }
    return mapa
  })
  const cuandoVuelven = $derived(
    vueltas
      .map(({ dias, simbolos }) => `${dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `En ${dias} días`}: ${simbolos.join(', ')}`)
      .join(' · '),
  )

  function alCambiarLaVisibilidad() {
    if (document.visibilityState === 'visible') aLaVista = mirar()
  }
</script>

<svelte:document onvisibilitychange={alCambiarLaVisibilidad} />

<main class="pantalla">
  <h1>Tanda terminada</h1>

  <p class="sabidos">
    <span aria-hidden="true">✓</span>
    {tanda.sabidos.length}
    {tanda.sabidos.length === 1 ? 'elemento sabido' : 'elementos sabidos'}
  </p>
  <p>{cuandoVuelven}</p>

  <div class="a-la-izquierda">
    <Tabla {casillas} />
  </div>

  <section>
    {#if tocaAlgo(anuncio)}
      <p>Queda otra tanda: {textoDelAnuncio(anuncio)}</p>
      <button type="button" class="boton" onclick={alSeguir}>Otra tanda</button>
    {:else if proximaVuelta}
      <p>Hoy no queda nada. Lo siguiente vuelve el {fechaLarga(proximaVuelta)}.</p>
      <button type="button" class="boton" onclick={alSeguir}>Tanda de práctica</button>
      <p>{textoDelAnuncio(anuncio)}</p>
    {/if}
    <button type="button" class="boton secundario" onclick={alVolver}>Portada</button>
  </section>
</main>

<style>
  h1 {
    margin: 0 0 12px;
    font-size: 24px;
  }

  .sabidos span {
    color: var(--acierto);
  }
</style>
