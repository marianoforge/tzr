import CardsSection from '@/components/SiteComponents/CardsSection';
import LicenseSection from '@/components/SiteComponents/LicensesSection';
import MainLayout from '@/components/SiteComponents/CommonComponents/MainLayout';

const Home = () => {
  return (
    <MainLayout>
      <CardsSection />
      <LicenseSection />
    </MainLayout>
  );
};

export default Home;
