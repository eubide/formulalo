import { describe, expect, it } from 'vitest'
import crudo from '../public/manifest.webmanifest?raw'

const manifiesto = JSON.parse(crudo)
const publicados = Object.keys(import.meta.glob('../public/*')).map((ruta) => ruta.replace('../public/', ''))

describe('el manifiesto', () => {
  it('instala la aplicación como «Formúlalo», sin la barra del navegador', () => {
    expect(manifiesto.name).toBe('Formúlalo')
    expect(manifiesto.display).toBe('standalone')
  })

  it('funciona publicado bajo cualquier ruta: no lleva ninguna dirección absoluta', () => {
    const direcciones = [manifiesto.start_url, manifiesto.scope, ...manifiesto.icons.map((icono: { src: string }) => icono.src)]

    for (const direccion of direcciones) expect(direccion).not.toMatch(/^(\/|\w+:)/)
  })

  it('trae los iconos de 192 y 512 px que pide Android, y existen', () => {
    expect(manifiesto.icons.map((icono: { sizes: string }) => icono.sizes)).toEqual(['192x192', '512x512'])
    for (const icono of manifiesto.icons) expect(publicados).toContain(icono.src)
  })
})
