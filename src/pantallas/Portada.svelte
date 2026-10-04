<script lang="ts">
  import { descripcionDeCamino, etiquetaDeCamino, type Camino } from '../catalogo/caminos'
  import { elementoDe } from '../catalogo/catalogo'
  import { etiquetaDePaso, type Estudio } from '../estudio/estudio'
  import Tabla from '../tabla/Tabla.svelte'
  import { textoDelAnuncio, tocaAlgo } from './anuncio'
  import { casillasDelDominio } from './casillas'
  import { fechaLarga } from './fecha'

  interface Props {
    estudio: Estudio
    alEmpezar: () => void
    alExplorar: () => void
  }

  let { estudio, alEmpezar, alExplorar }: Props = $props()

  const CAMINOS = Object.keys(etiquetaDeCamino) as Camino[]

  function mirar() {
    return {
      camino: estudio.camino(),
      entradas: estudio.entradas(),
      resumen: estudio.resumen(),
      proximaVuelta: estudio.proximaVuelta(),
      anuncio: estudio.anuncio(),
    }
  }

  let aLaVista = $state.raw(mirar())
  const { camino, entradas, resumen, proximaVuelta, anuncio } = $derived(aLaVista)

  const casillas = $derived(casillasDelDominio(entradas))
  const conPasosFallados = $derived(Object.entries(entradas).filter(([, entrada]) => entrada.pasosFallados.length > 0))

  function elegir(elegido: Camino) {
    estudio.elegirCamino(elegido)
    aLaVista = mirar()
  }

  function alCambiarLaVisibilidad() {
    if (document.visibilityState === 'visible') aLaVista = mirar()
  }

  let selector: HTMLInputElement
  let leido = $state<string | null>(null)

  function guardarCopia() {
    const enlace = document.createElement('a')
    enlace.href = URL.createObjectURL(new Blob([estudio.copia()], { type: 'application/json' }))
    enlace.download = 'formulalo.json'
    enlace.click()
    URL.revokeObjectURL(enlace.href)
  }

  async function leerArchivo() {
    const archivo = selector.files![0]
    // Sin vaciarlo, elegir otra vez el mismo archivo no dispara change.
    selector.value = ''
    leido = await archivo.text()
  }

  function recuperar() {
    estudio.recuperar(leido!)
    leido = null
    aLaVista = mirar()
  }
</script>

<svelte:document onvisibilitychange={alCambiarLaVisibilidad} />

<main class="pantalla">
  <header>
    <h1>Formúlalo</h1>
    <p>No lo memorices: dedúcelo.</p>
    {#if resumen.sinVer === resumen.total}
      <p class="bienvenida">
        Aprende dónde está cada elemento en la tabla y deduce de ahí su configuración y sus números de oxidación. Cada tanda dura
        unos minutos: primero te presenta un grupo y después te pregunta.
      </p>
    {/if}
  </header>

  <section class="hoy">
    {#if tocaAlgo(anuncio)}
      <button type="button" class="boton" onclick={alEmpezar}>Tanda de hoy</button>
    {:else if proximaVuelta}
      <p><b>Hoy no toca nada.</b> Lo siguiente vuelve el {fechaLarga(proximaVuelta)}.</p>
      <button type="button" class="boton" onclick={alEmpezar}>Tanda de práctica</button>
    {/if}
    <p>{textoDelAnuncio(anuncio)}</p>
    <button type="button" class="boton secundario explorar" onclick={alExplorar}>Explorar</button>
  </section>

  <section class="camino">
    <h2>Camino</h2>
    <select aria-label="Camino" value={camino} onchange={(evento) => elegir(evento.currentTarget.value as Camino)}>
      {#each CAMINOS as opcion (opcion)}
        <option value={opcion}>{etiquetaDeCamino[opcion]}</option>
      {/each}
    </select>
    <p>{descripcionDeCamino[camino]}</p>
  </section>

  <p class="resumen">
    <b>{resumen.sabidos}</b> sabidos · <b>{resumen.flojos}</b> flojos · <b>{resumen.sinVer}</b> sin ver, de {resumen.total}
  </p>

  <div class="a-la-izquierda">
    <Tabla {casillas} />
  </div>

  {#if conPasosFallados.length > 0}
    <section class="donde-se-rompe">
      <h2>Dónde se rompe la cadena</h2>
      <ul>
        {#each conPasosFallados as [simbolo, entrada] (simbolo)}
          <li><b>{simbolo}</b> {elementoDe(simbolo).nombre}: {entrada.pasosFallados.map((paso) => etiquetaDePaso[paso]).join(', ')}</li>
        {/each}
      </ul>
    </section>
  {/if}

  <section>
    <div class="copia">
      <button type="button" class="boton secundario" onclick={guardarCopia}>Guardar copia</button>
      <button type="button" class="boton secundario" onclick={() => selector.click()}>Recuperar copia</button>
      <input bind:this={selector} type="file" accept=".json,application/json" hidden onchange={leerArchivo} />
    </div>
    {#if leido !== null && estudio.esCopia(leido)}
      <p class="aviso">La copia sustituye todo lo estudiado en este navegador.</p>
      <div class="copia">
        <button type="button" class="boton" onclick={recuperar}>Sustituir</button>
        <button type="button" class="boton secundario" onclick={() => (leido = null)}>Cancelar</button>
      </div>
    {:else if leido !== null}
      <p class="aviso" role="alert">Ese archivo no es una copia de Formúlalo. No se ha cambiado nada.</p>
    {/if}
  </section>
</main>

<style>
  h1 {
    margin: 0;
    font-size: 28px;
  }

  header p {
    margin: 4px 0 0;
    color: var(--tenue);
  }

  header .bienvenida {
    margin-top: 12px;
    color: var(--tinta);
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

  .donde-se-rompe ul {
    margin: 0;
    padding-left: 18px;
  }

  select {
    font: inherit;
    color: var(--tinta);
    border: 1px solid var(--borde);
    border-radius: 8px;
    background: var(--papel);
    padding: 10px 12px;
  }

  .camino p {
    margin: 8px 0 0;
    color: var(--tenue);
  }

  .copia {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
  }

  .aviso {
    margin: 16px 0 0;
  }
</style>
