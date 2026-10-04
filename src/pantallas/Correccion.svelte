<script lang="ts">
  import { etiquetaDeClase, ultimoSubnivel } from '../catalogo/catalogo'
  import { familiaDe, familiaDeGrupo } from '../catalogo/familias'
  import type { Correccion, Pregunta } from '../estudio/estudio'
  import Cajas from './Cajas.svelte'
  import Configuracion from './Configuracion.svelte'
  import Marcado from './Marcado.svelte'
  import Numeros from './Numeros.svelte'

  interface Props {
    pregunta: Pregunta
    correccion: Correccion
    alSeguir: () => void
  }

  let { pregunta, correccion, alSeguir }: Props = $props()

  const elemento = $derived(pregunta.elemento)
  const ultimo = $derived(ultimoSubnivel(elemento))
  const familia = $derived(familiaDe(elemento))
</script>

<section class="correccion">
  <h2><span aria-hidden="true">✗</span> {elemento.simbolo} · {elemento.nombre}</h2>

  {#if correccion.paso === 'posicion'}
    <p>Está en el grupo {elemento.grupo}, periodo {elemento.periodo}.</p>
    {#if familia}
      <p>Familia: <b>{familia}</b>.</p>
    {:else}
      <p>No es de los {familiaDeGrupo(elemento.grupo).toLowerCase()}.</p>
    {/if}
  {:else if correccion.paso === 'clase'}
    <p>Es <b>{etiquetaDeClase[elemento.clase].toLowerCase()}</b>.</p>
  {:else if correccion.paso === 'configuracion' && ultimo}
    <p>Su último electrón entra en <b>{ultimo.capa}{ultimo.letra}<sup>{ultimo.electrones}</sup></b>.</p>
    <Configuracion {elemento} />
    <p>Periodo {elemento.periodo}: capa {ultimo.capa}. Grupo {elemento.grupo}: {ultimo.letra}<sup>{ultimo.electrones}</sup>.</p>
  {:else if correccion.paso === 'numeros'}
    <Cajas {elemento} resuelta />
    {#if correccion.faltaron.length > 0}
      <p>Te faltó: <Numeros numeros={correccion.faltaron} /></p>
    {/if}
    {#if correccion.sobraron.length > 0}
      <p>No está en tu lista: <Numeros numeros={correccion.sobraron} /></p>
    {/if}
    {#if correccion.regla}
      <p>
        Regla del grupo {correccion.regla.grupo}: {correccion.regla.puente}
        <Numeros numeros={correccion.regla.numeros} />
      </p>
    {/if}
    {#if correccion.excepcion}
      <p><b>{elemento.simbolo} se aparta de la regla</b>: {correccion.excepcion}</p>
    {/if}
  {/if}

  {#each correccion.historias as historia (historia)}
    <p class="historia"><Marcado texto={historia} /></p>
  {/each}

  <button type="button" class="boton" onclick={alSeguir}>Seguir</button>
</section>

<style>
  .correccion {
    border: 2px solid var(--fallo);
    border-radius: 10px;
    background: var(--fallo-fondo);
    padding: 12px 14px;
  }

  h2 {
    margin: 0 0 6px;
    font-size: 17px;
  }

  h2 span {
    color: var(--fallo);
  }

  p {
    margin: 4px 0;
  }

  .historia {
    font-style: italic;
  }

  .boton {
    margin-top: 10px;
  }
</style>
