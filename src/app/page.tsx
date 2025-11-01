import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LandingPage } from '@/components/LandingPage'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <LandingPage />
      <Footer />
    </div>
  )
}
