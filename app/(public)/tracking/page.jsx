import React from "react";
import LiquidEther from "../../component/background/LiquidEther";
import Navbar from "@/app/component/Navbar";
import TrackingSearch from "@/app/component/TrackingSearch"

export default function page(){
    return(
        <div className="py-10 min-h-screen bg-transparent bg-gradient-to-br from-orange-200 via-slate-100 to-orange-200 relative px-4">
        
            <Navbar/>
            
            <div className="bg-transparent">
                {/* Header */}
                <header className="relative z-10 text-center py-16">
                    <h1 className="text-5xl font-bold mb-4 drop-shadow-lg tracking-wide">Track Your Order</h1>
                    <p className="text-lg font-semibold text-gray-800">
                    Enter your tracking number below to see the current status and location of your order
                    </p>
                </header>
            </div>

            <TrackingSearch/>
 
        </div>
    );
}