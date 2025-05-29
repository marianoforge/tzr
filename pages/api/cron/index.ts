import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Solo permitir GET y POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar que la llamada viene de un cron autorizado
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET || 'cron-secret-key';

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.log('[CRON] Unauthorized cron attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('[CRON] Starting scheduled news update...');

    // Llamar al endpoint de actualización
    const baseUrl = req.headers.host?.includes('localhost')
      ? `http://${req.headers.host}`
      : `https://${req.headers.host}`;

    const updateResponse = await fetch(`${baseUrl}/api/cron/update-news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const updateData = await updateResponse.json();

    if (updateResponse.ok) {
      console.log('[CRON] News update completed successfully');
      res.status(200).json({
        success: true,
        message: 'Cron job executed successfully',
        timestamp: new Date().toISOString(),
        updateResult: updateData,
      });
    } else {
      console.error('[CRON] News update failed:', updateData);
      res.status(500).json({
        success: false,
        message: 'Cron job failed',
        error: updateData.error || 'Unknown error',
      });
    }
  } catch (error) {
    console.error('[CRON] Error executing cron job:', error);
    res.status(500).json({
      success: false,
      message: 'Cron job error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Configuración para Vercel Cron (opcional)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
