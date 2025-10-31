// Normaliza el ID de tarea desde distintos objetos/formatos
export function getTid(any) {
  if (any == null) return NaN;
  // Puede venir un objeto tarea, un objeto con id_tarea, o directamente el número
  if (typeof any === 'object') {
    return Number(any.id ?? any.taskId ?? any.id_tarea);
  }
  return Number(any);
}