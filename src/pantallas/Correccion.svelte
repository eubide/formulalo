<script lang="ts">
  import { etiquetaDeClase, ultimoSubnivel } from '../catalogo/catalogo'
  import { familiaDe, familiaDeGrupo } from '../catalogo/familias'
  import { SIN_EL_NEGATIVO } from '../catalogo/reglas'
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
    <ul class="opciones">
      {#each pregunta.opciones as numero (numero)}
        <li>
          <Numeros numeros={[numero]} />
          {#if correccion.sobraron.includes(numero)}
            <span class="fallo">✗ sobra</span>
          {:else if correccion.faltaron.includes(numero)}
            <span class="fallo">faltaba</span>
          {:else if elemento.numeros.includes(numero)}
            <span class="acierto">✓</span>
          {/if}
        </li>
      {/each}
    </ul>
    {#if correccion.regla}
      <p>
        Regla del grupo {correccion.regla.grupo}: {correccion.regla.puente}
        <Numeros numeros={correccion.regla.numeros} />
        {#if correccion.pierdeElNegativo}<br />{SIN_EL_NEGATIVO}{/if}
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

  .opciones {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    margin: 8px 0;
    padding: 0;
    list-style: none;
  }

  .fallo {
    color: var(--fallo);
  }

  .acierto {
    color: var(--acierto);
  }

  .historia {
    font-style: italic;
  }

  .boton {
    margin-top: 10px;
  }
</style>
