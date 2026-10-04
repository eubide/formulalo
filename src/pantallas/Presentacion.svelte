<script lang="ts">
  import { elementoDe, esDeTransicion } from '../catalogo/catalogo'
  import { familiaDe, familiaDeGrupo } from '../catalogo/familias'
  import { historiaDeOrden, historiaDeSimbolo, historiaDeTrozo } from '../catalogo/historias'
  import { excepcionDe, pierdeElNegativo, reglaDe, REGLAS_GENERALES, SIN_EL_NEGATIVO } from '../catalogo/reglas'
  import Tabla, { type Casilla } from '../tabla/Tabla.svelte'
  import Cajas from './Cajas.svelte'
  import Marcado from './Marcado.svelte'
  import Numeros from './Numeros.svelte'

  interface Props {
    simbolos: string[]
    alDescartar: () => void
    alSalir: () => void
  }

  let { simbolos, alDescartar, alSalir }: Props = $props()

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
  const deTransicion = $derived(presentados.find(esDeTransicion))
</script>

<main class="pantalla">
  <header>
    <h1>Nuevos: {simbolos.join(', ')}</h1>
    <button type="button" class="salir" onclick={alSalir}>Salir</button>
  </header>

  <div class="a-la-izquierda">
    <Tabla {casillas} />
  </div>

  {#if deTransicion}
    <p>Familia: <b>{familiaDe(deTransicion)}</b>.</p>
    <p>Aquí las reglas generales no valen: sus números se memorizan.</p>
  {/if}

  {#each reglas as regla (regla.grupo)}
    {@const sinFamilia = presentados
      .filter((elemento) => elemento.grupo === regla.grupo && familiaDe(elemento) === null)
      .map((elemento) => elemento.simbolo)}
    {@const sinElNegativo = presentados.filter((elemento) => elemento.grupo === regla.grupo && pierdeElNegativo(elemento))}
    <section class="regla">
      <h2>Regla del grupo {regla.grupo}</h2>
      <p>Familia: <b>{familiaDeGrupo(regla.grupo)}</b>{#if sinFamilia.length > 0}, salvo el {sinFamilia.join(', ')}{/if}.</p>
      <p>Su configuración acaba en <b>{regla.acabaEn}</b>.</p>
      <p>{regla.puente}</p>
      <p>Números de oxidación: <Numeros numeros={regla.numeros} /></p>
      {#each sinElNegativo as elemento (elemento.simbolo)}
        <p><b>{elemento.simbolo}</b>. {SIN_EL_NEGATIVO}</p>
      {/each}
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

  <ul class="elementos">
    {#each presentados as elemento (elemento.simbolo)}
      <li>
        <span>{elemento.nombre}</span>
        <Cajas {elemento} resuelta />
      </li>
    {/each}
  </ul>

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
  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  h1 {
    margin: 0;
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
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 420px), 1fr));
    gap: 10px 18px;
    margin-top: 14px;
    padding: 0;
    list-style: none;
  }

  .elementos span {
    color: var(--tenue);
    font-size: 13px;
  }

  .regla {
    margin-top: 6px;
  }

  .boton {
    margin-top: 22px;
  }
</style>
