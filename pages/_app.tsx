import '@/styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { useAuthStore } from '@/stores/authStore';
import Script from 'next/script';

declare global {
  interface Window {
    dataLayer?: any[];
  }
}

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();
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

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      window.dataLayer?.push({
        event: 'pageview',
        page: url,
      });
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return (
    <>
      {/* Google Tag Manager Head */}
      <Script id="gtm-head" strategy="beforeInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-K9WBH23B');
        `}
      </Script>

      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-K9WBH23B"
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        ></iframe>
      </noscript>
      <Analytics />
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />

        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  );
}
