import CardsSection from '@/components/PublicComponents/CardsSection';
import LicenseSection from '@/components/PublicComponents/LicensesSection';
import MainLayout from '@/components/PublicComponents/CommonComponents/MainLayout';

const Home = () => {
  return (
    <MainLayout>
      <LicenseSection />
      <CardsSection />
    </MainLayout>
  );
};

export default Home;
