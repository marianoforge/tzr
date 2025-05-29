# NewsFeed Feature - Cinta de Noticias del Mercado Inmobiliario

## Descripción
Nueva funcionalidad que muestra las 3 noticias más importantes del mercado inmobiliario de la región del usuario en tiempo real, integrada en el dashboard principal.

## Características

### 🏠 Feed de Noticias Inteligente
- **Detección automática de región**: Basada en headers de país o parámetro manual
- **Actualización en tiempo real**: Utilizando Perplexity AI para obtener las últimas noticias
- **Filtro de recencia**: Noticias de la última semana prioritariamente
- **Respaldo inteligente**: Sistema de fallback con contenido general si la API falla

### 🎨 Interfaz de Usuario
- **Diseño responsivo**: Optimizado para desktop y móvil
- **Titulares clickeables**: Los 3 titulares se muestran en tarjetas interactivas
- **Modal detallado**: Al hacer click se abre un modal con el resumen completo
- **Botón de actualización**: Permite refrescar las noticias manualmente
- **Estados de carga**: Animaciones de skeleton mientras cargan las noticias

### 🔧 Tecnología
- **API Endpoint**: `/api/market-news`
- **AI Provider**: Perplexity AI (llama-3.1-sonar-small-128k-online)
- **Framework**: Next.js con TypeScript
- **Styling**: Tailwind CSS con Heroicons
- **Componente**: `modules/dashboard/NewsFeed.tsx`

## Estructura de Archivos

```
├── pages/api/market-news.ts          # Endpoint API con Perplexity AI
├── modules/dashboard/NewsFeed.tsx    # Componente React principal
├── modules/dashboard/Dashboard.tsx   # Dashboard actualizado con NewsFeed
└── styles/globals.css               # Estilos adicionales (line-clamp)
```

## API Response Format

```typescript
interface NewsItem {
  title: string;      // Título de la noticia (máx 100 chars)
  summary: string;    // Resumen detallado 2-3 párrafos
  source?: string;    // Fuente de la noticia
  url?: string;       // URL del artículo original (opcional)
}

interface MarketNewsResponse {
  news: NewsItem[];   // Array de máximo 3 noticias
  error?: string;     // Mensaje de error si aplicable
}
```

## Regiones Soportadas
- 🇦🇷 Argentina (default)
- 🇨🇱 Chile
- 🇺🇾 Uruguay
- 🇲🇽 México
- 🇨🇴 Colombia

## Configuración

### Variables de Entorno
Agrega estas variables a tu archivo `.env.local`:

```env
# Perplexity AI API para noticias del mercado
PERPLEXITY_API_KEY=tu-api-key-de-perplexity

# Secreto para jobs de cron (cambiar en producción)
CRON_SECRET=cron-secret-key-change-this-in-production
```

### Parámetros de la API
- **Región manual**: `GET /api/market-news?region=Chile`
- **Auto-detección**: Headers `cf-ipcountry` o `x-country`

## Sistema de Caché y Actualizaciones

### 🔄 Actualizaciones Automáticas
- **Horarios**: Cada 3 horas de 7am a 10pm (7, 10, 13, 16, 19, 22 hrs)
- **Fuera de horario**: Solo sirve desde caché (sin costos)
- **Caché compartido**: Todos los usuarios ven las mismas noticias
- **Sin refresh manual**: No hay botón para forzar actualizaciones

### 📁 Endpoints de Cron
- **Manual**: `POST /api/cron/update-news?force=true`
- **Automatizado**: `POST /api/cron` (requiere Authorization header)
- **Configuración**: Usar servicios como Vercel Cron, crontab, etc.

### 💾 Sistema de Caché Híbrido
- **Desarrollo**: Caché en filesystem (`cache/` directorio)
- **Producción/Serverless**: Caché en memoria + filesystem `/tmp`
- **Fallback**: Si falla filesystem, usa caché en memoria
- **TTL**: 3 horas para caché en memoria
- **Persistencia**: Solo durante la sesión de la función serverless

### 🛡️ Protección de Costos
- ❌ No hay botón de refresh para usuarios
- ✅ Solo actualiza en horarios programados
- ✅ Máximo 6 actualizaciones por día
- ✅ Caché compartido entre usuarios
- ✅ Fallback a noticias por defecto si falla API

## Uso en el Dashboard

El componente se integra automáticamente en el dashboard principal y se posiciona en la parte superior, justo después del header y antes de los widgets principales.

### Funcionalidades del Usuario
1. **Ver titulares**: Las 3 noticias se muestran como tarjetas
2. **Leer detalle**: Click en cualquier titular abre modal con resumen completo
3. **Acceder al artículo**: Link "Leer artículo completo" en el modal
4. **Responsive**: Funciona en desktop (3 columnas) y móvil (1 columna)
5. **Información de caché**: Indicador de última actualización

## Próximas Mejoras
- [ ] Caché de noticias para reducir llamadas a la API
- [ ] Configuración de región en perfil de usuario
- [ ] Filtros por tipo de noticia (compra, venta, alquiler, etc.)
- [ ] Integración con sistema de notificaciones
- [ ] Analytics de clicks en noticias

---

**Implementado**: Enero 2024  
**Última actualización**: Enero 2024 