import CardsSection from "@/components/SiteComponents/CardsSection";
import MainLayout from "@/components/SiteComponents/CommonComponents/MainLayout";

const Home = () => {
  return (
    <>
      <div className="min-h-screen bg-white">
        <MainLayout>
          <CardsSection />
        </MainLayout>
      </div>
    </>
  );
};

export default Home;
