<script lang="ts">
  import { onMount } from 'svelte'

  interface Props {
    pide: 'nombre' | 'formula'
    pideSeguridad?: boolean
    alResponder: (texto: string, seguro?: boolean) => void
  }

  let { pide, pideSeguridad = false, alResponder }: Props = $props()

  let texto = $state('')
  let caja: HTMLInputElement

  onMount(() => caja.focus())

  function comprobar(evento: SubmitEvent) {
    evento.preventDefault()
    if (texto.trim() !== '') alResponder(texto, pideSeguridad ? true : undefined)
  }
</script>

<form onsubmit={comprobar}>
  <label for="escritura">{pide === 'nombre' ? '¿Cómo se llama?' : '¿Cuál es su fórmula?'}</label>
  <input
    id="escritura"
    bind:this={caja}
    bind:value={texto}
    type="text"
    autocomplete="off"
    autocapitalize="off"
    spellcheck="false"
  />
  <small>{pide === 'formula' ? 'Da igual mayúsculas o minúsculas. Los subíndices, como números normales.' : 'Da igual mayúsculas o minúsculas.'}</small>
  {#if pideSeguridad}
    <div class="botones">
      <button type="submit" class="boton" disabled={texto.trim() === ''}>Seguro</button>
      <button type="button" class="boton" disabled={texto.trim() === ''} onclick={() => alResponder(texto, false)}>Dudo</button>
    </div>
  {:else}
    <button type="submit" class="boton" disabled={texto.trim() === ''}>Comprobar</button>
  {/if}
</form>

<style>
  form {
    display: grid;
    gap: 8px;
    margin: 10px 0 12px;
    justify-items: start;
  }

  input {
    width: 100%;
    box-sizing: border-box;
    border: 2px solid var(--borde);
    border-radius: 8px;
    background: var(--papel);
    padding: 10px 12px;
    font: inherit;
    font-size: 20px;
    color: var(--tinta);
  }

  small {
    color: var(--tenue);
  }

  .botones {
    display: flex;
    gap: 8px;
  }
</style>
