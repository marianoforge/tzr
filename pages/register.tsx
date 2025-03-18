import RegisterForm from '@/components/PrivateComponente/RegisterForm';
import { useEffect } from 'react';
import Script from 'next/script';

// Add TypeScript declarations for gtag
declare global {
  interface Window {
    gtag: (command: string, action: string, params?: any) => void;
    gtagSendEvent: (url: string) => boolean;
  }
}

const Register = () => {
  useEffect(() => {
    console.log(
      'selectedPriceId en localStorage al cargar register.tsx:',
      localStorage.getItem('selectedPriceId')
    );

    // Definir la función gtagSendEvent en el objeto window para que esté disponible globalmente
    window.gtagSendEvent = (url) => {
      const callback = function () {
        if (typeof url === 'string') {
          window.location.href = url;
        }
      };

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'conversion_event_begin_checkout', {
          event_callback: callback,
          event_timeout: 2000,
          // <event_parameters>
        });
      } else {
        // Fallback si gtag no está disponible
        console.warn('gtag no está disponible');
        callback();
      }
      return false;
    };
  }, []);

  return (
    <div>
      <Script
        id="gtag-conversion-helper"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Helper function to delay opening a URL until a gtag event is sent.
            // Call it in response to an action that should navigate to a URL.
            function gtagSendEvent(url) {
              var callback = function () {
                if (typeof url === 'string') {
                  window.location.href = url;
                }
              };
              gtag('event', 'conversion_event_begin_checkout', {
                'event_callback': callback,
                'event_timeout': 2000,
                // <event_parameters>
              });
              return false;
            }
          `,
        }}
      />
      <RegisterForm />
    </div>
  );
};

export default Register;
