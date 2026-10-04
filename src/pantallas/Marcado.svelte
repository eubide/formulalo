<script lang="ts">
  interface Props {
    texto: string
  }

  let { texto }: Props = $props()

  const trozos = $derived(
    texto
      .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)
      .filter(Boolean)
      .map((trozo) =>
        trozo.startsWith('**')
          ? { estilo: 'negrita', letras: trozo.slice(2, -2) }
          : trozo.startsWith('*')
            ? { estilo: 'cursiva', letras: trozo.slice(1, -1) }
            : { estilo: 'llano', letras: trozo },
      ),
  )
</script>

{#each trozos as { estilo, letras }, i (i)}{#if estilo === 'negrita'}<b>{letras}</b>{:else if estilo === 'cursiva'}<i>{letras}</i>{:else}{letras}{/if}{/each}
