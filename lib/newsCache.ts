import fs from 'fs';
import path from 'path';

interface NewsItem {
  title: string;
  summary: string;
  source?: string;
  url?: string;
}

interface CachedNews {
  news: NewsItem[];
  region: string;
  lastUpdated: string;
  nextUpdate: string;
}

const CACHE_DIR = path.join(process.cwd(), 'cache');
const NEWS_CACHE_FILE = path.join(CACHE_DIR, 'market-news.json');

// Asegurar que el directorio cache existe
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

// Verificar si estamos en horario de actualización (7am - 10pm)
function isUpdateTime(): boolean {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 7 && hour <= 22; // 7am a 10pm
}

// Calcular próxima hora de actualización (cada 3 horas entre 7am-10pm)
function getNextUpdateTime(): Date {
  const now = new Date();
  const currentHour = now.getHours();

  // Horas de actualización: 7, 10, 13, 16, 19, 22
  const updateHours = [7, 10, 13, 16, 19, 22];

  // Encontrar la próxima hora de actualización
  for (const hour of updateHours) {
    if (hour > currentHour) {
      const nextUpdate = new Date();
      nextUpdate.setHours(hour, 0, 0, 0);
      return nextUpdate;
    }
  }

  // Si ya pasaron todas las horas de hoy, la próxima es mañana a las 7am
  const nextUpdate = new Date();
  nextUpdate.setDate(nextUpdate.getDate() + 1);
  nextUpdate.setHours(7, 0, 0, 0);
  return nextUpdate;
}

// Leer noticias del caché
export function getCachedNews(region: string = 'Argentina'): CachedNews | null {
  ensureCacheDir();

  try {
    if (!fs.existsSync(NEWS_CACHE_FILE)) {
      return null;
    }

    const cacheData = JSON.parse(fs.readFileSync(NEWS_CACHE_FILE, 'utf8'));

    // Verificar si es para la misma región
    if (cacheData.region !== region) {
      return null;
    }

    return cacheData;
  } catch (error) {
    console.error('Error reading news cache:', error);
    return null;
  }
}

// Verificar si el caché necesita actualización
export function shouldUpdateCache(region: string = 'Argentina'): boolean {
  const cached = getCachedNews(region);

  if (!cached) {
    return isUpdateTime(); // Solo actualizar si estamos en horario
  }

  const now = new Date();
  const nextUpdate = new Date(cached.nextUpdate);

  return now >= nextUpdate && isUpdateTime();
}

// Guardar noticias en caché
export function setCachedNews(
  news: NewsItem[],
  region: string = 'Argentina'
): void {
  ensureCacheDir();

  const cacheData: CachedNews = {
    news,
    region,
    lastUpdated: new Date().toISOString(),
    nextUpdate: getNextUpdateTime().toISOString(),
  };

  try {
    fs.writeFileSync(NEWS_CACHE_FILE, JSON.stringify(cacheData, null, 2));
    console.log(`News cache updated for ${region} at ${cacheData.lastUpdated}`);
  } catch (error) {
    console.error('Error writing news cache:', error);
  }
}

// Obtener información del estado del caché
export function getCacheStatus(region: string = 'Argentina') {
  const cached = getCachedNews(region);

  if (!cached) {
    return {
      hasCache: false,
      shouldUpdate: isUpdateTime(),
      isUpdateTime: isUpdateTime(),
      nextUpdate: null,
    };
  }

  return {
    hasCache: true,
    lastUpdated: cached.lastUpdated,
    nextUpdate: cached.nextUpdate,
    shouldUpdate: shouldUpdateCache(region),
    isUpdateTime: isUpdateTime(),
  };
}
