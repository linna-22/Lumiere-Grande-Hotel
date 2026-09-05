import Header from '../../components/site/Header'
import Hero from '../../components/site/Hero'
import RoomsSection from '../../components/site/RoomsSection'
import StorySection from '../../components/site/StorySection'
import Footer from '../../components/site/Footer'

export default function Home() {
  return (
    <div className="bg-[#faf6f0] font-sans min-h-screen">
      <Header />
      <Hero />
      <RoomsSection />
      <StorySection />
      <Footer />
    </div>
  )
}