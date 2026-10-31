<script lang="ts">
  import { elementoDe } from '../catalogo/catalogo'
  import { cuentaDeCompuesto, formulaDeCompuesto } from '../catalogo/compuestos'
  import { PIEZAS, TECLADO, type Formulando, type Pieza, type RespuestaDePieza } from '../estudio/estudio'
  import Numeros from './Numeros.svelte'
  import Teclado from './Teclado.svelte'

  interface Props {
    formulando: Formulando
    alResponder: (respuesta: RespuestaDePieza) => void
    alSeguir: () => void
    alSalir: () => void
  }

  let { formulando, alResponder, alSeguir, alSalir }: Props = $props()

  const ETIQUETAS: Record<Pieza, string> = { simbolos: 'Símbolos', numeros: 'Números', formula: 'Fórmula' }

  const { compuesto, pieza, fase, fallos, escrito, pendientes } = $derived(formulando)
  const { positivo, negativo } = $derived(compuesto)

  let primerSimbolo = $state('')
  let segundoSimbolo = $state('')
  let numeroPositivo = $state<number | null>(null)
  let numeroNegativo = $state<number | null>(null)
  let enElPositivo = $state(true)
  let formula = $state('')
  const marcado = $derived(enElPositivo ? numeroPositivo : numeroNegativo)

  function marcaDe(cual: Pieza): string {
    if (fallos.includes(cual)) return '✗'
    return fase === 'resuelto' || PIEZAS.indexOf(cual) < PIEZAS.indexOf(pieza) ? '✓' : '·'
  }

  function marcar(numero: number) {
    if (enElPositivo) {
      numeroPositivo = numero
      enElPositivo = false
    } else {
      numeroNegativo = numero
    }
  }

  function comprobarSimbolos(evento: SubmitEvent) {
    evento.preventDefault()
    alResponder({ pieza: 'simbolos', simbolos: [primerSimbolo, segundoSimbolo] })
    primerSimbolo = segundoSimbolo = ''
  }

  function comprobarNumeros() {
    alResponder({ pieza: 'numeros', positivo: numeroPositivo!, negativo: numeroNegativo! })
    numeroPositivo = numeroNegativo = null
    enElPositivo = true
  }

  function comprobarFormula(evento: SubmitEvent) {
    evento.preventDefault()
    alResponder({ pieza: 'formula', formula })
    formula = ''
  }

  function enfocar(caja: HTMLInputElement) {
    caja.focus()
  }
</script>

