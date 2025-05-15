import React from 'react'

const Newsletter = () => {
  return (
    <div className='bg-green-50 border border-neutral-200 rounded-2xl mx-70'>
       {/* CTA Section */}
       <section className=" py-16 ">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Join Our Journey</h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8">
            Subscribe to our newsletter and be the first to know about new collections, 
            special offers, and behind-the-scenes content.
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-grow px-4 py-3 text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Newsletter
