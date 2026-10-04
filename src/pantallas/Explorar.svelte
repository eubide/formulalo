<script lang="ts">
  import { electronesDeValencia, elementoDe, elementos, esDeTransicion, etiquetaDeClase } from '../catalogo/catalogo'
  import { ultimoElectronDe } from '../catalogo/cajas'
  import { familiaDe, familiaDeGrupo } from '../catalogo/familias'
  import { historiaDeOrden, historiaDeSimbolo, historiaDeTrozo } from '../catalogo/historias'
  import { excepcionDe, pierdeElNegativo, reglaDe, SIN_EL_NEGATIVO } from '../catalogo/reglas'
  import Clases from '../tabla/Clases.svelte'
  import Tabla, { type Casilla } from '../tabla/Tabla.svelte'
  import Cajas from './Cajas.svelte'
  import Configuracion from './Configuracion.svelte'
  import Marcado from './Marcado.svelte'
  import Numeros from './Numeros.svelte'

  interface Props {
    alSalir: () => void
  }

  let { alSalir }: Props = $props()

  let elegido = $state<string | null>(null)

  function conSigno(numero: number): string {
    return numero < 0 ? `−${-numero}` : numero > 0 ? `+${numero}` : '0'
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
    <Clases />
  </div>

  {#if elemento}
    {@const cuanticos = ultimoElectronDe(elemento).cuanticos}
    {@const familia = familiaDe(elemento)}
    {@const deValencia = electronesDeValencia(elemento)}
    <section class="ficha">
      <div class="cabeza">
        <h2 class="tesela {elemento.clase}">
          <small>{elemento.z}</small>
          <b>{elemento.simbolo}</b>
          <span>{elemento.nombre}</span>
        </h2>
        <div class="identidad">
          <p><b>Grupo {elemento.grupo}</b> · <b>Periodo {elemento.periodo}</b></p>
          <p>
            {#if familia}<b>{familia}</b>{:else}No es de los {familiaDeGrupo(elemento.grupo).toLowerCase()}{/if}
            · <b>{etiquetaDeClase[elemento.clase]}</b>
          </p>
        </div>
      </div>

      <dl class="en-fila">
        <div>
          <dt>Configuración</dt>
          <dd><Configuracion {elemento} siempreAbreviada /></dd>
        </div>
        {#if !esDeTransicion(elemento)}
          <div>
            <dt>Capa de valencia</dt>
            <dd><b>{deValencia}</b> {deValencia === 1 ? 'electrón' : 'electrones'}</dd>
          </div>
        {/if}
        <div>
          <dt>Último electrón</dt>
          <dd class="cuanticos">
            <span><i>n</i><b>{cuanticos.n}</b></span>
            <span><i>l</i><b>{cuanticos.l}</b></span>
            <span><i>m</i><b>{conSigno(cuanticos.m)}</b></span>
            <span><i>s</i><b>{cuanticos.s > 0 ? '+' : '−'}½</b></span>
          </dd>
        </div>
      </dl>

      <dl>
        <dt>Números de oxidación</dt>
        <dd class="numeros"><Numeros numeros={elemento.numeros} /></dd>
        <dd><Cajas {elemento} resuelta /></dd>
        {#if regla}
          <dt>Regla del grupo {regla.grupo}</dt>
          <dd>
            {regla.puente}
            {#if pierdeElNegativo(elemento)}<br />{SIN_EL_NEGATIVO}{/if}
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

  .metal {
    background: var(--clase-metal);
  }

  .metaloide {
    background: var(--clase-metaloide);
  }

  .no-metal {
    background: var(--clase-no-metal);
  }

  .ficha {
    margin-top: 16px;
    border: 1px solid var(--borde);
    border-radius: 12px;
    background: var(--papel);
    padding: 14px;
  }

  .cabeza {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
  }

  .tesela {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 92px;
    height: 92px;
    margin: 0;
    border: 2px solid var(--tinta);
    border-radius: 8px;
    font-weight: 400;
  }

  .tesela small {
    position: absolute;
    top: 5px;
    left: 7px;
    font-size: 13px;
    font-weight: 700;
  }

  .tesela b {
    font-size: 38px;
    line-height: 1;
  }

  .tesela span {
    font-size: 12px;
  }

  .identidad p {
    margin: 2px 0;
    font-size: 18px;
  }

  dl {
    margin: 0;
  }

  .en-fila {
    display: flex;
    flex-wrap: wrap;
    gap: 0 28px;
    margin-top: 6px;
  }

  dt {
    margin-top: 12px;
    font-size: 12px;
    color: var(--tenue);
  }

  dd {
    margin: 3px 0 0;
  }

  .numeros {
    font-size: 20px;
  }

  .cuanticos {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .cuanticos span {
    display: flex;
    align-items: baseline;
    gap: 5px;
    border: 1px solid var(--borde);
    border-radius: 6px;
    padding: 2px 9px;
    font-size: 17px;
  }

  .cuanticos i {
    font-family: Georgia, serif;
  }

  .cuanticos b {
    color: var(--cuantico);
  }

  .aviso {
    margin-top: 16px;
    color: var(--tenue);
  }
</style>
