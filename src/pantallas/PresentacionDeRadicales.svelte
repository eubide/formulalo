<script lang="ts">
  import { elementoDe } from '../catalogo/catalogo'
  import { cuentaDe, formulaDe, numeroDeRadical, radicales } from '../catalogo/radicales'
  import Tabla, { type Casilla } from '../tabla/Tabla.svelte'
  import Numeros from './Numeros.svelte'

  interface Props {
    nombres: string[]
    alDescartar: () => void
    alSalir: () => void
  }

  let { nombres, alDescartar, alSalir }: Props = $props()

  const nuevos = $derived(nombres.map((nombre) => radicales().find((radical) => radical.nombre === nombre)!))
  const centrales = $derived([...new Set(nuevos.map((radical) => radical.central))])
  const casillas = $derived<Record<string, Casilla>>(
    Object.fromEntries(
      centrales.map((central) => [central, { rotulada: true, clase: elementoDe(central).clase, senal: 'iluminada' }]),
    ),
  )
</script>

<main class="pantalla">
  <header>
    <h1>Nuevos radicales</h1>
    <button type="button" class="salir" onclick={alSalir}>Salir</button>
  </header>

  <div class="a-la-izquierda">
    <Tabla {casillas} />
  </div>

  <p>Cada oxígeno lleva −2 y todo suma la carga del radical.</p>

  {#each centrales as central (central)}
    <section>
      <h2>Del {central}</h2>
      <ul>
        {#each nuevos.filter((radical) => radical.central === central) as radical (radical.nombre)}
          <li><b>{formulaDe(radical)}</b> {radical.nombre}: {cuentaDe(radical)} → x = <Numeros numeros={[numeroDeRadical(radical)]} /></li>
        {/each}
      </ul>
    </section>
  {/each}

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

  .boton {
    margin-top: 22px;
  }
</style>
