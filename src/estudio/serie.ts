const SERIE_DE_REPASO = [0.2, 0.3, 0.4, 0]

export function parteDeRepaso(hechas: number): number {
  return SERIE_DE_REPASO[hechas % SERIE_DE_REPASO.length]
}
