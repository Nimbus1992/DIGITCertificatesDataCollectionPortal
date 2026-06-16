import { Navbar } from '@/components/sections/Navbar'
import { PartnerHero } from '@/components/sections/PartnerHero'
import { ProductOverview } from '@/components/sections/ProductOverview'
import { LicenseTypes } from '@/components/sections/LicenseTypes'
import { DataAsset } from '@/components/sections/DataAsset'
import { DeploymentModels } from '@/components/sections/DeploymentModels'
import { ScalingBenefits } from '@/components/sections/ScalingBenefits'
import { ProofPoints } from '@/components/sections/ProofPoints'
import { PartnerRevenue } from '@/components/sections/PartnerRevenue'
import { PartnerCTA } from '@/components/sections/PartnerCTA'
import { InternalNotes } from '@/components/sections/InternalNotes'
import { Footer } from '@/components/sections/Footer'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <PartnerHero />
        <ProductOverview />
        <LicenseTypes />
        <DataAsset />
        <DeploymentModels />
        <ScalingBenefits />
        <ProofPoints />
        <PartnerRevenue />
        <PartnerCTA />
        <InternalNotes />
      </main>
      <Footer />
    </>
  )
}

export default App
