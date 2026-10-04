<script lang="ts">
  import { etiquetaDeCamino, type Camino } from '../catalogo/caminos'
  import { elementoDe } from '../catalogo/catalogo'
  import { etiquetaDePaso, type Estudio } from '../estudio/estudio'
  import Tabla, { type Casilla } from '../tabla/Tabla.svelte'
  import { fechaLarga } from './fecha'

  interface Props {
    estudio: Estudio
    alEmpezar: () => void
    alExplorar: () => void
  }

  let { estudio, alEmpezar, alExplorar }: Props = $props()

  const CAMINOS = Object.keys(etiquetaDeCamino) as Camino[]

  let camino = $derived(estudio.camino())

  const entradas = $derived(estudio.entradas())
  const resumen = $derived(estudio.resumen())
  const proximaVuelta = $derived(estudio.proximaVuelta())
  const anuncio = $derived.by(() => {
    void camino
    return estudio.anuncio()
  })

  const casillas = $derived<Record<string, Casilla>>(
    Object.fromEntries(
      Object.entries(entradas).map(([simbolo, entrada]) => [
        simbolo,
        entrada.estado === 'sabido' ? { rotulada: true, clase: elementoDe(simbolo).clase } : { rotulada: true, senal: 'floja' },
      ]),
    ),
  )
  const flojosConFallo = $derived(Object.entries(entradas).filter(([, entrada]) => entrada.pasosFallados.length > 0))

  function elegir(elegido: Camino) {
    estudio.elegirCamino(elegido)
    camino = elegido
  }
</script>

<main>
  <header>
    <h1>Formúlalo</h1>
    <p>La tabla periódica es el mapa: de la posición de cada elemento salen su configuración y sus números de oxidación.</p>
  </header>

  <section class="hoy">
    {#if anuncio}
      <button type="button" class="boton" onclick={alEmpezar}>Tanda de hoy</button>
      <p>
        {anuncio.repaso} de repaso · {anuncio.nuevos} {anuncio.nuevos === 1 ? 'nuevo' : 'nuevos'} · unos {anuncio.minutos} min
      </p>
    {:else if proximaVuelta}
      <p><b>Hoy no toca nada.</b> Lo siguiente vuelve el {fechaLarga(proximaVuelta)}.</p>
    {/if}
    <button type="button" class="boton secundario explorar" onclick={alExplorar}>Explorar</button>
  </section>

  <p class="resumen">
    <b>{resumen.sabidos}</b> sabidos · <b>{resumen.flojos}</b> flojos · <b>{resumen.sinVer}</b> sin ver, de {resumen.total}
  </p>

  <Tabla {casillas} />

  {#if flojosConFallo.length > 0}
    <section class="flojos">
      <h2>Dónde se rompe la cadena</h2>
      <ul>
        {#each flojosConFallo as [simbolo, entrada] (simbolo)}
          <li><b>{simbolo}</b> {elementoDe(simbolo).nombre}: {entrada.pasosFallados.map((paso) => etiquetaDePaso[paso]).join(', ')}</li>
        {/each}
      </ul>
    </section>
  {/if}

  <section class="camino">
    <h2>Camino</h2>
    <div role="radiogroup" aria-label="Camino">
      {#each CAMINOS as opcion (opcion)}
        <button
          type="button"
          role="radio"
          aria-checked={camino === opcion}
          class="boton"
          class:secundario={camino !== opcion}
          onclick={() => elegir(opcion)}
        >
          {etiquetaDeCamino[opcion]}
        </button>
      {/each}
    </div>
  </section>
</main>

<style>
  main {
    max-width: 960px;
    margin: 0 auto;
    padding: 16px 12px 40px;
  }

  h1 {
    margin: 0;
    font-size: 28px;
  }

  header p {
    margin: 4px 0 0;
    color: var(--tenue);
  }

  h2 {
    margin: 24px 0 8px;
    font-size: 15px;
  }

  .hoy {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 14px;
    margin: 20px 0 8px;
  }

  .hoy p {
    margin: 0;
  }

  .explorar {
    margin-left: auto;
  }

  .resumen {
    margin: 12px 0;
  }

  .flojos ul {
    margin: 0;
    padding-left: 18px;
  }

  [role='radiogroup'] {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
</style>
