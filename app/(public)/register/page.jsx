"use client";
import { Badge } from 'lucide-react';
import LiquidEther from '../../component/background/LiquidEther';
import { CheckCircle } from 'lucide-react';

export default function Page() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-slate-100 to-orange-200 overflow-hidden relative flex items-center justify-center px-4">
      <div className="absolute inset-0">
        <LiquidEther
          colors={["#F8FAFC", "#FFEDD5", "#FFE0B2"]}
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



      <div className="relative z-10 w-full max-w-4xl rounded-2xl shadow-2xl border border-amber-200/40 overflow-hidden bg-white/80 backdrop-blur-lg min-h-[600px]">
        <div className="flex items-stretch">
    

          <div className="w-1/2 p-8">
            <h1 className="text-sm md:text-2xl font-bold md:font-extrabold">Register</h1>
            <h3 className="text-sm mx-auto mb-8 text-gray-500">
            Already have an account?<a href="./login" className="text-amber-600 font-semibold hover:underline">Click Here</a>
            </h3>
            <div className="flex justify-center">
              <button className="border border-gray-300 mb-5 w-full py-2 rounded-2xl shadow-2xl bg-gray-100 hover:bg-gray-200 cursor-pointer">
                Sign in With Google
              </button>
            </div>
            <br></br>
            <form className="space-y-4">
              <div className="p-2 bg-white rounded-2xl shadow-2xl border border-gray-100">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full h-10 px-6 border-0 rounded-xl text-lg text-gray-700 md:text-xl placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                  required
                />
              </div>
              <div className="p-2 bg-white rounded-2xl shadow-2xl border border-gray-100">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full h-10 px-6 border-0 rounded-xl text-lg text-gray-700 md:text-xl placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                  required
                />
              </div>
              <div className="p-2 bg-white rounded-2xl shadow-2xl border border-gray-100">
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full h-10 px-6 border-0 rounded-xl text-lg text-gray-700 md:text-xl placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                  required
                />
              </div>
              <div className="flex items-center justify-center mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-amber-500 text-white font-semibold border border-amber-200/50"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>





          <div className="w-1/2 p-8 flex items-center justify-center text-center bg-gradient-to-r from-amber-600 via-orange-600 to-red-500 min-h-[600px]">
            <p className="text-white text-xl font-semibold">
              Welcome to our Hardware Store!
              <br />
              Create an account today and start exploring 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
