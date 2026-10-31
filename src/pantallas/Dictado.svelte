<script lang="ts">
  import { correccionDeElemento, correctosDe, TECLADO, type Dictada, type DictadoEnCurso } from '../estudio/estudio'
  import Correccion from './Correccion.svelte'
  import Numeros from './Numeros.svelte'
  import PasoNumeros from './PasoNumeros.svelte'

  interface Props {
    dictado: DictadoEnCurso
    alResponder: (numeros: number[]) => void
    alCerrarCorreccion: () => void
    alOtro: () => void
    alSalir: () => void
  }

  let { dictado, alResponder, alCerrarCorreccion, alOtro, alSalir }: Props = $props()

  const pregunta = $derived(dictado.pregunta)
  const falladas = $derived(dictado.falladas)

  function comoSeDa(dictada: Dictada): string {
    return dictada.dadoPor === 'simbolo' ? dictada.elemento.simbolo : dictada.elemento.nombre
  }
</script>

<main class="pantalla dictado">
  {#if !pregunta}
    <h1>Dictado terminado</h1>
    {#if falladas.length === 0}
      <p><span class="acierto" aria-hidden="true">✓</span> Sin fallos.</p>
    {:else}
      <p>Fallados: <b>{falladas.map((fallada) => fallada.elemento.simbolo).join(', ')}</b>.</p>
      <p>Los Elementos fallados vuelven mañana.</p>
    {/if}
    <div class="botones">
      <button type="button" class="boton" onclick={alOtro}>Otro dictado</button>
      <button type="button" class="boton secundario" onclick={alSalir}>Portada</button>
    </div>
  {:else if dictado.respuesta}
    <Correccion {...correccionDeElemento(pregunta.elemento, dictado.respuesta)} alSeguir={alCerrarCorreccion} />
  {:else}
    <header>
      <b>{comoSeDa(pregunta)}</b>
      <button type="button" class="salir" onclick={alSalir}>Salir</button>
    </header>
    <p class="estado">
      Quedan {dictado.pendientes.length + 1}
      {#if dictado.acertada}
        <span class="acierto"><span aria-hidden="true">✓</span> {dictado.acertada.elemento.simbolo}</span>
        <Numeros numeros={correctosDe(dictado.acertada)} />
      {/if}
    </p>
    <div class="teclado">
      {#key pregunta}
        <PasoNumeros opciones={TECLADO} {alResponder} />
      {/key}
    </div>
  {/if}
</main>

<style>
  .pantalla.dictado {
    display: block;
    max-width: 520px;
  }

  h1 {
    margin: 0 0 12px;
    font-size: 24px;
  }

  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }

  header b {
    font-size: 34px;
  }

  .estado {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 8px;
    margin: 6px 0 12px;
    color: var(--tenue);
    font-size: 13px;
  }

  .acierto {
    color: var(--acierto);
  }

  .teclado :global(.opciones) {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .botones {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
  }
</style>
