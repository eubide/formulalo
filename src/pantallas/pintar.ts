import type { Component } from 'svelte'
import { render } from 'svelte/server'

const ENTIDADES: Record<string, string> = { '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&amp;': '&' }

export function pintar<Props extends Record<string, any>>(pantalla: Component<Props>, props: Props): string {
  return render(pantalla as Component<any>, { props })
    .body.replace(/<!--.*?-->/gs, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(lt|gt|quot|#39|amp);/g, (entidad) => ENTIDADES[entidad])
    .replace(/\s+/g, ' ')
    .trim()
}
