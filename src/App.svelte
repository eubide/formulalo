<script lang="ts">
  import { crearEstudio, diaLocal, type Respuesta, type Tanda } from './estudio/estudio'
  import FinDeTanda from './pantallas/FinDeTanda.svelte'
  import Portada from './pantallas/Portada.svelte'
  import Pregunta from './pantallas/Pregunta.svelte'
  import Presentacion from './pantallas/Presentacion.svelte'

  const estudio = crearEstudio(localStorage, () => diaLocal(new Date()), Math.random)

  let tanda = $state.raw<Tanda | null>(null)

  function responder(respuesta: Respuesta) {
    tanda = estudio.responder(tanda!, respuesta)
  }
</script>

{#if !tanda}
  <Portada {estudio} alEmpezar={() => (tanda = estudio.abrirTanda())} />
{:else if tanda.presentacion}
  <Presentacion
    simbolos={tanda.presentacion}
    alDescartar={() => (tanda = estudio.descartarPresentacion(tanda!))}
    alSalir={() => (tanda = null)}
  />
{:else if tanda.pregunta}
  <Pregunta
    {tanda}
    alResponder={responder}
    alCerrarCorreccion={() => (tanda = estudio.cerrarCorreccion(tanda!))}
    alSalir={() => (tanda = null)}
  />
{:else}
  <FinDeTanda {tanda} {estudio} alSeguir={() => (tanda = estudio.abrirTanda())} alVolver={() => (tanda = null)} />
{/if}
