<script lang="ts">
  import { descripcionDeCamino, etiquetaDeCamino, type Camino } from '../catalogo/caminos'
  import { elementoDe } from '../catalogo/catalogo'
  import { descripcionDeModo, etiquetaDeModo, type Modo } from '../catalogo/modos'
  import { etiquetaDePaso, type Estudio } from '../estudio/estudio'
  import Tabla from '../tabla/Tabla.svelte'
  import { textoDeLoQueTrae, textoDeLoVisto, textoDelAnuncio, textoDelRepaso, textoDelSeguimiento } from './anuncio'
  import { casillasDelDominio } from './casillas'

  interface Props {
    estudio: Estudio
    alEmpezar: () => void
    alExplorar: () => void
    alDictado: () => void
    alRadicales: () => void
  }

  let { estudio, alEmpezar, alExplorar, alDictado, alRadicales }: Props = $props()

  const CAMINOS = Object.keys(etiquetaDeCamino) as Camino[]
  const MODOS = Object.keys(etiquetaDeModo) as Modo[]

  function mirar() {
    return {
      camino: estudio.camino(),
      entradas: estudio.entradas(),
      resumen: estudio.resumen(),
      proximaVuelta: estudio.proximaVuelta(),
      anuncio: estudio.anuncio(),
      delDictado: estudio.resumenDelDictado(),
      siguienteDictado: estudio.anuncioDelDictado(),
      deRadicales: estudio.resumenDeRadicales(),
      siguientesRadicales: estudio.anuncioDeRadicales(),
      seguimiento: estudio.seguimiento(),
      modo: estudio.modo(),
      primeraVez: estudio.esPrimeraVez(),
    }
  }

  let aLaVista = $state.raw(mirar())
  const { camino, entradas, resumen, proximaVuelta, anuncio, delDictado, siguienteDictado, deRadicales, siguientesRadicales, seguimiento, modo, primeraVez } =
    $derived(aLaVista)

  const casillas = $derived(casillasDelDominio(entradas))
  const porRepasar = $derived(textoDelRepaso(anuncio, proximaVuelta))
  const conPasosFallados = $derived(Object.entries(entradas).filter(([, entrada]) => entrada.pasosFallados.length > 0))

  function elegir(elegido: Camino) {
    estudio.elegirCamino(elegido)
    aLaVista = mirar()
  }

  function elegirModo(elegido: Modo) {
    estudio.elegirModo(elegido)
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

<main class="pantalla" class:sola={primeraVez}>
  <header>
    <h1>Formúlalo</h1>
    <p>No lo memorices: dedúcelo.</p>
    {#if resumen.sinVer === resumen.total}
      <p class="bienvenida">
        Aprende dónde está cada elemento en la tabla y deduce de ahí sus números de oxidación, para poder formular. Cada oleada dura
        unos minutos: primero te presenta unos elementos, después te pregunta y acaba con fórmulas.
      </p>
    {/if}
  </header>

  <section class="ejercicios">
    {#if !primeraVez}
      <div class="modo">
        <h2>Modo</h2>
        <div class="selector" role="radiogroup" aria-label="Modo">
          {#each MODOS as opcion (opcion)}
            <button type="button" role="radio" aria-checked={modo === opcion} onclick={() => elegirModo(opcion)}>
              {etiquetaDeModo[opcion]}
            </button>
          {/each}
        </div>
        <p class="tenue">{descripcionDeModo[modo]}</p>
      </div>
    {/if}

    <article class="ejercicio oleada">
      <h2>Oleada</h2>
      <p>Elemento a elemento: dónde está, qué es y sus números.</p>
      <button type="button" class="boton" onclick={alEmpezar}>Nueva oleada</button>
      <p class="trae">{textoDelAnuncio(anuncio)}</p>
      {#if porRepasar}
        <p class="tenue">{porRepasar}</p>
      {/if}

      {#if !primeraVez && resumen.sinVer > 0}
        <div class="ajustes">
          <h3>Camino</h3>
          <select aria-label="Camino" value={camino} onchange={(evento) => elegir(evento.currentTarget.value as Camino)}>
            {#each CAMINOS as opcion (opcion)}
              <option value={opcion}>{etiquetaDeCamino[opcion]}</option>
            {/each}
          </select>
          <p class="tenue">{descripcionDeCamino[camino]}</p>
        </div>
      {/if}
    </article>

    {#if !primeraVez}
      <article class="ejercicio">
        <h2>Dictado</h2>
        <p>Solo los números de oxidación, por bloques.</p>
        <button type="button" class="boton" onclick={alDictado}>Nuevo dictado</button>
        <p class="trae">{textoDeLoQueTrae('Bloques', siguienteDictado)}</p>
        <p class="tenue">{textoDeLoVisto('bloques', delDictado)}</p>
      </article>

      <article class="ejercicio">
        <h2>Radicales</h2>
        <p>Iones como ClO₃⁻, el clorato: escribe su nombre o su fórmula y calcula su número.</p>
        <button type="button" class="boton" onclick={alRadicales}>Nuevos radicales</button>
        <p class="trae">{textoDeLoQueTrae('Radicales', siguientesRadicales)}</p>
        <p class="tenue">{textoDeLoVisto('radicales', deRadicales)}</p>
      </article>
    {/if}
  </section>

  {#if !primeraVez}
    <section class="avance">
      <h2>Tu avance</h2>
      <p>
        <b>{resumen.sabidos}</b> {resumen.sabidos === 1 ? 'sabido' : 'sabidos'} · <b>{resumen.flojos}</b>
        {resumen.flojos === 1 ? 'flojo' : 'flojos'} · <b>{resumen.sinVer}</b> sin ver, de {resumen.total}
      </p>
      {#if seguimiento}
        <p class="tenue">{textoDelSeguimiento(seguimiento)}</p>
      {/if}
    </section>

    <div class="a-la-izquierda">
      <Tabla {casillas} />
      <button type="button" class="boton secundario explorar" onclick={alExplorar}>Explorar la tabla</button>
    </div>
  {/if}

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
    {#if !primeraVez}
      <h2>Copia</h2>
      <p class="tenue">Lo estudiado se guarda solo en este navegador.</p>
    {/if}
    <div class="copia">
      {#if !primeraVez}
        <button type="button" class="boton secundario" onclick={guardarCopia}>Guardar copia</button>
      {/if}
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
  .pantalla.sola {
    display: block;
    max-width: 520px;
  }

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

  h3 {
    margin: 12px 0 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--tenue);
  }

  .ejercicios {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 10px;
    margin: 18px 0 0;
  }

  .ejercicio {
    display: flex;
    flex-direction: column;
    gap: 6px;
    border: 1px solid var(--borde);
    border-radius: 10px;
    background: var(--papel);
    padding: 12px 14px;
  }

  .ejercicio h2 {
    margin: 0;
    font-size: 18px;
  }

  .ejercicio p {
    margin: 0;
  }

  .ejercicio .boton {
    margin: 4px 0;
  }

  .ejercicio .trae {
    font-weight: 600;
  }

  .tenue {
    color: var(--tenue);
    font-size: 14px;
  }

  .oleada {
    grid-column: 1 / -1;
  }

  .ajustes {
    border-top: 1px solid var(--borde);
    margin-top: 6px;
    padding-top: 2px;
  }

  .modo {
    grid-column: 1 / -1;
  }

  .modo h2 {
    margin: 0 0 6px;
  }

  .modo p,
  .ajustes p,
  .avance p {
    margin: 6px 0 0;
  }

  .avance {
    margin-bottom: 12px;
  }

  .explorar {
    display: block;
    margin: 10px 0 0 auto;
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

  .selector {
    display: inline-flex;
    border: 1px solid var(--borde);
    border-radius: 8px;
    overflow: hidden;
  }

  .selector button {
    border: 0;
    background: var(--papel);
    padding: 10px 14px;
  }

  .selector button + button {
    border-left: 1px solid var(--borde);
  }

  .selector button[aria-checked='true'] {
    background: #000;
    color: #fff;
    font-weight: 600;
  }

  .copia {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  .aviso {
    margin: 16px 0 0;
  }
</style>
