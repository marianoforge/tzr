import CardsSection from '@/components/PublicComponents/CardsSection';
import MainLayout from '@/components/PublicComponents/CommonComponents/MainLayout';
import Footer from '@/components/PublicComponents/CommonComponents/Footer';
import FAQSection from '@/components/PublicComponents/FAQSection';
import PersonSection from '@/components/PublicComponents/PersonSection';

const Home = () => {
  return (
    <>
      <MainLayout>
        <PersonSection />
        <FAQSection id="faq-section" />
        <CardsSection />
        <Footer />
      </MainLayout>
    </>
  );
};

export default Home;
