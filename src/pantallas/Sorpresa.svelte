<script lang="ts">
  import { aciertaDictada, TECLADO, type Dictada } from '../estudio/estudio'
  import BloqueDeDictado from './BloqueDeDictado.svelte'
  import { casillasDeRadical } from './casillas'
  import CorreccionDeBloque from './CorreccionDeBloque.svelte'
  import CorreccionDeRadical from './CorreccionDeRadical.svelte'
  import PasoNumeros from './PasoNumeros.svelte'
  import RadicalDado from './RadicalDado.svelte'
  import TablaDeRefuerzo from './TablaDeRefuerzo.svelte'

  interface Props {
    sorpresa: Dictada
    respuesta: number[][] | null
    alResponder: (respuesta: number[][]) => void
    alSeguir: () => void
    alSalir: () => void
  }

  let { sorpresa, respuesta, alResponder, alSeguir, alSalir }: Props = $props()
</script>

<main class="pantalla sorpresa">
  <header>
    <h1>¡Sorpresa!</h1>
    <button type="button" class="salir" onclick={alSalir}>Salir</button>
  </header>
  <p class="aviso">Esta no cuenta ni a favor ni en contra.</p>

  {#if respuesta && aciertaDictada(sorpresa, respuesta)}
    <p class="acertada"><span aria-hidden="true">✓</span> Sorpresa superada.</p>
    <button type="button" class="boton" onclick={alSeguir}>Seguir</button>
  {:else if respuesta && sorpresa.tipo === 'bloque'}
    <CorreccionDeBloque elementos={sorpresa.elementos} {respuesta} {alSeguir} />
  {:else if respuesta && sorpresa.tipo === 'radical'}
    <CorreccionDeRadical radical={sorpresa.radical} escrito={null} {alSeguir} />
  {:else if sorpresa.tipo === 'bloque'}
    <BloqueDeDictado elementos={sorpresa.elementos} dadoPor={sorpresa.dadoPor} {alResponder} />
  {:else}
    <RadicalDado radical={sorpresa.radical} enseña="los dos" />
    <PasoNumeros
      opciones={TECLADO}
      enunciado={`¿Qué número lleva el ${sorpresa.radical.central}?`}
      alResponder={(numeros) => alResponder([numeros])}
    />
    <TablaDeRefuerzo casillas={casillasDeRadical(sorpresa.radical)} />
  {/if}
</main>

<style>
  .pantalla.sorpresa {
    display: block;
    max-width: 520px;
  }

  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }

  h1 {
    margin: 0;
    font-size: 28px;
  }

  .aviso {
    margin: 4px 0 12px;
    color: var(--tenue);
    font-size: 13px;
  }

  .acertada span {
    color: var(--acierto);
  }

</style>
