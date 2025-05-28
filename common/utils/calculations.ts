/* eslint-disable no-console */
import { Operation, UserData } from '@/common/types';

import {
  ALQUILER,
  OperationData,
  OperationStatus,
  OperationType,
  UserRole,
} from '../enums';

import { calculateGrossByMonth } from './calculationsGrossByMonth';

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export const calculateTotalHonorariosBroker = (
  operations: Operation[],
  estado?: string
): number => {
  const filteredOperations = estado
    ? operations.filter((op: Operation) => op.estado === estado)
    : operations;

  return filteredOperations.reduce((total: number, op: Operation) => {
    const honorariosBroker = calculateHonorarios(
      op.valor_reserva,
      op.porcentaje_honorarios_asesor,
      op.porcentaje_honorarios_broker,
      op.porcentaje_compartido ?? 0,
      op.porcentaje_referido ?? 0
    ).honorariosBroker;

    return total + honorariosBroker;
  }, 0);
};

export const totalHonorariosTeamLead = (
  operation: Operation,
  userRole: UserRole,
  userData?: UserData
) => {
  if (!userData) {
    console.error('UserData is undefined');
    return 0;
  }

  // Calculamos los honorarios brutos (solo aplicando compartido y referido)
  const honorariosBrutos = calculateHonorarios(
    operation.valor_reserva,
    operation.porcentaje_honorarios_asesor,
    operation.porcentaje_honorarios_broker,
    operation.porcentaje_compartido ?? 0,
    operation.porcentaje_referido ?? 0
    // No pasamos porcentaje_franchise ni porcentaje_reparticion_honorarios_asesor
  ).honorariosBroker;

  const isTeamLeaderBroker = userRole === UserRole.TEAM_LEADER_BROKER;
  const hasUserUid = !!operation.user_uid;
  const hasAdditionalUserUid = !!operation.user_uid_adicional;
  const isFranchise = operation.isFranchiseOrBroker;
  const isReparticionHonorariosAsesor = operation.reparticion_honorarios_asesor;

  // Verificar si el Team Leader es uno de los asesores
  const teamLeaderUID = userData.uid;
  const isTeamLeaderPrimaryAdvisor = operation.user_uid === teamLeaderUID;
  const isTeamLeaderAdditionalAdvisor =
    operation.user_uid_adicional === teamLeaderUID;
  const isTeamLeaderParticipating =
    isTeamLeaderPrimaryAdvisor || isTeamLeaderAdditionalAdvisor;

  // NUEVA LÓGICA SEGÚN LA EXPLICACIÓN:
  // 1. El asesor recibe su porcentaje del bruto total
  // 2. El descuento de franquicia/broker se aplica al bruto total
  // 3. El Team Lead recibe lo que queda después del descuento y del pago al asesor

  if (!isTeamLeaderBroker) {
    // Para usuarios que no son team leaders, calcular honorarios del asesor
    // El asesor recibe su porcentaje del bruto total (antes del descuento de franquicia)
    const honorariosAsesor =
      (honorariosBrutos * (operation.porcentaje_honorarios_asesor || 0)) / 100;

    // Si hay franquicia, aplicar el descuento al resultado del asesor
    if (isFranchise) {
      // El asesor recibe su parte después del descuento de franquicia proporcional
      const honorariosAsesorAfterFranchise =
        honorariosAsesor -
        (honorariosAsesor * (operation.isFranchiseOrBroker || 0)) / 100;
      return honorariosAsesorAfterFranchise;
    }

    return honorariosAsesor;
  }

  // CASO 1: Sin asesores - Team Leader recibe todo después del descuento de franquicia
  if (!hasUserUid && !hasAdditionalUserUid) {
    let honorariosTeamLead = honorariosBrutos;

    // Aplicar descuento de franquicia
    if (isFranchise) {
      const franchiseDiscount =
        (honorariosBrutos * (operation.isFranchiseOrBroker || 0)) / 100;
      honorariosTeamLead -= franchiseDiscount;
    }

    // Aplicar descuento de repartición de honorarios asesor
    if (isReparticionHonorariosAsesor) {
      const reparticionDiscount =
        (honorariosBrutos * (operation.reparticion_honorarios_asesor || 0)) /
        100;
      honorariosTeamLead -= reparticionDiscount;
    }

    return honorariosTeamLead;
  }

  // CASO 2: Un asesor solamente
  if (hasUserUid && !hasAdditionalUserUid) {
    if (isTeamLeaderPrimaryAdvisor) {
      // Si el Team Leader es el único asesor, recibe todo después del descuento de franquicia
      let honorariosTeamLead = honorariosBrutos;

      if (isFranchise) {
        const franchiseDiscount =
          (honorariosBrutos * (operation.isFranchiseOrBroker || 0)) / 100;
        honorariosTeamLead -= franchiseDiscount;
      }

      if (isReparticionHonorariosAsesor) {
        const reparticionDiscount =
          (honorariosBrutos * (operation.reparticion_honorarios_asesor || 0)) /
          100;
        honorariosTeamLead -= reparticionDiscount;
      }

      return honorariosTeamLead;
    } else {
      // Si hay un asesor diferente al Team Leader
      // El asesor recibe su porcentaje del bruto total
      const asesorHonorarios =
        (honorariosBrutos * (operation.porcentaje_honorarios_asesor || 0)) /
        100;

      // Calcular lo que queda después del descuento de franquicia y del pago al asesor
      let honorariosTeamLead = honorariosBrutos - asesorHonorarios;

      if (isFranchise) {
        const franchiseDiscount =
          (honorariosBrutos * (operation.isFranchiseOrBroker || 0)) / 100;
        honorariosTeamLead =
          honorariosBrutos - franchiseDiscount - asesorHonorarios;
      }

      if (isReparticionHonorariosAsesor) {
        const reparticionDiscount =
          (honorariosBrutos * (operation.reparticion_honorarios_asesor || 0)) /
          100;
        honorariosTeamLead -= reparticionDiscount;
      }

      return Math.max(0, honorariosTeamLead); // Asegurar que no sea negativo
    }
  }

  // CASO 3: Dos asesores
  if (hasUserUid && hasAdditionalUserUid) {
    // Calcular honorarios de ambos asesores del bruto total (como en el caso de un asesor)
    const asesor1Porcentaje = operation.porcentaje_honorarios_asesor || 0;
    const asesor2Porcentaje =
      operation.porcentaje_honorarios_asesor_adicional || 0;

    const asesor1Honorarios = (honorariosBrutos * asesor1Porcentaje) / 100;
    const asesor2Honorarios = (honorariosBrutos * asesor2Porcentaje) / 100;
    const totalHonorariosAsesores = asesor1Honorarios + asesor2Honorarios;

    // Calcular lo que queda para el Team Lead después de pagar a los asesores y aplicar descuentos
    let honorariosTeamLead = honorariosBrutos - totalHonorariosAsesores;

    // Aplicar descuento de franquicia
    if (isFranchise) {
      const franchiseDiscount =
        (honorariosBrutos * (operation.isFranchiseOrBroker || 0)) / 100;
      honorariosTeamLead =
        honorariosBrutos - franchiseDiscount - totalHonorariosAsesores;
    }

    // Aplicar descuento de repartición de honorarios asesor
    if (isReparticionHonorariosAsesor) {
      const reparticionDiscount =
        (honorariosBrutos * (operation.reparticion_honorarios_asesor || 0)) /
        100;
      honorariosTeamLead -= reparticionDiscount;
    }

    // Si el Team Leader participa como uno de los asesores, recibe su parte de asesor + lo que queda
    if (isTeamLeaderParticipating) {
      if (isTeamLeaderPrimaryAdvisor) {
        // Team Leader es asesor principal: recibe su parte de asesor + el resto
        return asesor1Honorarios + Math.max(0, honorariosTeamLead);
      } else if (isTeamLeaderAdditionalAdvisor) {
        // Team Leader es asesor adicional: recibe su parte de asesor + el resto
        return asesor2Honorarios + Math.max(0, honorariosTeamLead);
      }
    } else {
      // Team Leader NO participa como asesor: recibe solo lo que queda
      return Math.max(0, honorariosTeamLead);
    }
  }

  // Fallback
  return 0;
};

