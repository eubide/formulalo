<script lang="ts">
  import type { Estudio, Oleada } from '../estudio/estudio'
  import Tabla from '../tabla/Tabla.svelte'
  import { textoDelAnuncio, textoDelRepaso } from './anuncio'
  import { casillasDelDominio } from './casillas'

  interface Props {
    oleada: Oleada
    estudio: Estudio
    alSeguir: () => void
    alVolver: () => void
  }

  let { oleada, estudio, alSeguir, alVolver }: Props = $props()

  function mirar() {
    return {
      anuncio: estudio.anuncio(),
      proximaVuelta: estudio.proximaVuelta(),
      entradas: estudio.entradas(),
      vueltas: estudio.vueltas(oleada),
    }
  }

  let aLaVista = $state.raw(mirar())
  const { anuncio, proximaVuelta, entradas, vueltas } = $derived(aLaVista)

  const porRepasar = $derived(textoDelRepaso(anuncio, proximaVuelta))
  const casillas = $derived.by(() => {
    const mapa = casillasDelDominio(entradas)
    for (const simbolo of oleada.rotulados) mapa[simbolo] = { ...mapa[simbolo], senal: 'iluminada' }
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
  <h1>Oleada terminada</h1>

  <p class="sabidos">
    <span aria-hidden="true">✓</span>
    {oleada.sabidos.length}
    {oleada.sabidos.length === 1 ? 'acertado hoy' : 'acertados hoy'}
  </p>
  <p>{cuandoVuelven}</p>

  <div class="a-la-izquierda">
    <Tabla {casillas} />
  </div>

  <section>
    <p>Siguiente: {textoDelAnuncio(anuncio)}</p>
    {#if porRepasar}
      <p>{porRepasar}</p>
    {/if}
    <button type="button" class="boton" onclick={alSeguir}>Otra oleada</button>
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
