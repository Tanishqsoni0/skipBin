import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";
import WebsiteNavbar from "../components/WebsiteNavbar";
import BinCard from "../components/BinCard";

import StatsSection from "../components/StatsSection";
import WhyChooseUs from "../components/WhyChooseUs";
import LoyaltySection from "../components/LoyaltySection";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";

const Home = () => {

  return (

    <>

      <WebsiteNavbar />

      <HeroSection />

      <StatsSection />

      <section className="bins-section">

        <h1>
          Available Skip Bins
        </h1>

        <p className="section-subtitle">
          Choose the perfect skip bin for your project.
        </p>

        <div className="bins-grid">

          <BinCard
            size="2m³ Skip Bin"
            price="120"
          />

          <BinCard
            size="3m³ Skip Bin"
            price="160"
          />

          <BinCard
            size="4m³ Skip Bin"
            price="220"
          />

          <BinCard
            size="6m³ Skip Bin"
            price="280"
          />

          <BinCard
            size="8m³ Skip Bin"
            price="350"
          />

          <BinCard
            size="10m³ Skip Bin"
            price="450"
          />

        </div>

      </section>

      <WhyChooseUs />

      <LoyaltySection />

      <Testimonials />

      <FAQ />

      <Footer />

    </>

  );

};

export default Home;