// Funcion para sumatoria de un campo en operaciones
const sumField = (operations: Operation[], field: keyof Operation) =>
  operations.reduce((acc, op) => acc + (Number(op[field]) || 0), 0);

// Funcion para calcular el promedio de un campo en operaciones
const averageField = (operations: Operation[], field: keyof Operation) =>
  operations.length > 0 ? sumField(operations, field) / operations.length : 0;

// Funcion para filtrar operaciones por tipo
const filterOperationsByType = (operations: Operation[], type: string) =>
  operations.filter((op) => op.tipo_operacion === type);

// Funcion para filtrar operaciones excluyendo un tipo
const filterOperationsExcludingType = (operations: Operation[], type: string) =>
  operations.filter((op) => !op.tipo_operacion.includes(type));

// Helper function to calculate the difference in days between two dates
const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
  return Math.round((endDate.getTime() - startDate.getTime()) / oneDay);
};

// Function to calculate the average days to sell an operation
const averageDaysToSell = (operations: Operation[]) => {
  const averageOperations = operations.filter(
    (op) =>
      op.fecha_captacion &&
      op.fecha_reserva &&
      op.tipo_operacion !== OperationType.ALQUILER_TRADICIONAL &&
      op.tipo_operacion !== OperationType.ALQUILER_TEMPORAL &&
      op.tipo_operacion !== OperationType.ALQUILER_COMERCIAL &&
      op.tipo_operacion !== OperationType.DESARROLLO_INMOBILIARIO
  );

  const totalDays = averageOperations.reduce((sum, op) => {
    const captacionDate = op.fecha_captacion
      ? new Date(op.fecha_captacion)
      : null;
    const reservaDate = op.fecha_reserva ? new Date(op.fecha_reserva) : null;

    if (captacionDate && reservaDate) {
      return sum + calculateDaysBetween(captacionDate, reservaDate);
    }
    return sum;
  }, 0);
  return averageOperations.length > 0
    ? totalDays / averageOperations.length
    : 0;
};

