export function fechaLarga(dia: string): string {
  return new Date(`${dia}T00:00:00`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}
