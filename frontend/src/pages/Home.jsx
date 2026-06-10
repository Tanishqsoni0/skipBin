import "../home.css";
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
            bin_id="1"
            size="2m³ Skip Bin"
            price="100"
          />

          <BinCard
            bin_id="2"
            size="3m³ Skip Bin"
            price="150"
          />

          <BinCard
            bin_id="3"  
            size="4m³ Skip Bin"
            price="200"
          />

          <BinCard
            bin_id="4"
            size="6m³ Skip Bin"
            price="250"
          />

          <BinCard
            bin_id="5"
            size="8m³ Skip Bin"
            price="300"
          />

          <BinCard
            bin_id="6"
            size="10m³ Skip Bin"
            price="400"
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