export const calculateHonorarios = (
  valor_reserva: number,
  porcentaje_honorarios_asesor: number,
  porcentaje_honorarios_broker: number,
  porcentaje_compartido: number,
  porcentaje_referido: number = 0
) => {
  const porcentaje_honorarios_broker_normal =
    valor_reserva * (porcentaje_honorarios_broker / 100);

  let honorariosBroker = porcentaje_honorarios_broker_normal;

  // Aplicar descuento del compartido primero
  if (porcentaje_compartido) {
    honorariosBroker -= (valor_reserva * porcentaje_compartido) / 100;
  }

  // Aplicar descuento del referido sobre el resultado final
  if (porcentaje_referido) {
    honorariosBroker -= (honorariosBroker * porcentaje_referido) / 100;
  }

  // En el nuevo flujo, los descuentos de franquicia y repartición se aplican después
  // de calcular los honorarios de los asesores, por lo que ya no los aplicamos aquí

  // HONORARIOS ASESOR (Para mantener compatibilidad con código que use esta función)
  const honorariosAsesor =
    (honorariosBroker * porcentaje_honorarios_asesor) / 100;

  return { honorariosBroker, honorariosAsesor };
};

// Nueva función para calcular honorarios de asesor considerando franquicia
export const calculateAsesorHonorarios = (
  operation: Operation,
  porcentajeAsesor?: number
) => {
  // Usar el porcentaje del asesor pasado como parámetro o el de la operación
  const porcentajeHonorariosAsesor =
    porcentajeAsesor || operation.porcentaje_honorarios_asesor || 0;

  // Calcular honorarios brutos
  const honorariosBrutos = calculateHonorarios(
    operation.valor_reserva || 0,
    porcentajeHonorariosAsesor,
    operation.porcentaje_honorarios_broker || 0,
    operation.porcentaje_compartido || 0,
    operation.porcentaje_referido || 0
  ).honorariosBroker;

  // Calcular honorarios del asesor del bruto total
  const honorariosAsesor =
    (honorariosBrutos * porcentajeHonorariosAsesor) / 100;

  // Si hay franquicia, el asesor también recibe su parte después del descuento de franquicia proporcional
  if (operation.isFranchiseOrBroker) {
    const honorariosAsesorAfterFranchise =
      honorariosAsesor -
      (honorariosAsesor * (operation.isFranchiseOrBroker || 0)) / 100;
    return honorariosAsesorAfterFranchise;
  }

  return honorariosAsesor;
};

