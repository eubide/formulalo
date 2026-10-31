<script lang="ts">
  import type { Elemento } from '../catalogo/catalogo'
  import { SIN_EL_NEGATIVO } from '../catalogo/reglas'
  import { correccionDeElemento } from '../estudio/estudio'
  import { casillasDeCorreccion } from './casillas'
  import Marcado from './Marcado.svelte'
  import Numeros from './Numeros.svelte'
  import TablaDeRefuerzo from './TablaDeRefuerzo.svelte'

  interface Props {
    elementos: Elemento[]
    respuesta: number[][]
    alSeguir: () => void
  }

  let { elementos, respuesta, alSeguir }: Props = $props()

  const filas = $derived(
    elementos.map((elemento, fila) => {
      const correccion = correccionDeElemento(elemento, respuesta[fila])
      return { elemento, correccion, bien: correccion.faltaron.length === 0 && correccion.sobraron.length === 0 }
    }),
  )
  const falladas = $derived(filas.filter((fila) => !fila.bien))
  const reglas = $derived([...new Set(falladas.flatMap((fila) => fila.correccion.regla ?? []))])
  const historias = $derived([...new Set(falladas.flatMap((fila) => fila.correccion.historias))])
</script>

<section class="correccion">
  <ul>
    {#each filas as { elemento, correccion, bien } (elemento.simbolo)}
      <li>
        <span class={bien ? 'acierto' : 'fallo'} aria-hidden="true">{bien ? '✓' : '✗'}</span>
        <b>{elemento.simbolo}</b>
        {#if bien}
          <Numeros numeros={elemento.numeros} />
        {:else}
          {#if correccion.faltaron.length > 0}<span class="fallo">faltaba</span> <Numeros numeros={correccion.faltaron} />{/if}
          {#if correccion.sobraron.length > 0}<span class="fallo">sobra</span> <Numeros numeros={correccion.sobraron} />{/if}
        {/if}
      </li>
    {/each}
  </ul>

  {#each reglas as regla (regla.grupo)}
    <p>Regla del grupo {regla.grupo}: {regla.puente} <Numeros numeros={regla.numeros} /></p>
  {/each}
  {#each falladas as { elemento, correccion } (elemento.simbolo)}
    {#if correccion.pierdeElNegativo}
      <p><b>{elemento.simbolo}</b>. {SIN_EL_NEGATIVO}</p>
    {/if}
    {#if correccion.excepcion}
      <p><b>{elemento.simbolo} se aparta de la regla</b>: {correccion.excepcion}</p>
    {/if}
  {/each}
  {#each historias as historia (historia)}
    <p class="historia"><Marcado texto={historia} /></p>
  {/each}

  <button type="button" class="boton" onclick={alSeguir}>Seguir</button>
</section>

<TablaDeRefuerzo casillas={casillasDeCorreccion(filas)} />

<style>
  .correccion {
    border: 2px solid var(--fallo);
    border-radius: 10px;
    background: var(--fallo-fondo);
    padding: 12px 14px;
  }

  ul {
    display: grid;
    gap: 4px;
    margin: 0 0 8px;
    padding: 0;
    list-style: none;
  }

  li b {
    display: inline-block;
    min-width: 28px;
  }

  p {
    margin: 4px 0;
  }

  .historia {
    font-style: italic;
  }

  .fallo {
    color: var(--fallo);
  }

  .acierto {
    color: var(--acierto);
  }

  .boton {
    margin-top: 10px;
  }
</style>
