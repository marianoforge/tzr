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

// Función para determinar el directorio de caché más seguro
function getCacheDirectory(): string {
  // Detectar entorno serverless por la estructura de paths
  const isLambda =
    process.cwd().includes('/var/task') ||
    process.cwd().includes('/var/runtime');
  const isVercel = process.env.VERCEL === '1';
  const isNetlify = process.env.NETLIFY === 'true';

  // En entornos serverless, siempre usar /tmp
  if (
    isLambda ||
    isVercel ||
    isNetlify ||
    process.env.NODE_ENV === 'production'
  ) {
    return '/tmp';
  }

  // En desarrollo, usar directorio local
  return path.join(process.cwd(), 'cache');
}

const CACHE_DIR = getCacheDirectory();
const NEWS_CACHE_FILE = path.join(CACHE_DIR, 'market-news.json');

// Cache en memoria como fallback para entornos serverless
let inMemoryCache: CachedNews | null = null;
let lastMemoryCacheTime = 0;
const MEMORY_CACHE_TTL = 3 * 60 * 60 * 1000; // 3 horas en millisegundos

// Asegurar que el directorio cache existe
function ensureCacheDir() {
  try {
    // Si es /tmp, no necesita crear subdirectorio
    if (CACHE_DIR === '/tmp') {
      console.log('Using /tmp directory for cache (serverless environment)');
      return;
    }

    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      console.log(`Cache directory created: ${CACHE_DIR}`);
    }
  } catch (error) {
    console.error('Error creating cache directory:', error);
    console.log('Will use memory cache only');
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

// Función para obtener desde caché en memoria
function getMemoryCache(region: string): CachedNews | null {
  if (!inMemoryCache) return null;

  const now = Date.now();
  if (now - lastMemoryCacheTime > MEMORY_CACHE_TTL) {
    console.log('Memory cache expired');
    inMemoryCache = null;
    return null;
  }

  if (inMemoryCache.region !== region) {
    console.log(
      `Memory cache region mismatch: ${inMemoryCache.region} !== ${region}`
    );
    return null;
  }

  console.log('Memory cache hit');
  return inMemoryCache;
}

// Función para guardar en caché en memoria
function setMemoryCache(news: NewsItem[], region: string): void {
  inMemoryCache = {
    news,
    region,
    lastUpdated: new Date().toISOString(),
    nextUpdate: getNextUpdateTime().toISOString(),
  };
  lastMemoryCacheTime = Date.now();
  console.log(`Memory cache updated for ${region}`);
}

// Leer noticias del caché
export function getCachedNews(region: string = 'Argentina'): CachedNews | null {
  // En producción, usar solo caché en memoria para evitar problemas de filesystem
  if (process.env.NODE_ENV === 'production') {
    console.log('Production mode: using memory cache only');
    return getMemoryCache(region);
  }

  // En desarrollo, intentar filesystem primero
  try {
    ensureCacheDir();

    if (fs.existsSync(NEWS_CACHE_FILE)) {
      const cacheData = JSON.parse(fs.readFileSync(NEWS_CACHE_FILE, 'utf8'));

      if (cacheData.region === region) {
        console.log(`Filesystem cache hit for region: ${region}`);
        return cacheData;
      } else {
        console.log(
          `Filesystem cache region mismatch: ${cacheData.region} !== ${region}`
        );
      }
    } else {
      console.log(`Cache file not found: ${NEWS_CACHE_FILE}`);
    }
  } catch (error) {
    console.error('Error reading filesystem cache:', error);
  }

  // Fallback a caché en memoria
  console.log('Falling back to memory cache');
  return getMemoryCache(region);
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
  // Siempre guardar en memoria cache como backup
  setMemoryCache(news, region);

  // En producción, usar solo caché en memoria
  if (process.env.NODE_ENV === 'production') {
    console.log('Production mode: using memory cache only');
    return;
  }

  // En desarrollo, intentar guardar en filesystem también
  try {
    ensureCacheDir();

    const cacheData: CachedNews = {
      news,
      region,
      lastUpdated: new Date().toISOString(),
      nextUpdate: getNextUpdateTime().toISOString(),
    };

    fs.writeFileSync(NEWS_CACHE_FILE, JSON.stringify(cacheData, null, 2));
    console.log(
      `Filesystem cache updated for ${region} at ${cacheData.lastUpdated} in ${CACHE_DIR}`
    );
  } catch (error) {
    console.error('Error writing filesystem cache:', error);
    console.error('Cache directory:', CACHE_DIR);
    console.log('Using memory cache as fallback');
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
      cacheType:
        process.env.NODE_ENV === 'production'
          ? 'memory-only'
          : 'filesystem+memory',
    };
  }
  
  return {
    hasCache: true,
    lastUpdated: cached.lastUpdated,
    nextUpdate: cached.nextUpdate,
    shouldUpdate: shouldUpdateCache(region),
    isUpdateTime: isUpdateTime(),
    cacheType:
      process.env.NODE_ENV === 'production'
        ? 'memory-only'
        : 'filesystem+memory',
  };
}