// Calculos de totales para operaciones
export const calculateTotals = (operations: Operation[]) => {
  if (operations.length === 0) {
    return {
      valor_reserva: 0,
      porcentaje_honorarios_asesor: 0,
      porcentaje_honorarios_broker: 0,
      honorariosBrutos: 0,
      honorarios_asesor: 0,
      mayor_venta_efectuada: 0,
      promedio_valor_reserva: 0,
      punta_compradora: 0,
      punta_vendedora: 0,
      suma_total_de_puntas: 0,
      cantidad_operaciones: 0,
      honorarios_asesor_adicional: 0,
      porcentaje_honorarios_asesor_adicional: 0,
    };
  }

  // Total Valores Ventas y Ventas Cerradas
  const totalValorReserva = sumField(operations, OperationData.VALOR_RESERVA);

  const totalValorReservaCerradas = sumField(
    operations.filter((op) => op.estado === OperationStatus.CERRADA),
    OperationData.VALOR_RESERVA
  );

  const totalValorReservaEnCurso = sumField(
    operations.filter((op) => op.estado === OperationStatus.EN_CURSO),
    OperationData.VALOR_RESERVA
  );

  // Total Valores Ventas y Desarrollos Cerrados
  const filteredOperations = filterOperationsByType(
    operations,
    OperationType.VENTA
  )
    .concat(
      filterOperationsByType(operations, OperationType.DESARROLLO_INMOBILIARIO)
    )
    .filter((op) => op.estado === OperationStatus.CERRADA);

  // Total Promedio Valor Reservas Filtradas para Ventas y Desarrollos
  const totalValorReservaFiltered = averageField(
    filteredOperations,
    OperationData.VALOR_RESERVA
  );

  // Total Promedio Porcentaje Honorarios Asesor
  const totalPorcentajeHonorariosAsesor = averageField(
    operations,
    OperationData.PORCENTAJE_HONORARIOS_ASESOR
  );

  // Total Promedio Porcentaje Honorarios Broker
  const totalPorcentajeHonorariosBroker = averageField(
    operations,
    OperationData.PORCENTAJE_HONORARIOS_BROKER
  );

  // Total Honorarios Broker
  const totalHonorariosBroker = sumField(
    operations,
    OperationData.HONORARIOS_BROKER
  );

  // Total Honorarios Asesor
  const totalHonorariosAsesor = sumField(
    operations,
    OperationData.HONORARIOS_ASESOR
  );

  // Total Honorarios Asesor Cerradas
  const totalHonorariosAsesorCerradas = sumField(
    operations.filter((op) => op.estado === OperationStatus.CERRADA),
    OperationData.HONORARIOS_ASESOR
  );

  const totalHonorariosAsesorMesVencido = sumField(
    operations.filter((op) => {
      const operationDate = new Date(
        op.fecha_operacion || op.fecha_reserva || ''
      );
      const operationYear = operationDate.getFullYear();
      const operationMonth = operationDate.getMonth() + 1;
      return (
        op.estado === OperationStatus.CERRADA &&
        operationYear === currentYear &&
        operationMonth < currentMonth
      );
    }),
    OperationData.HONORARIOS_ASESOR
  );

  const totalHonorariosAsesorMesVencidoPromedio =
    currentMonth > 1
      ? (totalHonorariosAsesorMesVencido ?? 0) / (currentMonth - 1)
      : 0;

  // Total Honorarios Broker Cerradas
  const totalHonorariosBrokerCerradas = sumField(
    operations.filter((op) => op.estado === OperationStatus.CERRADA),
    OperationData.HONORARIOS_BROKER
  );

  // Total Honorarios Broker Abiertas
  const totalHonorariosBrokerAbiertas = sumField(
    operations.filter((op) => op.estado === OperationStatus.EN_CURSO),
    OperationData.HONORARIOS_BROKER
  );

  // Total Honorarios Asesor Abiertas
  const totalHonorariosAsesorAbiertas = sumField(
    operations.filter((op) => op.estado === OperationStatus.EN_CURSO),
    OperationData.HONORARIOS_ASESOR
  );

  // Mayor Valor Reserva Efectuada
  const mayorVentaEfectuada = Math.max(
    ...operations.map((op) => op.valor_reserva)
  );

  // Promedio Valor Reserva
  const promedioValorReserva = totalValorReserva / operations.length;

  // Operaciones Cerradas
  const closedOperations = operations.filter(
    (op) => op.estado === OperationStatus.CERRADA
  );

  // Total Punta Compradora
  const puntaCompradora = closedOperations.reduce((sum, operation) => {
    return sum + (operation.punta_compradora ? 1 : 0);
  }, 0);

  const puntaVendedora = closedOperations.reduce((sum, operation) => {
    return sum + (operation.punta_vendedora ? 1 : 0);
  }, 0);

  // Total Suma Total de Puntas
  const sumaTotalDePuntas = puntaCompradora + puntaVendedora;

  // Cantidad Operaciones Cerradas
  const cantidadOperaciones = operations.filter(
    (op) => op.estado === OperationStatus.CERRADA
  ).length;

  // Operaciones sin Alquileres
  const filtroOperacionsSinAlquileres = filterOperationsExcludingType(
    operations,
    ALQUILER.ALQUILER
  ).filter((op) => op.estado === OperationStatus.CERRADA);

  // Total Punta Compradora Porcentaje
  const totalPuntaCompradoraPorcentaje = sumField(
    filteredOperations,
    OperationData.PORCENTAJE_PUNTA_COMPRADORA
  );

  // Total Punta Vendedora Porcentaje
  const totalPuntaVendedoraPorcentaje = sumField(
    filteredOperations,
    OperationData.PORCENTAJE_PUNTA_VENDEDORA
  );

  // Operaciones Punta Compradora Valida !== null && !== 0
  const validPuntaCompradoraOperations = filteredOperations.filter(
    (op) =>
      op.porcentaje_punta_compradora !== null &&
      op.porcentaje_punta_compradora !== 0
  );

  // Operaciones Punta Vendedora Valida !== null && !== 0
  const validPuntaVendedoraOperations = filteredOperations.filter(
    (op) =>
      op.porcentaje_punta_vendedora !== null &&
      op.porcentaje_punta_vendedora !== 0
  );

  // Promedio Punta Compradora Porcentaje
  const promedioPuntaCompradoraPorcentaje =
    validPuntaCompradoraOperations.length > 0
      ? totalPuntaCompradoraPorcentaje / validPuntaCompradoraOperations.length
      : 0;

  // Promedio Punta Vendedora Porcentaje
  const promedioPuntaVendedoraPorcentaje =
    validPuntaVendedoraOperations.length > 0
      ? totalPuntaVendedoraPorcentaje / validPuntaVendedoraOperations.length
      : 0;

  const totalPromedioPorcentajePuntasValidas =
    (promedioPuntaCompradoraPorcentaje + promedioPuntaVendedoraPorcentaje) / 2;

  // Obtener el mes actual (1-12)

  // Promedio Mensual Honorarios Asesor
  const promedioMensualHonorariosAsesor =
    totalHonorariosAsesorCerradas / currentMonth;

  // Filtrar operaciones donde ambas puntas son distintas de cero
  const validOperations = filtroOperacionsSinAlquileres.filter(
    (op) => Number(op.punta_compradora) + Number(op.punta_vendedora) > 1
  );

  // Calcular la suma de las puntas compradora y vendedora
  const totalPuntaCompradoraPorcentajeDevVentas = sumField(
    validOperations,
    OperationData.PORCENTAJE_PUNTA_COMPRADORA
  );

  const totalPuntaVendedoraPorcentajeDevVentas = sumField(
    validOperations,
    OperationData.PORCENTAJE_PUNTA_VENDEDORA
  );

  // Calcular el promedio de la suma de las puntas
  const promedioSumaPuntas =
    (totalPuntaCompradoraPorcentajeDevVentas +
      totalPuntaVendedoraPorcentajeDevVentas) /
    validOperations.length;

  // Calculate the percentage for each month
  const porcentajeHonorariosBrokerPorMescurrentYear = calculateGrossByMonth(
    validOperations,
    new Date().getFullYear()
  );

  const porcentajeHonorariosBrokerPorMespastYear = calculateGrossByMonth(
    validOperations,
    new Date().getFullYear() - 1
  );

  const promedioDiasVenta = averageDaysToSell(operations);

  return {
    valor_reserva: totalValorReserva,
    valor_reserva_en_curso: totalValorReservaEnCurso,
    porcentaje_honorarios_asesor: totalPorcentajeHonorariosAsesor,
    porcentaje_honorarios_broker: totalPorcentajeHonorariosBroker,
    honorarios_broker: totalHonorariosBroker,
    honorarios_asesor: totalHonorariosAsesor,
    honorarios_asesor_cerradas: totalHonorariosAsesorCerradas,
    honorarios_broker_cerradas: totalHonorariosBrokerCerradas,
    honorarios_broker_abiertas: totalHonorariosBrokerAbiertas,
    honorarios_asesor_abiertas: totalHonorariosAsesorAbiertas,
    mayor_venta_efectuada: mayorVentaEfectuada,
    promedio_valor_reserva: promedioValorReserva,
    punta_compradora: puntaCompradora,
    punta_vendedora: puntaVendedora,
    suma_total_de_puntas: sumaTotalDePuntas,
    cantidad_operaciones: cantidadOperaciones,
    promedio_punta_compradora_porcentaje: promedioPuntaCompradoraPorcentaje,
    promedio_punta_vendedora_porcentaje: promedioPuntaVendedoraPorcentaje,
    total_valor_ventas_desarrollos: totalValorReservaFiltered,
    valor_reserva_cerradas: totalValorReservaCerradas,
    promedio_mensual_honorarios_asesor: promedioMensualHonorariosAsesor,
    total_promedio_porcentaje_puntas_validas:
      totalPromedioPorcentajePuntasValidas,
    promedio_suma_puntas: promedioSumaPuntas,
    total_honorarios_asesor_mes_vencido_promedio:
      totalHonorariosAsesorMesVencidoPromedio,
    porcentaje_honorarios_broker_por_mes_currentYear:
      porcentajeHonorariosBrokerPorMescurrentYear,
    porcentaje_honorarios_broker_por_mes_pastYear:
      porcentajeHonorariosBrokerPorMespastYear,
    total_honorarios_team_lead: totalHonorariosTeamLead,
    promedio_dias_venta: promedioDiasVenta,
  };
};
