import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CabinsPreviewSection } from "@/components/home/CabinsPreviewSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import FAQSection from "@/components/home/FAQSection";
import { CTASection } from "@/components/home/CTASection";
import { GoogleReviewsSection } from "@/components/home/GoogleReviewsSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <CabinsPreviewSection />
      <TestimonialsSection />
      <GoogleReviewsSection />
      <FAQSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
