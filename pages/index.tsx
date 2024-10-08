import HeroSection from "@/components/SiteComponents/CommonComponents/HeroSections";
import MainLayout from "@/components/SiteComponents/CommonComponents/MainLayout";

const Home = () => {
  return (
    <>
      <div className="min-h-screen">
        <MainLayout>
          <HeroSection />
        </MainLayout>
      </div>
    </>
  );
};

export default Home;
