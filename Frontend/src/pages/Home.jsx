import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import ServicesSection from '../components/ServicesSection';
import TechSection from '../components/TechSection';
import ArduinoWidget from '../ArduinoWidget';
import ContactForm from '../components/ContactForm';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <TechSection />
      <ArduinoWidget />
      <ContactForm />
    </main>
  );
}
