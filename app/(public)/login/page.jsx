"use client";
import { Badge } from 'lucide-react';
import LiquidEther from '../../component/background/LiquidEther';
import { CheckCircle } from 'lucide-react';

export default function page(){
    async function onSubmit (event){
        event.preventDefault();

        const res = await fetch('...' , {
            method:"POST",
            body: JSON.stringify({email,password}) 
        });

        if(!res.ok){
            throw new Error("Login Failed.");
        }
        
        console.log("successful login!");
    }

 return(
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-slate-100 to-orange-200 overflow-hidden relative flex items-center justify-center px-4">
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
        
        <div className="relative w-full max-w-md backdrop-blur-lg bg-white/80 border border-amber-200/40 shadow-2xl rounded-2xl p-8 z-10">
            <h1 className="text-sm md:text-2xl font-bold md:font-extrabold">Login</h1>
            <h3 className="text-sm mx-auto mb-8 text-gray-500">Need to make an account? <a href='./register' className = 'text-amber-600 font-semibold hover:underline'>Click Here</a></h3>
            <form className='space-y-4' onSubmit={onSubmit}>
                <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-2xl shadow-2xl border border-gray-100">
                    <input
                    type="email"
                    placeholder="Email Address"
                    className="flex-1 h-8 px-6 border-0 rounded-xl text-lg text-gray-700md:text-xl py-3 placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                    required
                    />
                </div>
                <br></br>
                <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-2xl shadow-2xl border border-gray-100">
                    <input
                    type="password"
                    placeholder="Password"
                    className="flex-1 h-8 px-6 border-0 rounded-xl text-lg text-gray-700md:text-xl py-3 placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                    required
                    />
                </div>
                <br></br>
                <div className='flex items-center justify-center mb-6'>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50">      
                    <button type="submit">Login</button>
                </div>
            </div>
            </form>
        </div>
    </div>
    

 ); 
}