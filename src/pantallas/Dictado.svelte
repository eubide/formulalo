<script lang="ts">
  import { formulaDe, numeroDeRadical } from '../catalogo/radicales'
  import { TECLADO, type DictadoEnCurso, type RespuestaDictada } from '../estudio/estudio'
  import BloqueDeDictado from './BloqueDeDictado.svelte'
  import { casillasDeRadical } from './casillas'
  import CorreccionDeBloque from './CorreccionDeBloque.svelte'
  import CorreccionDeRadical from './CorreccionDeRadical.svelte'
  import EscrituraDeRadical from './EscrituraDeRadical.svelte'
  import Numeros from './Numeros.svelte'
  import PasoNumeros from './PasoNumeros.svelte'
  import RadicalDado from './RadicalDado.svelte'
  import Presentacion from './Presentacion.svelte'
  import TablaDeRefuerzo from './TablaDeRefuerzo.svelte'

  interface Props {
    dictado: DictadoEnCurso
    alDescartarPresentacion: () => void
    alResponder: (respuesta: RespuestaDictada, seguro?: boolean) => void
    alCerrarCorreccion: () => void
    alOtro: () => void
    alSalir: () => void
  }

  let { dictado, alDescartarPresentacion, alResponder, alCerrarCorreccion, alOtro, alSalir }: Props = $props()

  const pregunta = $derived(dictado.pregunta)
  const acertada = $derived(dictado.acertada)
  const fallados = $derived([
    ...dictado.elementosFallados.map((elemento) => elemento.simbolo),
    ...dictado.radicalesFallados.map(formulaDe),
  ])
</script>

{#if dictado.presentacion}
  <Presentacion simbolos={dictado.presentacion} alDescartar={alDescartarPresentacion} {alSalir} />
{:else}
<main class="pantalla dictado">
  {#if !pregunta}
    <h1>{dictado.tipo === 'radicales' ? 'Radicales terminados' : 'Dictado terminado'}</h1>
    {#if fallados.length === 0}
      <p><span class="acierto" aria-hidden="true">✓</span> Sin fallos.</p>
    {:else}
      <p>Fallados: <b>{fallados.join(', ')}</b>.</p>
      {#if dictado.elementosFallados.length > 0}
        <p>Los Elementos fallados vuelven mañana.</p>
      {/if}
    {/if}
    {#if dictado.comentario}
      <p class="comentario">{dictado.comentario}</p>
    {/if}
    <div class="botones">
      <button type="button" class="boton" onclick={alOtro}>{dictado.tipo === 'radicales' ? 'Otros radicales' : 'Otro dictado'}</button>
      <button type="button" class="boton secundario" onclick={alSalir}>Portada</button>
    </div>
  {:else if dictado.respuesta !== null && pregunta.tipo === 'radical'}
    <CorreccionDeRadical radical={pregunta.radical} escrito={typeof dictado.respuesta === 'string' ? dictado.respuesta : null} comentario={dictado.comentario} alSeguir={alCerrarCorreccion} />
  {:else if dictado.respuesta !== null && pregunta.tipo === 'bloque'}
    <CorreccionDeBloque elementos={pregunta.elementos} respuesta={dictado.respuesta as number[][]} comentario={dictado.comentario} alSeguir={alCerrarCorreccion} />
  {:else}
    <header>
      {#if pregunta.tipo === 'bloque'}
        <b class="bloque">Bloque {pregunta.numero} de {dictado.bloques}</b>
      {:else}
        <RadicalDado radical={pregunta.radical} enseña={pregunta.pide === 'numero' ? 'los dos' : pregunta.dadoPor} />
      {/if}
      <button type="button" class="salir" onclick={alSalir}>Salir</button>
    </header>
    <p class="estado">
      Quedan {dictado.pendientes.length + 1}
      {#if acertada?.tipo === 'bloque'}
        <span class="acierto"><span aria-hidden="true">✓</span> {acertada.elementos.map((elemento) => elemento.simbolo).join(', ')}</span>
      {:else if acertada?.tipo === 'radical'}
        <span class="acierto"><span aria-hidden="true">✓</span> {formulaDe(acertada.radical)}</span>
        <Numeros numeros={[numeroDeRadical(acertada.radical)]} />
      {/if}
      {#if acertada && dictado.comentario}
        <span class="comentario">{dictado.comentario}</span>
      {/if}
    </p>
    {#key pregunta}
      {#if pregunta.tipo === 'bloque'}
        <BloqueDeDictado elementos={pregunta.elementos} dadoPor={pregunta.dadoPor} pideSeguridad={dictado.pideSeguridad} {alResponder} />
      {:else if pregunta.pide === 'escritura'}
        <EscrituraDeRadical pide={pregunta.dadoPor === 'formula' ? 'nombre' : 'formula'} pideSeguridad={dictado.pideSeguridad} {alResponder} />
        <TablaDeRefuerzo casillas={casillasDeRadical(pregunta.radical)} />
      {:else}
        <PasoNumeros
          opciones={TECLADO}
          enunciado={`¿Qué número lleva el ${pregunta.radical.central}?`}
          pideSeguridad={dictado.pideSeguridad}
          alResponder={(numeros, seguro) => alResponder([numeros], seguro)}
        />
        <TablaDeRefuerzo casillas={casillasDeRadical(pregunta.radical)} />
      {/if}
    {/key}
  {/if}
</main>
{/if}

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

  header .bloque {
    font-size: 22px;
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

  .comentario {
    color: var(--tinta);
    font-weight: 700;
  }

  .botones {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
  }
</style>
