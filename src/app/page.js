import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import TokenBanner from '@/components/landing/TokenBanner';
import FeaturesSection from '@/components/landing/FeaturesSection';
import AppDownloadSection from '@/components/landing/AppDownloadSection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-chad-black pt-[65px] pb-12">
      <Navbar />
      <TokenBanner variant="landing" />
      <HeroSection />
      <FeaturesSection />
      <AppDownloadSection />
      <Footer />
    </main>
  );
}
