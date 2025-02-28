import '@/styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import { useState, useEffect } from 'react';

import { useAuthStore } from '@/stores/authStore';
import Script from 'next/script';

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  const initializeAuthListener = useAuthStore(
    (state) => state.initializeAuthListener
  );

  useEffect(() => {
    const unsubscribe = initializeAuthListener();
    return () => unsubscribe();
  }, [initializeAuthListener]);

  useEffect(() => {
    console.log('Versión de la App:', process.env.NEXT_PUBLIC_APP_VERSION);
  }, []);

  return (
    <>
      {/* Google Analytics */}
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-K7RKJ8JX0C"
      />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-K7RKJ8JX0C');
        `}
      </Script>
      <Analytics />
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />

        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  );
}
