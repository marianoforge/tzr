# Changelog - Agents & Operations

## Cambio: Asignación Automática de Operaciones sin Asesor al Team Leader

### Problema Identificado
Cuando el Team Leader no asigna un asesor específico a una operación (deja el campo "Asesor que realizó la venta" vacío), esa operación no aparecía en la tabla de asesores. Esto significaba que el Team Leader tenía que asignarse a sí mismo como asesor con 0% para que la operación apareciera en la tabla, lo cual no era coherente.

### Solución Implementada

#### Backend Changes (`/api/getTeamsWithOperations.ts`)

1. **Tipo Operation actualizado**: Agregado campo `teamId` explícito para mejor tipado
2. **Lógica de asignación mejorada**: Las operaciones sin asesor asignado (`user_uid` null/vacío) se asignan automáticamente al Team Leader
3. **Filtrado por equipo**: Solo se consideran operaciones que pertenecen al equipo del Team Leader
4. **Logs de debug**: Agregados logs para monitorear operaciones sin asesor

#### Lógica Específica

```typescript
// Operaciones que van al Team Leader:
const teamLeaderOperations = operations.filter((op) => {
  // Verificar que la operación pertenece al equipo del Team Leader
  if (op.teamId !== teamLeaderUID) return false;
  
  const isPrimaryAdvisor = op.user_uid && op.user_uid === teamLeaderUID;
  const isAdditionalAdvisor = op.user_uid_adicional && op.user_uid_adicional === teamLeaderUID;
  
  // 🚀 NUEVA LÓGICA: Si no hay asesor asignado, la operación va al Team Leader
  const hasNoAdvisorAssigned = !op.user_uid || op.user_uid === '' || op.user_uid === null;
  
  return isPrimaryAdvisor || isAdditionalAdvisor || hasNoAdvisorAssigned;
});
```

#### Comportamiento Resultante

1. **Operaciones con asesor asignado**: Se asignan al asesor correspondiente
2. **Operaciones sin asesor**: Se asignan automáticamente al Team Leader con 100% de facturación
3. **Team Leader en tabla**: Aparece automáticamente cuando tiene operaciones (propias o sin asesor)
4. **Cálculos correctos**: Las funciones de cálculo (`calculateAdjustedBrokerFees`) ya manejan correctamente estas operaciones

### Beneficios

- ✅ **Coherencia**: No es necesario asignar el Team Leader con 0% para operaciones sin asesor
- ✅ **Automatización**: Las operaciones sin asesor se asignan automáticamente
- ✅ **Facturación correcta**: El Team Leader recibe el 100% de operaciones sin asesor
- ✅ **Visibilidad**: Todas las operaciones aparecen en la tabla de asesores
- ✅ **Mantenimiento**: Código más limpio y lógico

### Archivos Modificados

- `pages/api/getTeamsWithOperations.ts`: Lógica principal de asignación
- Mantenimiento de compatibilidad con frontend existente

### Testing

- Verificar que operaciones sin asesor aparecen bajo Team Leader
- Confirmar que cálculos de facturación son correctos
- Validar que no hay duplicados en la tabla
- Comprobar logs de debug en consola del servidor

### Fecha
$(date +"%Y-%m-%d") 