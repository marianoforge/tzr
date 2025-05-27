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

---

## Cambio: Fix Cálculo de Honorarios Netos para Team Leader con Dos Asesores

### Problema Identificado
Cuando el Team Leader participaba como asesor en una operación junto con otro asesor, el cálculo de honorarios netos era incorrecto. Los porcentajes de honorarios se aplicaban sobre la mitad de los honorarios brutos en lugar del total, resultando en un cálculo erróneo.

**Ejemplo del bug:**
- Operación: $21,000 honorarios brutos
- Team Leader: 40% como asesor
- Asesor adicional: 40%
- **Resultado incorrecto**: Team Leader recibía 50% neto (debería ser ~20%)

### Solución Implementada

#### Backend Fix (`common/utils/calculations.ts`)

Corregida la función `totalHonorariosTeamLead` en el cálculo para dos asesores:

**Antes (incorrecto):**
```typescript
const baseHonorariosParaAsesores = honorariosBrutos * 0.5; // ❌ División incorrecta
const asesor1Honorarios = (baseHonorariosParaAsesores * porcentaje1) / 100;
const asesor2Honorarios = (baseHonorariosParaAsesores * porcentaje2) / 100;
```

**Después (correcto):**
```typescript
// 🚀 Los porcentajes se aplican sobre el total de honorarios brutos
const asesor1Honorarios = (honorariosBrutos * porcentaje1) / 100;
const asesor2Honorarios = (honorariosBrutos * porcentaje2) / 100;
```

#### Cálculo Correcto Resultante

Para el ejemplo anterior:
- Asesor 1 (Team Leader): $21,000 × 40% = $8,400
- Asesor 2: $21,000 × 40% = $8,400
- Total asesores: $16,800
- **Team Leader neto**: $21,000 - $16,800 = $4,200 (20% correcto)

### Beneficios

- ✅ **Cálculos precisos**: Honorarios netos calculados correctamente
- ✅ **Consistencia**: Lógica coherente con el resto del sistema
- ✅ **Transparencia**: Los porcentajes reflejan la realidad de la operación

### Archivos Modificados

- `common/utils/calculations.ts`: Función `totalHonorariosTeamLead`

### Testing

- Verificar operaciones con Team Leader + asesor adicional
- Confirmar que porcentajes suman correctamente
- Validar que honorarios netos son precisos

### Fecha
$(date +"%Y-%m-%d")

---

## Cambio: Fix Cálculo Cuando Team Leader Participa Como Asesor

### Problema Identificado
Cuando el Team Leader participaba como asesor en una operación, la función `totalHonorariosTeamLead` calculaba incorrectamente los honorarios. En lugar de devolver el porcentaje que le corresponde como asesor, calculaba los honorarios netos (lo que queda después de pagar a todos los asesores), resultando en $0 cuando los porcentajes sumaban 100%.

**Ejemplo del bug:**
- Operación: $21,000 honorarios brutos
- Team Leader: 40% como asesor principal
- Asesor adicional: 60%
- **Resultado incorrecto**: $0 (restaba 40% + 60% = 100% de los honorarios brutos)
- **Resultado esperado**: $8,400 (40% de $21,000)

### Solución Implementada

#### Backend Fix (`common/utils/calculations.ts`)

Agregada lógica para detectar cuando el Team Leader es uno de los asesores:

```typescript
// 🚀 Verificar si el Team Leader es uno de los asesores
const teamLeaderUID = userData.uid;
const isTeamLeaderPrimaryAdvisor = operation.user_uid === teamLeaderUID;
const isTeamLeaderAdditionalAdvisor = operation.user_uid_adicional === teamLeaderUID;

// 🚀 Si el Team Leader es uno de los asesores, devolver SU porcentaje como asesor
if (isTeamLeaderBroker && (isTeamLeaderPrimaryAdvisor || isTeamLeaderAdditionalAdvisor)) {
  let teamLeaderAsAdvisorFee = 0;
  
  if (isTeamLeaderPrimaryAdvisor) {
    teamLeaderAsAdvisorFee = (honorariosBrutos * (operation.porcentaje_honorarios_asesor || 0)) / 100;
  } else if (isTeamLeaderAdditionalAdvisor) {
    teamLeaderAsAdvisorFee = (honorariosBrutos * (operation.porcentaje_honorarios_asesor_adicional || 0)) / 100;
  }
  
  return teamLeaderAsAdvisorFee; // Devolver SU porcentaje, no los honorarios netos
}
```

#### Comportamiento Correcto Resultante

**Caso 1: Team Leader como asesor principal (40%) + Asesor adicional (60%)**
- Team Leader recibe: $21,000 × 40% = $8,400 ✅

**Caso 2: Team Leader como asesor adicional (40%) + Asesor principal (60%)**  
- Team Leader recibe: $21,000 × 40% = $8,400 ✅

**Caso 3: Team Leader NO es asesor**
- Team Leader recibe: Honorarios netos (después de pagar asesores) ✅

### Beneficios

- ✅ **Lógica correcta**: Team Leader recibe su porcentaje cuando actúa como asesor
- ✅ **Flexibilidad**: Funciona tanto si es asesor principal o adicional
- ✅ **Consistencia**: Mantiene la lógica de honorarios netos cuando no es asesor
- ✅ **Precisión**: Cálculos exactos según los porcentajes asignados

### Archivos Modificados

- `common/utils/calculations.ts`: Función `totalHonorariosTeamLead`

### Testing

- Verificar Team Leader como asesor principal con diferentes porcentajes
- Verificar Team Leader como asesor adicional con diferentes porcentajes  
- Confirmar que honorarios netos funcionan cuando Team Leader no es asesor
- Validar aplicación de descuentos de franquicia y repartición

### Fecha
$(date +"%Y-%m-%d")