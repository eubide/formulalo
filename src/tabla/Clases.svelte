<script lang="ts">
  import { etiquetaDeClase, type Clase } from '../catalogo/catalogo'

  const CLASES = Object.keys(etiquetaDeClase) as Clase[]
</script>

<ul>
  {#each CLASES as clase (clase)}
    <li><i class={clase}></i>{etiquetaDeClase[clase]}</li>
  {/each}
</ul>

<style>
  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    margin: 10px 0 0;
    padding: 0;
    list-style: none;
    font-size: 13px;
    color: var(--tenue);
  }

  i {
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-right: 5px;
    border-radius: 3px;
    vertical-align: -1px;
  }

  .metal {
    background: var(--clase-metal);
  }

  .metaloide {
    background: var(--clase-metaloide);
  }

  .no-metal {
    background: var(--clase-no-metal);
  }
</style>
