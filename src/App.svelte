<script lang="ts">
  import { crearEstudio, diaLocal, type Respuesta, type Tanda } from './estudio/estudio'
  import Explorar from './pantallas/Explorar.svelte'
  import FinDeTanda from './pantallas/FinDeTanda.svelte'
  import Portada from './pantallas/Portada.svelte'
  import Pregunta from './pantallas/Pregunta.svelte'
  import Presentacion from './pantallas/Presentacion.svelte'

  const estudio = crearEstudio(localStorage, () => diaLocal(new Date()), Math.random)

  let tanda = $state.raw<Tanda | null>(null)
  let trasElAcierto = $state.raw<Tanda | null>(null)
  let explorando = $state(false)

  function responder(respuesta: Respuesta) {
    const siguiente = estudio.responder(tanda!, respuesta)
    if (siguiente.sabidos.length > tanda!.sabidos.length) trasElAcierto = siguiente
    else tanda = siguiente
  }

  function cerrarAcierto() {
    tanda = trasElAcierto
    trasElAcierto = null
  }

  function salir() {
    tanda = null
    trasElAcierto = null
  }
</script>

{#if explorando}
  <Explorar alSalir={() => (explorando = false)} />
{:else if !tanda}
  <Portada {estudio} alEmpezar={() => (tanda = estudio.abrirTanda())} alExplorar={() => (explorando = true)} />
{:else if tanda.presentacion}
  <Presentacion
    simbolos={tanda.presentacion}
    alDescartar={() => (tanda = estudio.descartarPresentacion(tanda!))}
    alSalir={() => (tanda = null)}
  />
{:else if tanda.pregunta}
  <Pregunta
    {tanda}
    sabido={trasElAcierto !== null}
    alResponder={responder}
    alCerrarCorreccion={() => (tanda = estudio.cerrarCorreccion(tanda!))}
    alCerrarAcierto={cerrarAcierto}
    alSalir={salir}
  />
{:else}
  <FinDeTanda {tanda} {estudio} alSeguir={() => (tanda = estudio.abrirTanda())} alVolver={() => (tanda = null)} />
{/if}
