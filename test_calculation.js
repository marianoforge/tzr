// Simulando el cálculo con los datos del ejemplo
const valor_reserva = 100000;
const porcentaje_honorarios_broker = 6; // 6% del bruto
const porcentaje_destino_franquicia = 20; // 20% se va a franquicia
const porcentaje_asesor_1 = 45; // 45% al asesor 1
const porcentaje_asesor_2 = 35; // 35% al asesor 2
const porcentaje_compartido = 3; // 3% compartido
const porcentaje_referido = 0; // 0% referido

console.log('=== EJEMPLO CON DOS ASESORES CORREGIDO ===');
console.log('Valor de Reserva:', valor_reserva);
console.log('% Honorarios Broker:', porcentaje_honorarios_broker + '%');
console.log('% Franquicia/Broker:', porcentaje_destino_franquicia + '%');
console.log('% Asesor 1:', porcentaje_asesor_1 + '%');
console.log('% Asesor 2:', porcentaje_asesor_2 + '%');
console.log('% Compartido:', porcentaje_compartido + '%');
console.log('');

// 1. Calcular honorarios brutos
const honorarios_brutos_inicial =
  valor_reserva * (porcentaje_honorarios_broker / 100);
console.log('1. Honorarios brutos iniciales:', honorarios_brutos_inicial);

// 2. Aplicar descuento compartido
const descuento_compartido = (valor_reserva * porcentaje_compartido) / 100;
const honorarios_despues_compartido =
  honorarios_brutos_inicial - descuento_compartido;
console.log('2. Descuento compartido:', descuento_compartido);
console.log('   Honorarios después compartido:', honorarios_despues_compartido);

// 3. Calcular honorarios de ambos asesores (del bruto total)
const honorarios_asesor_1 =
  (honorarios_despues_compartido * porcentaje_asesor_1) / 100;
const honorarios_asesor_2 =
  (honorarios_despues_compartido * porcentaje_asesor_2) / 100;
const total_honorarios_asesores = honorarios_asesor_1 + honorarios_asesor_2;
console.log('3. Honorarios asesor 1 (45% del bruto):', honorarios_asesor_1);
console.log('   Honorarios asesor 2 (35% del bruto):', honorarios_asesor_2);
console.log('   Total honorarios asesores:', total_honorarios_asesores);

// 4. Aplicar descuento de franquicia
const descuento_franquicia =
  (honorarios_despues_compartido * porcentaje_destino_franquicia) / 100;
console.log('4. Descuento franquicia (20%):', descuento_franquicia);

// 5. Calcular lo que queda para team lead
const honorarios_team_lead =
  honorarios_despues_compartido -
  descuento_franquicia -
  total_honorarios_asesores;
console.log('5. Honorarios Team Lead:', honorarios_team_lead);

console.log('');
console.log('=== RESUMEN DOS ASESORES ===');
console.log('Asesor 1 recibe:', honorarios_asesor_1);
console.log('Asesor 2 recibe:', honorarios_asesor_2);
console.log('Franquicia se lleva:', descuento_franquicia);
console.log('Team Lead recibe:', honorarios_team_lead);
console.log(
  'Total distribuido:',
  honorarios_asesor_1 +
    honorarios_asesor_2 +
    descuento_franquicia +
    honorarios_team_lead
);
console.log('Total disponible:', honorarios_despues_compartido);

console.log('');
console.log('=== VERIFICACIÓN ===');
console.log(
  '¿Los asesores reciben más del 100% del bruto?',
  ((total_honorarios_asesores / honorarios_despues_compartido) * 100).toFixed(
    1
  ) + '%'
);
console.log(
  '¿El cálculo es consistente?',
  honorarios_asesor_1 +
    honorarios_asesor_2 +
    descuento_franquicia +
    honorarios_team_lead ===
    honorarios_despues_compartido
    ? 'SÍ'
    : 'NO'
);
