<script lang="ts" module>
  export function escrito(numero: number): string {
    return numero === 0 ? '0' : `${numero < 0 ? '−' : '+'}${Math.abs(numero)}`
  }

  export function signo(numero: number): string {
    return numero < 0 ? 'negativo' : numero > 0 ? 'positivo' : ''
  }
</script>

<script lang="ts">
  interface Props {
    numeros: number[]
  }

  let { numeros }: Props = $props()
</script>

{#each numeros as numero (numero)}<b class="numero {signo(numero)}">{escrito(numero)}</b>{/each}

<style>
  .numero + .numero {
    margin-left: 0.4em;
  }
</style>
