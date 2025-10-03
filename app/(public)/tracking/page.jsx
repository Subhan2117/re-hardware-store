import React from "react";
import LiquidEther from "../../component/background/LiquidEther";
import Navbar from "@/app/component/Navbar";
import TrackingSearch from "@/app/component/TrackingSearch"

export default function Page(){
    return(
        <div className="py-10 min-h-screen bg-transparent bg-gradient-to-br from-orange-200 via-slate-100 to-orange-200 relative px-4">
        
        <Navbar/>
        
        {/* Background */}
        {/* NOTE: change to plain background */}

        <div>
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
        </div> 


        <div className="bg-transparent">
            {/* Header */}
            <header className="relative z-10 text-center py-16">
                <h1 className="text-5xl font-bold mb-4 drop-shadow-lg tracking-wide">Track Your Order</h1>
                <p className="text-lg font-semibold text-gray-800">
                Enter your tracking number below to see the current status and location of your order
                </p>
            </header>
        <div/>

        <TrackingSearch/>

        
        </div>
    );
}