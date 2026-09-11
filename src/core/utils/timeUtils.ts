export function isStoreOpen(
  abertura: string | undefined, 
  fechamento: string | undefined, 
  lojaAbertaManual: boolean | undefined
): boolean {
  if (lojaAbertaManual === false) return false;

  if (!abertura || !fechamento) return true; // If no hours defined, assume open if not manually closed

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [aberturaHour, aberturaMin] = abertura.split(':').map(Number);
  const [fechamentoHour, fechamentoMin] = fechamento.split(':').map(Number);

  const aberturaTotal = aberturaHour * 60 + (aberturaMin || 0);
  const fechamentoTotal = fechamentoHour * 60 + (fechamentoMin || 0);

  return currentMinutes >= aberturaTotal && currentMinutes <= fechamentoTotal;
}
