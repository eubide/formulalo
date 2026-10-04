<script lang="ts">
  import type { Elemento } from '../catalogo/catalogo'
  import Tira from './Tira.svelte'

  interface Props {
    elemento: Elemento
    alResponder: (numeros: number[]) => void
  }

  let { elemento, alResponder }: Props = $props()

  let marcadas = $state<number[]>([])

  function alternar(numero: number) {
    marcadas = marcadas.includes(numero) ? marcadas.filter((otro) => otro !== numero) : [...marcadas, numero]
  }
</script>

<p>¿Dónde para? Toca cada hueco que llena, cada electrón hasta el que usa, o su casilla si se queda en 0.</p>

<Tira {elemento} {marcadas} alAlternar={alternar} />

<button type="button" class="boton" disabled={marcadas.length === 0} onclick={() => alResponder(marcadas)}>
  Comprobar
</button>

<style>
  p {
    margin: 10px 0 8px;
  }

  .boton {
    margin-top: 8px;
  }
</style>
