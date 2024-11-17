import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { formatDateTime } from '@/common/utils/formatEventDateTime';
import { SessionType } from '@/common/types/';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import Button from '@/components/PrivateComponente/FormComponents/Button';
import { QueryKeys } from '@/common/enums';
import { PRICE_ID_GROWTH, PRICE_ID_STARTER } from '@/lib/data';

export default function Success() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserIdByEmail = async () => {
      const sessionId = router.query.session_id;
      if (!sessionId) return;

      try {
        const res = await fetch(`/api/checkout/${sessionId}`);
        const session: SessionType = await res.json();
        const email = session.customer_details.email;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const selectedPriceId = localStorage.getItem('selectedPriceId');
        const role =
          selectedPriceId === PRICE_ID_STARTER
            ? 'agente_asesor'
            : selectedPriceId === PRICE_ID_GROWTH
              ? 'team_leader_broker'
              : 'enterprise_broker';
        const userIdRes = await fetch(
          `/api/users/getUserIdByEmail?email=${email}`
        );
        const { userId } = await userIdRes.json();

        await fetch(`/api/users/updateUser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            role,
          }),
        });

        localStorage.setItem('userID', userId);
        setUserId(userId);
        setSubscriptionId(subscriptionId);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserIdByEmail();
  }, [router.query.session_id]);

  const { data: subscriptionInfo, isLoading } = useQuery({
    queryKey: [QueryKeys.SUBSCRIPTION_DATA, subscriptionId],
    queryFn: async () => {
      if (!subscriptionId || subscriptionId === 'No Subscription ID') {
        throw new Error('No Subscription ID');
      }
      const response = await fetch(
        `/api/stripe/subscription_info?subscription_id=${subscriptionId}`
      );
      return response.json();
    },
    enabled: !!subscriptionId && subscriptionId !== 'No Subscription ID',
  });

  const timestamp = subscriptionInfo?.trial_end;
  const date = new Date(timestamp * 1000); // Convertir segundos a milisegundos
  const formattedDate = formatDateTime(date);

  return (
    <div className="flex flex-col gap-8 items-center justify-center min-h-screen rounded-xl ring-1 ring-black/5 bg-gradient-to-r from-lightBlue via-mediumBlue to-darkBlue">
      <div className="flex items-center justify-center lg:justify-start">
        <Link href="/" title="Home">
          <Image
            src="/trackproLogoWhite.png"
            alt="Logo"
            width={350}
            height={350}
          />
        </Link>
      </div>

      <div className="bg-white p-6 text-lg shadow-md w-11/12 max-w-lg rounded-lg justify-center items-center flex flex-col h-auto gap-2">
        <div className="px-[20px] mb-4 space-y-1">
          <div className="text-lg text-greenAccent font-semibold text-center mb-3">
            <h2>¡Muchas Gracias!</h2>
            <h1>La transacción se ha realizado con éxito</h1>
          </div>
          {isLoading ? (
            <SkeletonLoader height={40} count={1} />
          ) : (
            <p>
              Fin de la prueba gratis:{' '}
              <span className="font-semibold">{formattedDate}</span>
            </p>
          )}
        </div>

        <div className="w-full flex justify-around">
          <Button
            onClick={() => router.push('/login')}
            className="bg-mediumBlue hover:bg-lightBlue text-white p-2 rounded transition-all duration-300 font-semibold w-[200px] cursor-pointer"
            type="button"
          >
            Ir al Login{' '}
          </Button>
          <Button
            onClick={() => router.push('/')}
            className="bg-lightBlue hover:bg-mediumBlue text-white p-2 rounded transition-all duration-300 font-semibold w-[200px] cursor-pointer"
            type="button"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
