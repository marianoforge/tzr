import CardsSection from '@/components/PublicComponents/CardsSection';
import LicenseSection from '@/components/PublicComponents/LicensesSection';
import MainLayout from '@/components/PublicComponents/CommonComponents/MainLayout';
import Footer from '@/components/PublicComponents/CommonComponents/Footer';
import FAQSection from '@/components/PublicComponents/FAQSection';

const Home = () => {
  return (
    <>
      <MainLayout>
        <CardsSection />
        <FAQSection />
        <Footer setActiveView={() => {}} />
      </MainLayout>
    </>
  );
};

export default Home;
