import Navbar from '@/app/component/Navbar';
import { ArrowLeft } from 'lucide-react';

import Link from 'next/link';
import ProductDetailsClient from './DetailsClient';
import ProductTabs from '@/app/component/ProductTabs';

export default async function page(props) {
  const { id: _id } = await props.params; // code mode generateed
  const id = Array.isArray(_id) ? _id[0] : String(_id || '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50/30">
      <Navbar />

      {/* Main Content */}

      <div className="pt-24 pb-16 px-6 ">
        <div className="container mx-auto">
          {/* Back Button */}

          <Link href={'/store'}>
            <button className="flex items-center mb-8 text-slate-600 hover:text-amber-600 cursor-pointer transition-all duration-300 hover:bg-gray-200 px-2 py-1 rounded-2xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Store
            </button>
          </Link>
          <div>
            <ProductDetailsClient productId={id} />

            <ProductTabs productId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
