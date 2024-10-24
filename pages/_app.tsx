import '@/styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import { useState, useEffect } from 'react';

import { useAuthStore } from '@/stores/authStore';

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  const initializeAuthListener = useAuthStore(
    (state) => state.initializeAuthListener
  );

  useEffect(() => {
    const unsubscribe = initializeAuthListener();
    return () => unsubscribe(); // Limpia el listener al desmontar
  }, [initializeAuthListener]);

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      <Analytics />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
