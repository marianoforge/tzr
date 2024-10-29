import CardsSection from '@/components/PublicComponents/CardsSection';
import LicenseSection from '@/components/PublicComponents/LicensesSection';
import MainLayout from '@/components/PublicComponents/CommonComponents/MainLayout';

const Home = () => {
  return (
    <MainLayout>
      <CardsSection />
      <LicenseSection />
    </MainLayout>
  );
};

export default Home;
