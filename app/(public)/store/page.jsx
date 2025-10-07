// app/catalog/page.jsx
import Navbar from '@/app/component/Navbar';
import {
  categoryOptions,
  priceOptions,
  stockOptions,
  mockProducts,
} from '@/app/mock-data/mockProducts';
import StoreClient from './StoreClient';


export default async function Page(props) {
  const searchParams = await props.searchParams;
  // read initial search query from URL (?search=...)
  const initialSearch =
    typeof searchParams?.search === 'string' ? await searchParams.search : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-slate-100 to-orange-200 overflow-hidden">
      <Navbar />

      <StoreClient
      
        mockProducts={mockProducts}
        categoryOptions={categoryOptions}
        priceOptions={priceOptions}
        stockOptions={stockOptions}
        initialSearch={initialSearch}
      />
    </div>
  );
}
