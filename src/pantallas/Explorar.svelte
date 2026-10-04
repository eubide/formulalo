<script lang="ts">
  import {
    electronesDeValencia,
    elementoDe,
    elementos,
    esDeTransicion,
    etiquetaDeClase,
    type Clase,
  } from '../catalogo/catalogo'
  import { ultimoElectronDe } from '../catalogo/cajas'
  import { historiaDeOrden, historiaDeSimbolo, historiaDeTrozo } from '../catalogo/historias'
  import { excepcionDe, reglaDe } from '../catalogo/reglas'
  import Tabla, { type Casilla } from '../tabla/Tabla.svelte'
  import Cajas from './Cajas.svelte'
  import Configuracion from './Configuracion.svelte'
  import Marcado from './Marcado.svelte'

  interface Props {
    alSalir: () => void
  }

  let { alSalir }: Props = $props()

  const CLASES = Object.keys(etiquetaDeClase) as Clase[]

  let elegido = $state<string | null>(null)

  function conSigno(numero: number): string {
    return numero < 0 ? `−${-numero}` : String(numero)
  }

  const elemento = $derived(elegido ? elementoDe(elegido) : null)
  const casillas = $derived<Record<string, Casilla>>(
    Object.fromEntries(
      elementos().map(({ simbolo, clase }) => [
        simbolo,
        { rotulada: true, clase, senal: simbolo === elegido ? 'iluminada' : undefined },
      ]),
    ),
  )
  const regla = $derived(elemento && reglaDe(elemento))
  const excepcion = $derived(elemento && excepcionDe(elemento))
  const historias = $derived(
    elemento
      ? [historiaDeSimbolo(elemento), historiaDeOrden(elemento), historiaDeTrozo(elemento)].filter((historia) => historia !== null)
      : [],
  )
</script>

<main class="pantalla">
  <header>
    <h1>Explorar</h1>
    <button type="button" class="salir" onclick={alSalir}>Salir</button>
  </header>

  <div class="a-la-izquierda">
    <Tabla {casillas} alTocar={(simbolo) => (elegido = simbolo)} />

    <ul class="leyenda">
      {#each CLASES as clase (clase)}
        <li><i class={clase}></i>{etiquetaDeClase[clase]}</li>
      {/each}
    </ul>
  </div>

  {#if elemento}
    {@const cuanticos = ultimoElectronDe(elemento).cuanticos}
    <section class="datos">
      <h2><b>{elemento.simbolo}</b> {elemento.nombre}</h2>
      <dl>
        <dt>Posición</dt>
        <dd>Grupo {elemento.grupo} · Periodo {elemento.periodo}</dd>
        <dt>Clase</dt>
        <dd>{etiquetaDeClase[elemento.clase]}</dd>
        <dt>Configuración</dt>
        <dd>
          {#key elemento.simbolo}
            <Configuracion {elemento} />
          {/key}
        </dd>
        {#if !esDeTransicion(elemento)}
          <dt>Capa de valencia</dt>
          <dd>{electronesDeValencia(elemento)} {electronesDeValencia(elemento) === 1 ? 'electrón' : 'electrones'}</dd>
        {/if}
        <dt>Números de oxidación</dt>
        <dd><Cajas {elemento} resuelta /></dd>
        <dt>Último electrón</dt>
        <dd>n = {cuanticos.n} · l = {cuanticos.l} · m = {conSigno(cuanticos.m)} · s = {cuanticos.s > 0 ? '+' : '−'}½</dd>
        {#if regla}
          <dt>Regla del grupo {regla.grupo}</dt>
          <dd>
            {regla.puente}
            {#if excepcion}<br /><b>{elemento.simbolo} se aparta</b>: {excepcion}{/if}
          </dd>
        {/if}
        {#if historias.length > 0}
          <dt>Historias</dt>
          {#each historias as historia (historia)}
            <dd><Marcado texto={historia} /></dd>
          {/each}
        {/if}
      </dl>
    </section>
  {:else}
    <p class="aviso">Toca un elemento.</p>
  {/if}
</main>

<style>
  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  h1 {
    margin: 0;
    font-size: 20px;
  }

  .leyenda {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    margin: 10px 0 0;
    padding: 0;
    list-style: none;
    font-size: 13px;
    color: var(--tenue);
  }

  .leyenda i {
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

  .datos {
    margin-top: 16px;
  }

  h2 {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 400;
    color: var(--tenue);
  }

  h2 b {
    margin-right: 6px;
    font-size: 30px;
    color: var(--tinta);
  }

  dl {
    margin: 0;
  }

  dt {
    margin-top: 10px;
    font-size: 12px;
    color: var(--tenue);
  }

  dd {
    margin: 2px 0 0;
  }

  .aviso {
    margin-top: 16px;
    color: var(--tenue);
  }
</style>
