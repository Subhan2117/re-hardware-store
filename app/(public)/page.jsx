import { Badge } from 'lucide-react';
import LiquidEther from '../component/background/LiquidEther';
import { CheckCircle } from 'lucide-react';
export default function page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-slate-100 to-orange-200 overflow-hidden">
      <div className='absolute top-6 right-8 z-20'>
        <a href='./login' 
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg transition-all duration-200">
          Login
        </a>
      </div>
      
      
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
                font-semibold shadow-lg flex items-center"
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
              <p className="text-xl sm:text-2xl  mx-auto mb-10 text-gray-700 max-w-4xl">
                Transform your projects with premium tools and hardware. From
                professional contractors to weekend DIY enthusiasts, we provide
                the quality and expertise you need.
              </p>
            </div>

            <form className="max-w-lg mx-auto mb-10 ">
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-2xl shadow-2xl border border-gray-100">
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="flex-1 h-14 px-6 border-0 rounded-xl text-lg text-gray-700md:text-xl py-3 placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                  required
                />
                <button className="h-13 px-8 text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-500/20 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  Search
                </button>
              </div>
            
            </form>
          </div>
        </div>
      </section>


    </div>
  );
}
