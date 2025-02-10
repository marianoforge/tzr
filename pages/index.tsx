'use client';
import CardsSection from '@/components/PublicComponents/CardsSection';
import MainLayout from '@/components/PublicComponents/CommonComponents/MainLayout';
import Footer from '@/components/PublicComponents/CommonComponents/Footer';
import FAQSection from '@/components/PublicComponents/FAQSection';
import PersonSection from '@/components/PublicComponents/PersonSection';
import { PRICE_ID_STARTER } from '@/lib/data';
const Home = () => {
  localStorage.setItem('selectedPriceId', PRICE_ID_STARTER);
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
