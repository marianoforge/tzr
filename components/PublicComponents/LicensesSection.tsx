// CardsSection.tsx
import { useRouter } from 'next/router';

interface LicensesSectionProps {
  onClose?: () => void;
}

const LicensesSection: React.FC<LicensesSectionProps> = ({ onClose }) => {
  const router = useRouter();

  const PRICE_ID_STARTER = 'price_1QAASbJkIrtwQiz3PcJiJebj';
  const PRICE_ID_GROWTH = 'price_1QAAT6JkIrtwQiz3J0HLDRTQ';
  const PRICE_ID_ENTERPRISE = 'price_1QAAT6JkIrtwQiz3J0HLDRTQ';

  const handleLicenseSelect = (priceId: string) => {
    // Almacena el priceId en el almacenamiento local
    localStorage.setItem('selectedPriceId', priceId);

    // Check if the current path is not '/register' before redirecting
    if (router.pathname !== '/register') {
      router.push('/register');
    }
    // Close the modal
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex flex-col justify-around items-center gap-20 pb-10 lg:flex-row">
      <div className="bg-white  p-6 border rounded-lg shadow-xl lg:min-w-[360px]">
        <h2 className="text-lg font-semibold">ASESOR</h2>
        <p>Everything you need to start selling.</p>
        <p className="text-2xl font-bold mt-4">$9.99 USD per month</p>
        <button
          onClick={() => handleLicenseSelect(PRICE_ID_STARTER)}
          className="bg-mediumBlue text-white py-2 px-4 mt-4"
        >
          Start a free trial
        </button>
        <ul className="mt-4">
          <li>Up to 3 team members</li>
          <li>Up to 5 deal progress boards</li>
          <li>Source leads from select platforms</li>
          <li>RadiantAI integrations</li>
          <li>Competitor analysis</li>
        </ul>
      </div>

      <div className="bg-white p-6 border rounded-lg shadow-xl lg:min-w-[360px]">
        <h2 className="text-lg font-semibold">TEAM LEAD</h2>
        <p>All the extras for your growing team.</p>
        <p className="text-2xl font-bold mt-4">$12.99 USD per month</p>
        <button
          onClick={() => handleLicenseSelect(PRICE_ID_GROWTH)}
          className="bg-lightBlue text-white py-2 px-4 mt-4"
        >
          Start a free trial
        </button>
        <ul className="mt-4">
          <li>Up to 10 team members</li>
          <li>Unlimited deal progress boards</li>
          <li>Source leads from over 50 verified platforms</li>
          <li>RadiantAI integrations</li>
          <li>5 competitor analyses per month</li>
        </ul>
      </div>

      <div className="bg-white p-6 border rounded-lg shadow-xl lg:min-w-[360px]">
        <h2 className="text-lg font-semibold">ENTERPRISE</h2>
        <p>Added flexibility to close deals at scale.</p>
        <p className="text-2xl font-bold mt-4">Contact Us</p>
        <button
          onClick={() => handleLicenseSelect(PRICE_ID_ENTERPRISE)}
          className="bg-mediumBlue text-white py-2 px-4 mt-4"
        >
          Start a free trial
        </button>
        <ul className="mt-4">
          <li>Unlimited active team members</li>
          <li>Unlimited deal progress boards</li>
          <li>Source leads from over 100 verified platforms</li>
          <li>RadiantAI integrations</li>
          <li>Unlimited competitor analyses</li>
        </ul>
      </div>
    </div>
  );
};

export default LicensesSection;