<main class="pantalla formular">
  <header>
    <b>{compuesto.nombre}</b>
    <button type="button" class="salir" onclick={alSalir}>Salir</button>
  </header>

  <ol class="piezas">
    {#each PIEZAS as cual (cual)}
      <li class:actual={fase !== 'resuelto' && cual === pieza}><span aria-hidden="true">{marcaDe(cual)}</span> {ETIQUETAS[cual]}</li>
    {/each}
    <li class="quedan">Quedan {pendientes.length + 1}</li>
  </ol>

  {#if fase === 'resuelto'}
    {@const acertada = !fallos.includes('formula')}
    <section class="resultado" class:acertada>
      <h2><span aria-hidden="true">{acertada ? '✓' : '✗'}</span> {formulaDeCompuesto(compuesto)}</h2>
      {#if !acertada}
        <p>Escribiste: <b>{escrito}</b></p>
      {/if}
      <p>Las cargas se anulan: {cuentaDeCompuesto(compuesto)}.</p>
      <button type="button" class="boton" onclick={alSeguir}>Seguir</button>
    </section>
  {:else if fase === 'correccion'}
    <section class="resultado">
      {#if pieza === 'simbolos'}
        <h2>
          <span aria-hidden="true">✗</span>
          Los Símbolos son {positivo.simbolo} ({elementoDe(positivo.simbolo).nombre}) y {negativo.simbolo} ({elementoDe(negativo.simbolo).nombre}).
        </h2>
      {:else}
        <h2>
          <span aria-hidden="true">✗</span>
          Los números son {positivo.simbolo} <Numeros numeros={[positivo.numero]} /> y {negativo.simbolo} <Numeros numeros={[negativo.numero]} />.
        </h2>
      {/if}
      <button type="button" class="boton" onclick={alSeguir}>Seguir</button>
    </section>
  {:else if pieza === 'simbolos'}
    <form onsubmit={comprobarSimbolos}>
      <label for="primer-simbolo">¿Qué dos Símbolos lleva?</label>
      <div class="simbolos">
        <input id="primer-simbolo" use:enfocar bind:value={primerSimbolo} type="text" autocomplete="off" autocapitalize="off" spellcheck="false" />
        <input aria-label="Segundo Símbolo" bind:value={segundoSimbolo} type="text" autocomplete="off" autocapitalize="off" spellcheck="false" />
      </div>
      <button type="submit" class="boton" disabled={primerSimbolo.trim() === '' || segundoSimbolo.trim() === ''}>Comprobar</button>
    </form>
  {:else if pieza === 'numeros'}
    <p>¿Qué número de oxidación lleva cada uno?</p>
    <ul class="filas">
      <li>
        <button type="button" aria-pressed={enElPositivo} onclick={() => (enElPositivo = true)}>
          <b>{positivo.simbolo}</b>
          <span><Numeros numeros={numeroPositivo === null ? [] : [numeroPositivo]} /></span>
        </button>
      </li>
      <li>
        <button type="button" aria-pressed={!enElPositivo} onclick={() => (enElPositivo = false)}>
          <b>{negativo.simbolo}</b>
          <span><Numeros numeros={numeroNegativo === null ? [] : [numeroNegativo]} /></span>
        </button>
      </li>
    </ul>
    <Teclado opciones={TECLADO} marcados={marcado === null ? [] : [marcado]} alAlternar={marcar} />
    <button type="button" class="boton" disabled={numeroPositivo === null || numeroNegativo === null} onclick={comprobarNumeros}>Comprobar</button>
  {:else}
    <form onsubmit={comprobarFormula}>
      <p>{positivo.simbolo} <Numeros numeros={[positivo.numero]} /> · {negativo.simbolo} <Numeros numeros={[negativo.numero]} /></p>
      <label for="formula">Las cargas tienen que sumar 0. ¿Cuál es su fórmula?</label>
      <input id="formula" use:enfocar bind:value={formula} type="text" autocomplete="off" autocapitalize="off" spellcheck="false" />
      <small>Da igual mayúsculas o minúsculas. Los subíndices, como números normales.</small>
      <button type="submit" class="boton" disabled={formula.trim() === ''}>Comprobar</button>
    </form>
  {/if}
</main>

<style>
  .pantalla.formular {
    display: block;
    max-width: 520px;
  }

  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }

  header b {
    font-size: 24px;
  }

  .piezas {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    margin: 6px 0 12px;
    padding: 0;
    list-style: none;
    font-size: 13px;
    color: var(--tenue);
  }

  .piezas .actual {
    color: var(--tinta);
    font-weight: 700;
  }

  .piezas .quedan {
    margin-left: auto;
  }

  form {
    display: grid;
    gap: 8px;
    margin: 10px 0 12px;
    justify-items: start;
  }

  form p {
    margin: 0;
  }

  .simbolos {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  input {
    width: 100%;
    box-sizing: border-box;
    border: 2px solid var(--borde);
    border-radius: 8px;
    background: var(--papel);
    padding: 10px 12px;
    font: inherit;
    font-size: 20px;
    color: var(--tinta);
  }

  small {
    color: var(--tenue);
  }

  .filas {
    display: grid;
    gap: 6px;
    margin: 0 0 12px;
    padding: 0;
    list-style: none;
  }

  .filas button {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 40px;
    padding: 4px 10px;
    border: 2px solid var(--borde);
    border-radius: 8px;
    background: var(--papel);
    text-align: left;
  }

  .filas button[aria-pressed='true'] {
    border-color: var(--acento);
    box-shadow: inset 0 0 0 1px var(--acento);
  }

  .filas b {
    min-width: 34px;
  }

  .resultado {
    border: 2px solid var(--fallo);
    border-radius: 10px;
    background: var(--fallo-fondo);
    padding: 12px 14px;
  }

  .resultado.acertada {
    border-color: var(--acierto);
    background: var(--acierto-fondo);
  }

  h2 {
    margin: 0 0 6px;
    font-size: 17px;
  }

  h2 span {
    color: var(--fallo);
  }

  .acertada h2 span {
    color: var(--acierto);
  }

  p {
    margin: 4px 0;
  }

  .resultado .boton {
    margin-top: 10px;
  }
</style>
