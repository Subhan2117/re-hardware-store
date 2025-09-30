import { Badge } from 'lucide-react';
import LiquidEther from '../component/background/LiquidEther';
import Link from 'next/link';
import {
  Hammer,
  Drill,
  Slice,
  Bolt,
  Wrench,
  Paintbrush,
  MapPin,
  Phone,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
  Globe,
  Heart,
  Eye,
  ShoppingCart,
} from 'lucide-react';
export default function page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-slate-100 to-orange-200 overflow-hidden">
      {/** NavaBar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-slate-200/50 bg-white/40 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Hammer className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">
                BuildCraft Hardware
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8 ">
              <a
                href="#"
                className="text-slate-600 hover:text-amber-600 transition-all duration-300 font-medium"
              >
                Home
              </a>
              <a
                href="#"
                className="text-slate-600 hover:text-amber-600 transition-all duration-300 font-medium"
              >
                Tools
              </a>
              <a
                href="#"
                className="text-slate-600 hover:text-amber-600 transition-all duration-300 font-medium"
              >
                Hardware
              </a>
              <a
                href="#"
                className="text-slate-600 hover:text-amber-600 transition-all duration-300 font-medium"
              >
                About
              </a>
            </div>

            <div className="flex items-center space-x-3">
              <button className="text-slate-600 hover:text-amber-600 transition-all duration-300 cursor-pointer">
                <ShoppingCart className="w-5 h-5 mr-3" />
              </button>
              <button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 transition-all duration-300 px-6 py-2 rounded-2xl cursor-pointer">
                <Link href={'/register'}>Get Started</Link>
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}

      <section className="relative pt-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className=" absolute inset-0">
          <LiquidEther
            colors={['#F8FAFC', '#FFEDD5', '#FFE0B2']}
            mouseForce={20}
            cursorSize={100}
            isViscous={false}
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.5}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
          />
        </div>
        <div className="relative max-w-7xl mx-auto z-10 ">
          <div className="text-center space-y-5">
            <div className="mb-8 flex justify-center">
              <h1
                className="backdrop-blur-lg border border-amber-200/30 text-amber-700 bg-amber-50/70 px-6 py-3 rounded-full text-sm
                font-semibold shadow-lg flex items-center animate-pulse"
              >
                <Badge className="w-4 h-4 mr-2" />
                Professional Hardware Solutions
              </h1>
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold md:font-extrabold">
                Quality tools meet
              </h1>
              <h1 className="md:text-6xl text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-500 bg-clip-text text-transparent">
                expert craftsmanship
              </h1>
              <p className="text-sm sm:text-2xl  mx-auto mb-10 text-gray-700 max-w-4xl pt-5 ">
                Transform your projects with premium tools and hardware. From
                professional contractors to weekend DIY enthusiasts, we provide
                the quality and expertise you need.
              </p>
            </div>

            <form className="max-w-6xl mx-auto mb-8 ">
              <div>
                <div className="flex sm:flex-row gap-4 p-2 bg-transparent rounded-2xl shadow-2xl  border-0">
                  <input
                    type="text"
                    placeholder="Search tools, hardware, supplies..."
                    className="flex-1 h-14 px-6 bg-white/30 backdrop-blur-lg border border-orange-500 rounded-xl text-lg text-gray-700 md:text-xl py-3 placeholder:text-gray-700 focus:ring-orange-500 focus:outline-none focus:ring-2"
                    required
                  />
                  <button className="h-13 px-8 text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-500/20 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer">
                    Search
                  </button>
                </div>
                <div className="mt-5 flex justify-center gap-x-6">
                  <button className="border p-2 rounded-2xl bg-orange-500 shadow-orange-500/50 text-white font-semibold px-4 cursor-pointer">
                    <Link href={'/register'}>Get Started</Link>
                  </button>
                  <button className=" p-2 rounded-2xl backdrop-blur-lg border border-amber-200/30 text-amber-700 bg-amber-50/70 hover:bg-orange-100 transition-all ease-in-out shadow-orange-500/50 font-semibold px-4 cursor-pointer">
                    <Link href={'/store'}>Browse Catalog</Link>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/** Popular tools */}
      <section className="py-20 relative " id="popular-tools">
        <div className="mx-auto px-4 sm:px-2 lg:px-4">
          <div className="mb-8 text-center max-w-fit items-center mx-auto">
            <h1
              className="bg-gradient-to-r from-orange-100 via-orange-50 to-orange-100
                text-orange-800 border-orange-200  py-3 rounded-full md:text-5xl text-4xl
                font-semibold shadow-lg backdrop-blur-sm flex items-center justify-center mb-2"
            >
              <Hammer className="w-8 h-8 mr-2" />
              Popular Tools
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-600 to-orange-600 mx-auto rounded-full mb-6"></div>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Discover our most trusted tools, chosen by professionals and DIY
              enthusiasts for their reliability and performance.
            </p>
          </div>

          {/** Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="backdrop-blur-lg border border-slate-200/30 bg-white/70 p-8 text-center group cursor-pointer animate-float hover:animate-none hover:-translate-y-2 transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-amber-500/10 rounded-3xl">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:from-amber-200 group-hover:to-amber-100 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-amber-500/20">
                <Drill className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">
                Power Drills
              </h3>
              <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                Professional cordless drills for precision work
              </p>
              <div className="backdrop-blur-lg text-xs px-3 py-1 bg-amber-50/70 text-amber-700 border border-amber-200/30 rounded-full">
                From $89
              </div>
            </div>

            <div
              className="backdrop-blur-lg border border-slate-200/30 bg-white/70 p-8 text-center group cursor-pointer animate-float hover:animate-none hover:-translate-y-2 transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-orange-500/10 rounded-3xl "
              style={{
                animation: 'float 2s ease-in-out infinite',
              }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:from-orange-200 group-hover:to-orange-100 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-orange-500/20">
                <Hammer className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">Hammers</h3>
              <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                Heavy-duty construction hammers built to last
              </p>
              <div className="backdrop-blur-lg text-xs px-3 py-1 bg-orange-50/70 text-orange-700 border border-orange-200/30 rounded-full">
                From $24
              </div>
            </div>

            <div
              className="backdrop-blur-lg border border-slate-200/30 bg-white/70 p-8 text-center group cursor-pointer animate-float hover:animate-none hover:-translate-y-2 transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-red-500/10 rounded-3xl"
              style={{
                animation: 'float 4s ease-in-out infinite',
              }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:from-red-200 group-hover:to-red-100 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-red-500/20">
                <Slice className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">Saws</h3>
              <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                Precision cutting tools for accurate results
              </p>
              <div className="backdrop-blur-lg text-xs px-3 py-1 bg-red-50/70 text-red-700 border border-red-200/30 rounded-full">
                From $45
              </div>
            </div>

            <div
              className="backdrop-blur-lg border border-slate-200/30 bg-white/70 p-8 text-center group cursor-pointer animate-float hover:animate-none hover:-translate-y-2 transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-amber-500/10 rounded-3xl"
              style={{
                animation: 'float 6s ease-in-out infinite',
              }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:from-amber-200 group-hover:to-orange-100 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-amber-500/20">
                <Bolt className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">
                Screwdrivers
              </h3>
              <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                Complete precision screwdriver sets
              </p>
              <div className="backdrop-blur-lg text-xs px-3 py-1 bg-amber-50/70 text-amber-700 border border-amber-200/30 rounded-full">
                From $19
              </div>
            </div>
          </div>
        </div>
      </section>

      {/** */}
      <section className="py-20 relative ">
        <div className="mx-auto px-4 sm:px-2 lg:px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="backdrop-blur-lg border border-slate-200/30 bg-white/70 p-8 group transition-all duration-300 rounded-3xl shadow-lg hover:shadow-xl">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center mb-6 group-hover:from-amber-200 group-hover:to-amber-100 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-amber-500/20">
                <Hammer className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-800">
                Premium Quality
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Professional-grade tools from trusted brands, built to last and
                designed for optimal performance.
              </p>
            </div>

            <div className="backdrop-blur-lg border border-slate-200/30 bg-white/70 p-8 group transition-all duration-300 rounded-3xl shadow-lg hover:shadow-xl">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:from-orange-200 group-hover:to-orange-100 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-orange-500/20">
                <Wrench className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-800">
                Expert Guidance
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Get personalized advice and professional recommendations from
                our experienced team of specialists.
              </p>
            </div>

            <div className="backdrop-blur-lg border border-slate-200/30 bg-white/70 p-8 group md:col-span-2 lg:col-span-1 transition-all duration-300 rounded-3xl shadow-lg hover:shadow-xl">
              <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-50 rounded-2xl flex items-center justify-center mb-6 group-hover:from-red-200 group-hover:to-red-100 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-red-500/20">
                <Paintbrush className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-800">
                Local Service
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Community-focused support with same-day availability and deep
                local project expertise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/** Experience */}
      <section className="py-20 relative ">
        <div className="mx-auto px-4 sm:px-2 lg:px-4">
          {' '}
          <div className="backdrop-blur-xl border border-slate-200/30 bg-white/90 p-12 transition-all duration-300 rounded-3xl shadow-xl">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="group">
                <div className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-3">
                  25+
                </div>
                <div className="text-lg text-slate-600 font-medium">
                  Years Experience
                </div>
              </div>
              <div className="group">
                <div className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent mb-3">
                  10K+
                </div>
                <div className="text-lg text-slate-600 font-medium">
                  Happy Customers
                </div>
              </div>
              <div className="group">
                <div className="text-5xl font-bold bg-gradient-to-r from-red-500 to-amber-600 bg-clip-text text-transparent mb-3">
                  500+
                </div>
                <div className="text-lg text-slate-600 font-medium">
                  Premium Brands
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/** Contacts */}
      <section className="py-20 relative">
        <div className=" mx-auto px-4 sm:px-2 lg:px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Visit Our Store
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Experience our full selection in person and get expert advice for
              your next project.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="backdrop-blur-lg border border-slate-200/30 bg-white/70 p-8 text-center transition-all duration-300 rounded-3xl shadow-lg hover:shadow-xl">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
                <MapPin className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Location
              </h3>
              <p className="text-slate-600 leading-relaxed">
                123 Main Street
                <br />
                Hardware District, HD 12345
              </p>
            </div>

            <div className="backdrop-blur-lg border border-slate-200/30 bg-white/70 p-8 text-center transition-all duration-300 rounded-3xl shadow-lg hover:shadow-xl">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Phone className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Contact</h3>
              <p className="text-slate-600 leading-relaxed">
                (555) 123-4567
                <br />
                info@buildcrafthardware.com
              </p>
            </div>

            <div className="backdrop-blur-lg border border-slate-200/30 bg-white/70 p-8 text-center transition-all duration-300 rounded-3xl shadow-lg hover:shadow-xl">
              <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Hours</h3>
              <p className="text-slate-600 leading-relaxed">
                Mon-Sat: 7AM-8PM
                <br />
                Sunday: 9AM-6PM
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-300 to-amber-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>

        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to find the perfect tools?
          </h2>
          <p className="text-xl text-orange-50 mb-12 max-w-3xl mx-auto leading-relaxed">
            Shop from thousands of high-quality tools, hardware, and supplies
            trusted by professionals and DIYers alike. Get everything you need
            for your next project in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href={'/store'}
              className="bg-white text-orange-700 hover:bg-gray-100 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-105 flex items-center"
            >
              Browse Tools
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <p className="text-orange-100 mt-8 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 mr-2 text-green-400" />
            Fast Shipping • Easy Returns • Guaranteed Quality
          </p>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-16 ">
        <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center">
                  <Hammer className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Re's Hardware
                </h3>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed text-lg">
                Transform your projects with premium tools and hardware. From
                professional contractors to weekend DIY enthusiasts, we provide
                the quality and expertise you need.
              </p>
              <div className="flex space-x-4">
                {[Globe, Heart, Eye].map((Icon, index) => (
                  <button
                    key={index}
                    className="text-gray-400 hover:text-white hover:bg-gray-800 p-3 rounded-xl transition-all duration-200"
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>
            {[
              {
                title: 'Shop',
                links: [
                  'Power Tools',
                  'Hand Tools',
                  'Hardware & Fasteners',
                  'Paint & Supplies',
                  'Electrical & Lighting',
                ],
              },
              {
                title: 'Services',
                links: [
                  'Tool Rentals',
                  'Delivery & Pickup',
                  'Installation Services',
                  'Repair & Maintenance',
                  'Bulk Orders',
                ],
              },
              {
                title: 'Company',
                links: [
                  'About Us',
                  'Store Locator',
                  'Careers',
                  'Blog & Tips',
                  'Contact Support',
                ],
              },
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-bold mb-6 text-lg">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors duration-200 text-base"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="flex items-center space-x-6 mb-5">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-500 text-amber-500"
                  />
                ))}
                <span className="text-slate-600 ml-2 font-medium ">
                  4.9/5 Rating
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Re's Hardware. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 lg:mt-0">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(
                (link, index) => (
                  <a
                    key={index}
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link}
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
