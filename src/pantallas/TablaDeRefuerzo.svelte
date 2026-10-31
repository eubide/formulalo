<script lang="ts">
  import Tabla, { type Casilla } from '../tabla/Tabla.svelte'

  interface Props {
    casillas: Record<string, Casilla>
  }

  let { casillas }: Props = $props()
</script>

<div class="refuerzo">
  <Tabla {casillas} />
</div>

<style>
  .refuerzo {
    margin-top: 16px;
  }
</style>
