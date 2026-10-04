<script lang="ts">
  import {
    electronesDeValencia,
    elementoDe,
    elementos,
    esDeTransicion,
    etiquetaDeClase,
    type Clase,
  } from '../catalogo/catalogo'
  import { etiquetaDePaso, pasosDe, type Respuesta, type Tanda } from '../estudio/estudio'
  import Clases from '../tabla/Clases.svelte'
  import Tabla, { type Casilla } from '../tabla/Tabla.svelte'
  import Configuracion from './Configuracion.svelte'
  import Correccion from './Correccion.svelte'
  import PasoConfiguracion from './PasoConfiguracion.svelte'
  import PasoNumeros from './PasoNumeros.svelte'

  interface Props {
    tanda: Tanda
    alResponder: (respuesta: Respuesta) => void
    alCerrarCorreccion: () => void
    alSalir: () => void
  }

  let { tanda, alResponder, alCerrarCorreccion, alSalir }: Props = $props()

  const CLASES = Object.keys(etiquetaDeClase) as Clase[]
  const tactil = matchMedia('(pointer: coarse)').matches

  let tentativa = $state<string | null>(null)

  const pregunta = $derived(tanda.pregunta!)
  const elemento = $derived(pregunta.elemento)
  const correccion = $derived(tanda.correccion)
  const pasos = $derived(pasosDe(elemento))
  const localizado = $derived(pregunta.paso !== 'posicion')
  const conClase = $derived(pasos.indexOf(pregunta.paso) > pasos.indexOf('clase') || correccion?.paso === 'clase')

  const casillas = $derived.by(() => {
    const mapa: Record<string, Casilla> = {}
    if (correccion?.paso === 'clase') {
      for (const { simbolo, clase } of elementos()) mapa[simbolo] = { clase }
    }
    for (const simbolo of tanda.rotulados) {
      if (simbolo !== elemento.simbolo) mapa[simbolo] = { rotulada: true, clase: elementoDe(simbolo).clase }
    }
    if (localizado) {
      mapa[elemento.simbolo] = { rotulada: true, clase: conClase ? elemento.clase : undefined, senal: 'iluminada' }
    } else if (correccion?.respuesta.paso === 'posicion') {
      mapa[correccion.respuesta.simbolo] = { ...mapa[correccion.respuesta.simbolo], senal: 'fallo' }
      mapa[elemento.simbolo] = { rotulada: true, senal: 'acierto' }
    } else if (tentativa) {
      mapa[tentativa] = { ...mapa[tentativa], senal: 'tentativa' }
    }
    return mapa
  })

  function estadoDe(paso: (typeof pasos)[number]): string {
    if (pregunta.fallados.includes(paso)) return 'fallado'
    if (paso === pregunta.paso) return 'actual'
    return pasos.indexOf(paso) < pasos.indexOf(pregunta.paso) ? 'acertado' : 'pendiente'
  }

  function tocar(simbolo: string) {
    if (tactil) tentativa = simbolo
    else alResponder({ paso: 'posicion', simbolo })
  }

  function confirmar() {
    const simbolo = tentativa!
    tentativa = null
    alResponder({ paso: 'posicion', simbolo })
  }
</script>

<main class="pantalla">
  <header>
    <div class="dado">
      {#if localizado || correccion}
        <b>{elemento.simbolo}</b> <span>{elemento.nombre}</span>
      {:else}
        <b>{pregunta.dadoPor === 'simbolo' ? elemento.simbolo : elemento.nombre}</b>
      {/if}
    </div>
    <button type="button" class="salir" onclick={alSalir}>Salir</button>
  </header>

  <ol class="pasos">
    {#each pasos as paso (paso)}
      <li class={estadoDe(paso)}>
        <span aria-hidden="true">{estadoDe(paso) === 'fallado' ? '✗' : estadoDe(paso) === 'acertado' ? '✓' : '·'}</span>
        {etiquetaDePaso[paso]}
      </li>
    {/each}
    <li class="quedan">Quedan {tanda.pendientes.length + 1}</li>
  </ol>

  <div class="a-la-izquierda">
    <Tabla {casillas} alTocar={pregunta.paso === 'posicion' && !correccion ? tocar : undefined} />
    {#if correccion?.paso === 'clase'}
      <Clases />
    {/if}
  </div>

  <section class="panel">
    {#if correccion}
      <Correccion {pregunta} {correccion} alSeguir={alCerrarCorreccion} />
    {:else if pregunta.paso === 'posicion'}
      <p>¿Dónde está?</p>
      {#if tentativa}
        {@const tocado = elementoDe(tentativa)}
        <button type="button" class="boton" onclick={confirmar}>
          Confirmar: grupo {tocado.grupo}, periodo {tocado.periodo}
        </button>
      {/if}
    {:else if pregunta.paso === 'clase'}
      <p>¿Qué es?</p>
      <div class="clases">
        {#each CLASES as clase (clase)}
          <button type="button" class="boton secundario" onclick={() => alResponder({ paso: 'clase', clase })}>
            {etiquetaDeClase[clase]}
          </button>
        {/each}
      </div>
    {:else if pregunta.paso === 'configuracion'}
      {#key elemento.simbolo}
        <PasoConfiguracion alResponder={(subnivel) => alResponder({ paso: 'configuracion', subnivel })} />
      {/key}
    {:else}
      <Configuracion {elemento} />
      {#if !esDeTransicion(elemento)}
        {@const deValencia = electronesDeValencia(elemento)}
        <p class="puente">Capa de valencia: <b>{deValencia}</b> {deValencia === 1 ? 'electrón' : 'electrones'}.</p>
      {/if}
      {#key elemento.simbolo}
        <PasoNumeros
          {elemento}
          opciones={pregunta.opciones}
          alResponder={(numeros) => alResponder({ paso: 'numeros', numeros })}
        />
      {/key}
    {/if}
  </section>
</main>

<style>
  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .dado b {
    font-size: 34px;
  }

  .dado span {
    margin-left: 8px;
    color: var(--tenue);
    font-size: 18px;
  }

  .pasos {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    margin: 6px 0 12px;
    padding: 0;
    list-style: none;
    font-size: 13px;
    color: var(--tenue);
  }

  .pasos .actual {
    color: var(--tinta);
    font-weight: 700;
  }

  .pasos .acertado {
    color: var(--acierto);
  }

  .pasos .fallado {
    color: var(--fallo);
  }

  .pasos .quedan {
    margin-left: auto;
  }

  .panel {
    margin-top: 16px;
  }

  .panel p {
    margin: 0 0 8px;
  }

  .panel .puente {
    margin-top: 8px;
  }

  .clases {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
</style>
