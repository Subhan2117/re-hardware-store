import React from 'react';
import LiquidEther from '../../component/background/LiquidEther';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import longIsland from '@/public/long island.jpg';
import Navbar from '@/app/component/Navbar';

export default function Page() {
  return (
    <div className="py-10 min-h-screen bg-transparent bg-gradient-to-br from-orange-200 via-slate-100 to-orange-200 relative px-4">
      {/* Background */}

      <div>
        <div className="absolute inset-0">
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
      </div>

      <div className="bg-transparent">
        {/* Header */}
        <header className="relative z-10 text-center py-16">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg tracking-wide">
            About Re's Hardware Store
          </h1>
          <p className="text-lg font-semibold text-gray-800">
            Serving Long Island since 1995
          </p>
        </header>

        {/* "Who We Are" Section */}
        <section className="relative z-10 max-w-3xl mx-auto text-center mb-20 space-y-10 px-4">
          <h2 className="text-4xl font-bold drop-shadow-lg tracking-wide">
            Who We Are
          </h2>
          <p className="text-lg text-gray-800">
            Welcome to <strong>Re’s Hardware Store</strong>, your trusted
            neighborhood hardware store. Our story begins with our founder,{' '}
            <strong>Professor Re</strong>, who wanted to give back to his
            community. Ever since 1995, he has been committed to helping
            homeowners, contractors, and DIY enthusiasts find exactly what they
            need to get the job done right.
          </p>
        </section>

        {/* Image Section */}
        <section className="relative z-10 max-w-2xl mx-auto mb-24">
          <Image
            src={longIsland}
            alt="Long Island"
            width={800} // slightly smaller
            height={500}
            className="w-full h-auto object-cover rounded-lg mx-auto shadow-xl/30"
          />
        </section>

        {/* "Our Goals" Section */}
        <section className="relative z-10 max-w-3xl mx-auto text-center mb-20 space-y-6 px-4">
          <h2 className="text-4xl font-bold drop-shadow-lg tracking-wide">
            Our Goals
          </h2>
          <p className="text-lg text-gray-800">
            Simply put, we want to make your projects, visions, and dreams
            easier, achievable, safer, and more successful.
          </p>
          <p className="text-lg text-gray-800">
            At <strong>Re’s Hardware Store</strong>, we believe a hardware store
            is more than just shelves of products—it’s a place where knowledge
            and community come together. Our staff takes pride in sharing
            hands-on experience, whether you’re fixing a leaky faucet, building
            a deck, or tackling a major renovation.
          </p>
        </section>

        {/* "Our Services" Section */}
        <section className="relative z-10 max-w-3xl mx-auto text-center mb-20 space-y-6 px-4">
          <h2 className="text-4xl font-bold mb-6 drop-shadow-lg tracking-wide">
            Our Services
          </h2>

          <ul className="space-y-4 text-left max-w-xl mx-auto">
            <li className="flex items-center">
              <span className="inline-block w-4 h-4 bg-gradient-to-r from-orange-400 to-yellow-300 rounded-full animate-pulse mr-4"></span>
              <span className="text-gray-800 font-semibold">
                Quality Tools & Supplies: From trusted brands you rely on.
              </span>
            </li>

            <li className="flex items-center">
              <span className="inline-block w-4 h-4 bg-gradient-to-r from-orange-400 to-yellow-300 rounded-full animate-pulse mr-4"></span>
              <span className="text-gray-800 font-semibold">
                Expert Guidance: Personalized help from people who know their
                trade.
              </span>
            </li>

            <li className="flex items-center">
              <span className="inline-block w-4 h-4 bg-gradient-to-r from-orange-400 to-yellow-300 rounded-full animate-pulse mr-4"></span>
              <span className="text-gray-800 font-semibold">
                Community Focus: Supporting local builders, makers, and
                families.
              </span>
            </li>

            <li className="flex items-center">
              <span className="inline-block w-4 h-4 bg-gradient-to-r from-orange-400 to-yellow-300 rounded-full animate-pulse mr-4"></span>
              <span className="text-gray-800 font-semibold">
                Customer Service: Friendly, approachable, and always here to
                help.
              </span>
            </li>
          </ul>
        </section>

        {/* Mission Statement Section */}
        <section className="relative z-10 max-w-3xl mx-auto text-center mb-20 space-y-6 px-4">
          <h2 className="text-4xl font-bold mb-6 drop-shadow-lg tracking-wide">
            Our Mission
          </h2>
          <p className="text-lg text-gray-800">
            Big ideas? Bold projects? We’ve got you covered. Re’s Hardware Store
            is your one-stop shop for everything hardware, making sure no
            project is ever out of reach. From the first screw to the final
            flourish, we’re here to help you build it right.
          </p>
        </section>

        {/* Closing Paragraph */}
        <section className="relative z-10 max-w-3xl mx-auto text-center mb-24 px-4">
          <p className="text-lg text-gray-800">
            We’re proud to serve Long Island and look forward to being your
            go-to source for hardware, tools, and advice for years to come. Come
            visit us today and let’s make your visions come to life!
          </p>
        </section>
      </div>
    </div>
  );
}
