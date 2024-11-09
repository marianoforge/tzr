// pages/api/places/autocomplete.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const input = req.query.input as string;

  if (!input) {
    return res.status(400).json({ error: "Missing 'input' query parameter" });
  }

  // Fetch the API key from environment variables
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured' });
  }

  // Google Places Autocomplete API URL
  const googlePlacesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
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

    // Forward the response from Google Places API to the client
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data from Google Places API:', error);
    res
      .status(500)
      .json({ error: 'Failed to fetch data from Google Places API' });
  }
}
