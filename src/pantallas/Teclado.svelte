<script lang="ts" module>
  const NUMERO_MAXIMO = 7
  const COLUMNA_DE_LA_LINEA = 5

  export function sitioDe(numero: number): { fila: number; columna: number } {
    if (numero === 0) return { fila: 2, columna: 4 }
    const fila = Math.abs(numero) % 2 === 1 ? 1 : 2
    if (numero < 0) return { fila, columna: COLUMNA_DE_LA_LINEA + 1 + Math.floor(-numero / 2) }
    return { fila, columna: 1 + Math.floor((NUMERO_MAXIMO - numero) / 2) }
  }

  function enOrdenDeLectura(a: number, b: number): number {
    const [uno, otro] = [sitioDe(a), sitioDe(b)]
    return Number(a < 0) - Number(b < 0) || uno.fila - otro.fila || uno.columna - otro.columna
  }
</script>

<script lang="ts">
  import { escrito, signo } from './Numeros.svelte'

  interface Props {
    opciones: number[]
    marcados: number[]
    alAlternar: (numero: number) => void
  }

  let { opciones, marcados, alAlternar }: Props = $props()
</script>

<div class="opciones">
  <span class="linea" aria-hidden="true"></span>
  {#each [...opciones].sort(enOrdenDeLectura) as numero (numero)}
    <button
      type="button"
      class={signo(numero)}
      style:grid-row={sitioDe(numero).fila}
      style:grid-column={sitioDe(numero).columna}
      aria-pressed={marcados.includes(numero)}
      onclick={() => alAlternar(numero)}
    >
      {escrito(numero)}
    </button>
  {/each}
</div>

<style>
  .opciones {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr)) 2px repeat(3, minmax(0, 1fr));
    grid-template-rows: repeat(2, 44px);
    gap: 8px 5px;
    margin-bottom: 12px;
  }

  .linea {
    grid-row: 1 / span 2;
    grid-column: 5;
    background: var(--borde);
  }

  .opciones button {
    padding: 0;
    border: 2px solid var(--borde);
    border-radius: 8px;
    background: var(--papel);
    font-size: 17px;
    font-weight: 700;
  }

  .opciones button[aria-pressed='true'] {
    border-color: currentColor;
    box-shadow: inset 0 0 0 2px currentColor;
  }
</style>
