<script lang="ts">
  import { elementoDe, esDeTransicion } from '../catalogo/catalogo'
  import { historiaDeOrden, historiaDeSimbolo, historiaDeTrozo } from '../catalogo/historias'
  import { excepcionDe, reglaDe, REGLAS_GENERALES } from '../catalogo/reglas'
  import Tabla, { type Casilla } from '../tabla/Tabla.svelte'
  import Marcado from './Marcado.svelte'
  import Numeros from './Numeros.svelte'

  interface Props {
    simbolos: string[]
    alDescartar: () => void
  }

  let { simbolos, alDescartar }: Props = $props()

  const presentados = $derived(simbolos.map(elementoDe))
  const casillas = $derived<Record<string, Casilla>>(
    Object.fromEntries(
      presentados.map((elemento) => [elemento.simbolo, { rotulada: true, clase: elemento.clase, senal: 'iluminada' }]),
    ),
  )
  const unicos = <T,>(lista: (T | null)[]) => [...new Set(lista.filter((valor) => valor !== null))]
  const reglas = $derived(unicos(presentados.map(reglaDe)))
  const historias = $derived(unicos([...presentados.map(historiaDeOrden), ...presentados.map(historiaDeTrozo)]))
  const conExcepcion = $derived(presentados.filter((elemento) => excepcionDe(elemento) !== null))
  const conHistoriaDeSimbolo = $derived(presentados.filter((elemento) => historiaDeSimbolo(elemento) !== null))
  const hayDeducibles = $derived(presentados.some((elemento) => !esDeTransicion(elemento)))
</script>

<main>
  <h1>Nuevos: {simbolos.join(', ')}</h1>

  <Tabla {casillas} />

  <ul class="elementos">
    {#each presentados as elemento (elemento.simbolo)}
      <li><b>{elemento.simbolo}</b> {elemento.nombre} <Numeros numeros={elemento.numeros} /></li>
    {/each}
  </ul>

  {#each reglas as regla (regla.grupo)}
    <section class="regla">
      <h2>Regla del grupo {regla.grupo}</h2>
      <p>Su configuración acaba en <b>{regla.acabaEn}</b>.</p>
      <p>{regla.puente}</p>
      <p>Números de oxidación: <Numeros numeros={regla.numeros} /></p>
    </section>
  {/each}

  {#if conExcepcion.length > 0}
    <section>
      <h2>Se apartan de la regla</h2>
      <ul>
        {#each conExcepcion as elemento (elemento.simbolo)}
          <li><b>{elemento.simbolo}</b>: {excepcionDe(elemento)}</li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if historias.length > 0 || conHistoriaDeSimbolo.length > 0}
    <section>
      <h2>Historias</h2>
      <ul>
        {#each historias as historia (historia)}
          <li><Marcado texto={historia} /></li>
        {/each}
        {#each conHistoriaDeSimbolo as elemento (elemento.simbolo)}
          <li><b>{elemento.simbolo}</b>, {elemento.nombre}: <Marcado texto={historiaDeSimbolo(elemento)!} /></li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if hayDeducibles}
    <section>
      <h2>Reglas generales</h2>
      <ul>
        {#each REGLAS_GENERALES as general (general)}
          <li>{general}</li>
        {/each}
      </ul>
    </section>
  {/if}

  <button type="button" class="boton" onclick={alDescartar}>Empezar a preguntar</button>
</main>

<style>
  main {
    max-width: 960px;
    margin: 0 auto;
    padding: 16px 12px 40px;
  }

  h1 {
    margin: 0 0 12px;
    font-size: 20px;
  }

  h2 {
    margin: 18px 0 6px;
    font-size: 15px;
  }

  p {
    margin: 2px 0;
  }

  ul {
    margin: 0;
    padding-left: 18px;
  }

  .elementos {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 18px;
    margin-top: 14px;
    padding: 0;
    list-style: none;
  }

  .regla {
    margin-top: 6px;
  }

  .boton {
    margin-top: 22px;
  }
</style>
