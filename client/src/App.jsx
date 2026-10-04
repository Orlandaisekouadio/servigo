import { Route, Routes, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import HashScroll from './components/HashScroll'
import AppPreloader from './components/AppPreloader'
import Hero from './components/Hero'
import Categories from './components/Categories'
import RecommendedArtisans from './components/RecommendedArtisans'
import ReviewsSection from './components/ReviewsSection'
import FaqSection from './components/FaqSection'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SearchPage from './pages/SearchPage'
import ArtisanProfilePage from './pages/ArtisanProfilePage'
import ArtisanPage from './pages/ArtisanPage'
import ContactPage from './pages/ContactPage'
import ArtisanDashboardPage from './pages/artisan/ArtisanDashboardPage'
import ClientDashboardPage from './pages/client/ClientDashboardPage'
import AdminPage from './pages/AdminPage'
import { AuthProvider } from './auth/AuthProvider'

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface antialiased">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Categories />
        <RecommendedArtisans />
        <HowItWorks />
        <ReviewsSection />
        <FaqSection />
        <Features />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppPreloader />
      <HashScroll />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/inscription" element={<RegisterPage />} />
        <Route path="/recherche" element={<SearchPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/devenir-artisan" element={<ArtisanPage />} />
        <Route path="/artisan/:slug" element={<ArtisanProfilePage />} />
        <Route path="/espace-client" element={<ClientDashboardPage />} />
        <Route path="/espace-artisan" element={<ArtisanDashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}