# Gastos Recurrentes

Este documento describe la funcionalidad de gastos recurrentes implementada en la aplicación.

## Descripción

La funcionalidad de gastos recurrentes permite a los usuarios crear gastos que se repiten automáticamente cada mes. Esto es útil para gastos regulares como alquileres, suscripciones, servicios públicos, etc.

## Cómo funciona

1. **Crear un gasto recurrente**: Al crear o editar un gasto, marque la opción "Repetir Mensualmente".
2. **Procesamiento automático**: El sistema automáticamente creará una copia del gasto recurrente al inicio de cada mes.
3. **Detalles preservados**: Se mantienen todos los detalles del gasto original (monto, tipo, descripción, etc.), solo cambia la fecha al mes actual.

## Consideraciones técnicas

- Los gastos recurrentes se identifican con el campo `isRecurring` establecido en `true` en la base de datos.
- Un cron job programado para ejecutarse el primer día de cada mes gestiona la creación de los nuevos gastos.
- Si necesita ejecutar el cron job manualmente, puede utilizar el script de prueba ubicado en `scripts/setup-cron-job.js`.

## Requisitos de configuración

Para que los gastos recurrentes funcionen correctamente, se necesitan los siguientes elementos:

1. **Vercel Cron Jobs**: La aplicación utiliza Vercel Cron Jobs para ejecutar el procesamiento de gastos recurrentes. Esto ya está configurado en el archivo `vercel.json`.

2. **Variables de entorno**: Es necesario establecer las siguientes variables de entorno:
   - `CRON_API_KEY`: Clave secreta para proteger el endpoint del cron job.
   - `NEXT_PUBLIC_BASE_URL`: URL base de la aplicación (ya está configurado en tus variables de entorno).

## Configuración de variables de entorno

Añade la siguiente variable a tu archivo `.env.local`:

```
CRON_API_KEY=tu-clave-secreta-para-el-cron-job
```

También asegúrate de añadir esta misma variable en la configuración de tu proyecto en Vercel.

## Ejemplo de uso del script de prueba

```bash
# Establecer la clave API para pruebas
export CRON_API_KEY="your-secret-key"

# Ejecutar el script (asegúrese de tener node-fetch instalado)
node --experimental-modules scripts/setup-cron-job.js
```

El script utilizará automáticamente la variable `NEXT_PUBLIC_BASE_URL` de tu entorno para construir la URL completa del endpoint.

## Solución de problemas

- **Los gastos recurrentes no se están creando**: Verifique que el cron job esté correctamente configurado en Vercel.
- **Error de acceso no autorizado**: Asegúrese de que la variable de entorno `CRON_API_KEY` esté configurada en su entorno de Vercel.
- **URL incorrecta**: Verifique que la variable `NEXT_PUBLIC_BASE_URL` esté correctamente configurada y apunte a la URL base de su aplicación.

## Limitaciones actuales

- Los gastos recurrentes solo se repiten mensualmente. No se admiten otras frecuencias (semanal, trimestral, etc.).
- Si un gasto recurrente se crea con una fecha que no existe en algún mes (por ejemplo, el día 31), se ajustará automáticamente al último día del mes correspondiente.
