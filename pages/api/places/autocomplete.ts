import type { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Firebase Admin SDK for authentication

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    console.warn('⚠️ Método no permitido:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔹 Nueva petición a /api/places/autocomplete');

    // 🔹 Validate Firebase authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ No se proporcionó token en la cabecera.');
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    console.log('✅ Token verificado para UID:', decodedToken.uid);

    // 🔹 Validate input query parameter
    const input = req.query.input as string;
    if (!input || input.trim() === '') {
      console.warn("⚠️ El parámetro 'input' es requerido.");
      return res.status(400).json({ error: "Missing 'input' query parameter" });
    }

    console.log(`🔹 Buscando lugares con el término: ${input}`);

    // 🔹 Validate Google Maps API Key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('❌ API key de Google Maps no configurada.');
      return res.status(500).json({ error: 'API key is not configured' });
    }

    // 🔹 Construct Google Places Autocomplete API URL
    const googlePlacesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${apiKey}`;

    // 🔹 Fetch data from Google Places API
    const response = await fetch(googlePlacesUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.warn(`⚠️ Error en la API de Google Places: ${data.status}`);
      return res.status(500).json({
        error: `Google Places API error: ${data.status}`,
        details: data,
      });
    }

    console.log('✅ Datos obtenidos correctamente de Google Places API.');
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('❌ Error al obtener datos de Google Places API:', error);
    return res.status(500).json({
      error: 'Failed to fetch data from Google Places API',
      message: error.message,
    });
  }
}
