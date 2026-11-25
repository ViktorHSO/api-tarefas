/** "2026-11-28" → Date no fuso local (sem o deslocamento de meia-noite UTC). */
export function dataLocal(isoData: string): Date {
  const [ano, mes, dia] = isoData.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

/** "2026-11-28" → "28 nov" */
export function diaMes(isoData: string): string {
  return dataLocal(isoData)
    .toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
    .replace(' de ', ' ')
    .replace('.', '')
}

/** Número de peito com pelo menos 3 dígitos: 7 → "007". */
export function numeroDePeito(id: number): string {
  return String(id).padStart(3, '0')
}
