import Navbar from '@/components/sections/Navbar'
import Hero from '@/components/sections/Hero'
import GovChallenges from '@/components/sections/GovChallenges'
import SaaSValue from '@/components/sections/SaaSValue'
import ControlModel from '@/components/sections/ControlModel'
import ScreenshotTour from '@/components/sections/ScreenshotTour'
import ImpactStats from '@/components/sections/ImpactStats'
import CaseStudies from '@/components/sections/CaseStudies'
import FinalCTA from '@/components/sections/FinalCTA'
import Footer from '@/components/sections/Footer'

export default function App() {
  return (
    <div className="font-sans antialiased">
      <Navbar />
      <main>
        <Hero />
        <GovChallenges />
        <SaaSValue />
        <ControlModel />
        <ScreenshotTour />
        <ImpactStats />
        <CaseStudies />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
