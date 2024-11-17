import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const VerifyEmail = () => {
  const router = useRouter();
  const { token } = router.query;
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verifyEmail?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setMessage('Email verified successfully! Redirecting to checkout...');

          // Redirigir al checkout de Stripe
          const stripe = await stripePromise;
          if (stripe) {
            const { error } = await stripe.redirectToCheckout({
              sessionId: data.sessionId,
            });
            if (error) {
              console.error('Stripe checkout error:', error);
              setMessage('An error occurred during redirection to checkout.');
            }
          }
        } else {
          setMessage(data.message || 'Verification failed.');
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setMessage('An error occurred during verification.');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default VerifyEmail;
