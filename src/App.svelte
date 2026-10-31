<script lang="ts">
  import { crearEstudio, diaLocal, type DictadoEnCurso, type Respuesta, type Oleada } from './estudio/estudio'
  import Dictado from './pantallas/Dictado.svelte'
  import Explorar from './pantallas/Explorar.svelte'
  import FinDeOleada from './pantallas/FinDeOleada.svelte'
  import Portada from './pantallas/Portada.svelte'
  import Sorpresa from './pantallas/Sorpresa.svelte'
  import Pregunta from './pantallas/Pregunta.svelte'
  import Presentacion from './pantallas/Presentacion.svelte'

  const estudio = crearEstudio(localStorage, () => diaLocal(new Date()), Math.random, () => new Date().toISOString())

  let oleada = $state.raw<Oleada | null>(null)
  let trasElAcierto = $state.raw<Oleada | null>(null)
  let explorando = $state(false)
  let dictado = $state.raw<DictadoEnCurso | null>(null)

  function responder(respuesta: Respuesta) {
    const siguiente = estudio.responder(oleada!, respuesta)
    if (siguiente.sabidos.length > oleada!.sabidos.length) trasElAcierto = siguiente
    else oleada = siguiente
  }

  function cerrarAcierto() {
    oleada = trasElAcierto
    trasElAcierto = null
  }

  function salir() {
    oleada = null
    trasElAcierto = null
  }
</script>

{#if explorando}
  <Explorar alSalir={() => (explorando = false)} />
{:else if dictado?.sorpresa}
  <Sorpresa
    sorpresa={dictado.sorpresa}
    respuesta={dictado.respuestaDeSorpresa}
    alResponder={(respuesta) => (dictado = estudio.responderSorpresa(dictado!, respuesta))}
    alSeguir={() => (dictado = estudio.cerrarSorpresa(dictado!))}
    alSalir={() => (dictado = null)}
  />
{:else if dictado}
  <Dictado
    {dictado}
    alDescartarPresentacion={() => (dictado = estudio.descartarPresentacionDelDictado(dictado!))}
    alResponder={(respuesta, seguro) => (dictado = estudio.responderDictado(dictado!, respuesta, seguro))}
    alCerrarCorreccion={() => (dictado = estudio.cerrarCorreccionDeDictado(dictado!))}
    alOtro={() => (dictado = dictado!.tipo === 'radicales' ? estudio.abrirRadicales() : estudio.abrirDictado())}
    alSalir={() => (dictado = null)}
  />
{:else if !oleada}
  <Portada
    {estudio}
    alEmpezar={() => (oleada = estudio.abrirOleada())}
    alExplorar={() => (explorando = true)}
    alDictado={() => (dictado = estudio.abrirDictado())}
    alRadicales={() => (dictado = estudio.abrirRadicales())}
  />
{:else if oleada.presentacion}
  <Presentacion
    simbolos={oleada.presentacion}
    alDescartar={() => (oleada = estudio.descartarPresentacion(oleada!))}
    alSalir={() => (oleada = null)}
  />
{:else if oleada.sorpresa}
  <Sorpresa
    sorpresa={oleada.sorpresa}
    respuesta={oleada.respuestaDeSorpresa}
    alResponder={(respuesta) => (oleada = estudio.responderSorpresa(oleada!, respuesta))}
    alSeguir={() => (oleada = estudio.cerrarSorpresa(oleada!))}
    alSalir={salir}
  />
{:else if oleada.pregunta}
  <Pregunta
    {oleada}
    sabido={trasElAcierto !== null}
    comentario={trasElAcierto?.comentario ?? null}
    alResponder={responder}
    alSaltarConfiguracion={() => (oleada = estudio.saltarConfiguracion(oleada!))}
    alCerrarCorreccion={() => (oleada = estudio.cerrarCorreccion(oleada!))}
    alCerrarAcierto={cerrarAcierto}
    alSalir={salir}
  />
{:else}
  <FinDeOleada {oleada} {estudio} alSeguir={() => (oleada = estudio.abrirOleada())} alVolver={() => (oleada = null)} />
{/if}
