// pages/api/places/details.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const placeId = req.query.placeId as string;

  if (!placeId) {
    return res.status(400).json({ error: "Missing 'placeId' query parameter" });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured' });
  }

  // Google Places Details API URL
  const googlePlacesUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
    placeId
  )}&key=${apiKey}`;

  try {
    const response = await fetch(googlePlacesUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      return res
        .status(500)
        .json({
          error: `Google Places API error: ${data.status}`,
          details: data,
        });
    }

    // Return the response from Google Places API to the client
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data from Google Places API:', error);
    res
      .status(500)
      .json({ error: 'Failed to fetch data from Google Places API' });
  }
}
