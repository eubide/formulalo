<script lang="ts">
  import { cuentaDe, formulaDe, numeroDeRadical, radicalesDe, type Radical } from '../catalogo/radicales'
  import Numeros from './Numeros.svelte'

  interface Props {
    radical: Radical
    alSeguir: () => void
  }

  let { radical, alSeguir }: Props = $props()
</script>

<section class="correccion">
  <h2><span aria-hidden="true">✗</span> {formulaDe(radical)} · {radical.nombre}</h2>
  <p>Cada oxígeno lleva −2 y todo suma la carga del radical.</p>
  <p>{cuentaDe(radical)} → x = <Numeros numeros={[numeroDeRadical(radical)]} /></p>
  <p>
    Del {radical.central}:
    {#each radicalesDe(radical.central) as hermano, indice (hermano.nombre)}
      {#if indice > 0}{' · '}{/if}<span>{hermano.nombre} <Numeros numeros={[numeroDeRadical(hermano)]} /></span>
    {/each}
  </p>
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

  .boton {
    margin-top: 10px;
  }
</style>
