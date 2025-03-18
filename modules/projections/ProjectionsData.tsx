import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import Input from '@/components/PrivateComponente/FormComponents/Input';
import Button from '@/components/PrivateComponente/FormComponents/Button';
import { fetchUserOperations } from '@/lib/api/operationsApi';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { useProjectionData } from '@/common/hooks/useProjectionData';

import ProjectionsObjetive from './ProjectionsObjetive';

const ProjectionsData = ({ userId }: { userId: string }) => {
  const { isLoading: isLoadingOperations, error: operationsError } = useQuery({
    queryKey: ['operations', userId],
    queryFn: () => fetchUserOperations(userId),
    enabled: !!userId,
  });

  if (operationsError) {
    console.error('Error fetching operations:', operationsError);
  }

  const semanasDelAno = 52;

  const [formData, setFormData] = useState({
    ticketPromedio: 75000,
    promedioHonorariosNetos: 3,
    efectividad: 15,
  });

  // For tracking input field state
  const [inputValues, setInputValues] = useState({
    ticketPromedio: '75000',
    promedioHonorariosNetos: '3',
    efectividad: '15',
  });

  // Necesitamos un estado para almacenar el valor de objetivoHonorariosAnuales
  const [objetivoHonorariosAnuales, setObjetivoHonorariosAnuales] = useState(0);

  // Usar nuestro hook personalizado
  const { saveProjection, loadProjection } = useProjectionData();

  // Estado para controlar el mensaje de éxito
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Cargar datos guardados cuando el componente se monta
  useEffect(() => {
    if (loadProjection.data && !loadProjection.isLoading) {
      const savedData = loadProjection.data;

      const ticketPromedio = savedData.ticketPromedio || 75000;
      const promedioHonorariosNetos = savedData.promedioHonorariosNetos || 3;
      const efectividad = savedData.efectividad || 15;

      // Actualizar formData con los datos guardados
      setFormData({
        ticketPromedio,
        promedioHonorariosNetos,
        efectividad,
      });

      // Actualizar inputValues
      setInputValues({
        ticketPromedio: ticketPromedio.toString(),
        promedioHonorariosNetos: promedioHonorariosNetos.toString(),
        efectividad: efectividad.toString(),
      });

      // Actualizar objetivoHonorariosAnuales
      if (savedData.objetivoHonorariosAnuales) {
        setObjetivoHonorariosAnuales(savedData.objetivoHonorariosAnuales);
      }
    }
  }, [loadProjection.data, loadProjection.isLoading]);

  // Función para manejar el guardado de la proyección
  const handleSave = () => {
    const esValido =
      objetivoHonorariosAnuales > 0 &&
      formData.promedioHonorariosNetos > 0 &&
      formData.efectividad > 0 &&
      formData.ticketPromedio > 0;

    const volumenAFacturar = esValido
      ? objetivoHonorariosAnuales / (formData.promedioHonorariosNetos / 100)
      : 0;

    const totalPuntasCierres = esValido
      ? Number(volumenAFacturar) / formData.ticketPromedio
      : 0;

    const totalPuntasCierresAnuales = esValido
      ? (Number(totalPuntasCierres) / formData.efectividad) * 100
      : 0;

    const totalPuntasCierresSemanales = esValido
      ? Number(totalPuntasCierresAnuales) / semanasDelAno
      : 0;

    // Datos a guardar
    const dataToSave = {
      ticketPromedio: formData.ticketPromedio,
      promedioHonorariosNetos: formData.promedioHonorariosNetos,
      efectividad: formData.efectividad,
      semanasDelAno,
      objetivoHonorariosAnuales,
      volumenAFacturar,
      totalPuntasCierres,
      totalPuntasCierresAnuales,
      totalPuntasCierresSemanales,
    };

    // Guardar los datos usando nuestro hook
    saveProjection.mutate(dataToSave, {
      onSuccess: () => {
        // Mostrar el mensaje de éxito
        setShowSuccessMessage(true);
        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      },
      onError: (error) => {
        console.error('Error al guardar la proyección:', error);
        // Asegurarse de que el mensaje de éxito no se muestre en caso de error
        setShowSuccessMessage(false);
      },
    });
  };

  // Mostrar un loader mientras se cargan los datos
  if (isLoadingOperations || loadProjection.isLoading) {
    return (
      <div className="w-full">
        <SkeletonLoader height={60} count={10} />
      </div>
    );
  }

  return (
    <div className="bg-white p-4  rounded-xl shadow-md flex flex-col items-center w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
        Proyección de Efectividad
      </h2>
      <div className="flex flex-row">
        <form className="flex flex-col items-center">
          <div className="flex flex-col w-full mb-8">
            <h2 className=" font-bold mb-4">
              Edita los números para ver distintos escenarios
            </h2>
            <div className="flex flex-col w-full items-center">
              <Input
                label="Ticket Promedio"
                type="text"
                className="w-[240px] max-w-[240px] min-w-[240px]"
                labelSize="text-sm"
                value={inputValues.ticketPromedio}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputValues({
                    ...inputValues,
                    ticketPromedio: val,
                  });
                  if (val === '') {
                    // Empty field - set to 0 in the form data but keep input empty
                    setFormData({
                      ...formData,
                      ticketPromedio: 0,
                    });
                  } else if (!isNaN(Number(val))) {
                    // Valid number
                    setFormData({
                      ...formData,
                      ticketPromedio: Number(val),
                    });
                  }
                }}
                showTooltip={true}
                tooltipContent="Cálculo del ticket promedio de las operaciones cerradas en el año."
              />
              <Input
                label="Promedio en % de honorarios netos"
                type="text"
                className="w-[240px] max-w-[240px] min-w-[240px]"
                labelSize="text-sm"
                value={inputValues.promedioHonorariosNetos}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputValues({
                    ...inputValues,
                    promedioHonorariosNetos: val,
                  });
                  if (val === '') {
                    // Empty field - set to 0 in the form data but keep input empty
                    setFormData({
                      ...formData,
                      promedioHonorariosNetos: 0,
                    });
                  } else if (!isNaN(Number(val))) {
                    // Valid number
                    setFormData({
                      ...formData,
                      promedioHonorariosNetos: Number(val),
                    });
                  }
                }}
                showTooltip={true}
                tooltipContent="Cálculo del porcentaje promedio de los honorarios netos de las operaciones cerradas en el año."
              />
              <Input
                label="Efectividad (%)"
                type="text"
                className="w-[240px] max-w-[240px] min-w-[240px]"
                labelSize="text-sm"
                value={inputValues.efectividad}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputValues({
                    ...inputValues,
                    efectividad: val,
                  });
                  if (val === '') {
                    // Empty field - set to 0 in the form data but keep input empty
                    setFormData({
                      ...formData,
                      efectividad: 0,
                    });
                  } else if (!isNaN(Number(val))) {
                    // Valid number
                    setFormData({
                      ...formData,
                      efectividad: Number(val),
                    });
                  }
                }}
                showTooltip={true}
                tooltipContent="Segun estadísticas de la industria, el asesor inmobiliario promedio tiene cerca de 15% de efectividad. Los asesores mas experimentados pueden llegar a alcanzar un 35% de efectividad."
              />
              <Input
                label="Semanas del Año"
                type="number"
                className="w-[240px] max-w-[240px] min-w-[240px]"
                labelSize="text-sm"
                disabled
                marginBottom="mb-2"
                value={semanasDelAno}
                showTooltip={true}
                tooltipContent="Si bien el año tiene 48 semanas, se calculan 52 ya que en Diciembre se empieza a trabajar posibles cierres del año siguiente"
              />
              {showSuccessMessage && (
                <div className=" text-green-600 font-medium text-sm bg-green-50 p-2 rounded-md border border-green-200 w-[240px] text-center">
                  ¡Proyección Guardada con Éxito!
                </div>
              )}
            </div>
          </div>
        </form>
        <ProjectionsObjetive
          ticketPromedio={formData.ticketPromedio}
          promedioHonorariosNetos={formData.promedioHonorariosNetos}
          efectividad={formData.efectividad}
          semanasDelAno={semanasDelAno}
          onObjetivoChange={setObjetivoHonorariosAnuales}
          initialObjetivoValue={objetivoHonorariosAnuales}
        />
      </div>
      <div className="flex items-center mt-4 justify-center gap-4">
        <Button
          type="button"
          onClick={() => {
            // Instead of using handleSubmit, directly update calculations
            // This ensures we're using the current input values
            const ticketPromedio = Number(inputValues.ticketPromedio) || 0;
            const promedioHonorariosNetos =
              Number(inputValues.promedioHonorariosNetos) || 0;
            const efectividad = Number(inputValues.efectividad) || 0;

            setFormData({
              ticketPromedio,
              promedioHonorariosNetos,
              efectividad,
            });
          }}
          className="h-[42px] w-[200px] bg-mediumBlue text-white hover:bg-lightBlue transition-colors duration-300"
        >
          Calcular Proyección
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          className="h-[42px] w-[200px] bg-lightBlue text-white hover:bg-mediumBlue transition-colors duration-300"
        >
          Guardar Proyección
        </Button>
      </div>
      {/* <p className="text-gray-500 mt-4">By Métricas Pablo Viti - 2025</p> */}
    </div>
  );
};

export default ProjectionsData;
