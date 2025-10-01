'use client'

import Navbar from '../../component/Navbar';


//EXample items below

const items = [
  { id: '1', name: 'Professional Cordless Drill Set', price: 129.99, quantity: 1, image: '/cordless-drill.png', sku: 'DRL-2024-PRO' },
  { id: '2', name: 'Heavy Duty Hammer 16oz',        price: 24.99,  quantity: 2, image: '/hammer-tool.png',    sku: 'HMR-16-HD' },
  { id: '3', name: 'Adjustable Wrench Set (3-Piece)',price: 45.99,  quantity: 1, image: '/wrench-set.jpg',     sku: 'WRN-SET-3' },
  { id: '4', name: 'Watch',price: 47.99,  quantity: 1, image: '/wrench-set.jpg',     sku: 'WRN-SET-3' },
]



export default function Page() {
  //for now shipping and tax is static (honestly can keep them static since tax and shipping usually never change)
  const subtotal = items.reduce((total, current) => total + current.price * current.quantity, 0) // reduce is a loop that goes through items and gets all prices, (S is the total and current is the current item, those are evaulted via price * quality,,, 0 is starting price)

  //keep the same maybe?
  const shipping = 12.99
  const tax = subtotal * 0.085
  const total = (subtotal + shipping + tax).toFixed(2) // tofixed rounds to the 2nd decimal place


  return (
    <div>
      <Navbar /> {/*using what we had already*/}

      <main
        style={{
          backgroundColor: '#FAEBD7',
          minHeight: '100vh',
          paddingTop: '150px',
          paddingLeft: '50px',
          paddingRight: '50px',
          color: 'black',
        }}
      >




        {/* big shopping cart on top*/}
        <div className="mb-6">
          <h1 className="text-4xl md:text-4xl font-bold md:font-extrabold mb-2">
            Shopping Cart
          </h1>
          <p className="text-black/70">
            Please review your items and proceed to checkout
          </p>
        </div>

        {/* 2-col layout: left = cart items, right = summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">




          {/* All items in char*/}
          <section className="lg:col-span-2 space-y-6">
            {/*Dynamically calling the items*/}
            {items.map(item => {
              const lineTotal = (item.price * item.quantity).toFixed(2)

              return (
                <div key={item.id} className="rounded-2xl border border-black/10 bg-white p-4 md:p-6 shadow-sm">
                  <div className="flex gap-4 md:gap-6 items-start">
            

                    {/* Presentation of items*/}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-lg md:text-xl truncate">{item.name}</h3>
                          <p className="text-sm text-black/60 mt-1">SKU: {item.sku}</p>
                          <p className="text-sm text-black/70 mt-1">Quantity: {item.quantity}</p>
                        </div>
                      </div>


                      {/* Price & Quantity on the right */}
                        <div className="mt-4 flex items-end justify-between">
                        {/* Logic hasnt been applied yet just for looks right now! */}
                        <div className="inline-flex items-center gap-3 bg-black/5 rounded-xl p-1">
                            <span className="h-9 w-9 inline-flex items-center justify-center rounded-lg select-none"> −</span>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <span className="h-9 w-9 inline-flex items-center justify-center rounded-lg select-none">+</span>
                        </div>

                        {/*  total at the right end of the box*/}
                        <div className="text-right">
                        <p className="text-xl md:text-2xl font-extrabold">${lineTotal}</p>


                        {/*Only happens when there is more than 1 item*/}
                        {item.quantity > 1 && (<p className="text-xs text-black/60">${item.price} each</p>)}
                        </div>
                        </div>
                    </div>
                </div>
                </div>
              )
            })}
            {/*redirect back to store*/}
            <a href="./store" className="inline-flex items-center gap-2 rounded-xl border border-black/15 px-4 py-2 font-medium hover:bg-black/5 transition">Continue Shopping</a>
          </section>











          {/* RIGHT: order summary */}
          <div className="lg:col-span-1 space-y-4">
            {/* Summary card */}
            <div className="sticky top-24 rounded-2xl border border-black/10 bg-white p-6 shadow">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              {/*subtoal*/}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black/60">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>

                
              {/*Shippin Cal*/}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black/60">Shipping</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>

                
              {/*Tax*/}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black/60">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>

                <hr className="border-black/10" />

                
              {/*Total*/}
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-3xl font-extrabold">${total}</span>
                </div>
              </div>


              {/*Proceeded to checkout button*/}
              <button className="w-full mb-5 inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-white font-semibold hover:opacity-90 active:opacity-80 transition">
                Proceed to Checkout
              </button>

              {/* promo code section */}
              <div>
                <label htmlFor="promo" className="block text-sm font-medium mb-2">
                  Promo Code
                </label>

                <div className="flex gap-2">
                  <input
                    id="promo"
                    placeholder="Enter code"
                    className="flex-1 rounded-xl border border-black/15 px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"
                  />
                  <button className="rounded-xl border border-black/15 px-4 py-2 font-medium hover:bg-black/5">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
