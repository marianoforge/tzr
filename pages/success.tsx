import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { SessionType } from '@/common/types/';
import Button from '@/components/PrivateComponente/FormComponents/Button';
import { PRICE_ID_STARTER } from '@/lib/data';

export default function Success() {
  const router = useRouter();
  const [setUserId] = useState<string | null>(null);

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
            : 'team_leader_broker';

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
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserIdByEmail();
  }, [router.query.session_id, setUserId]);

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
