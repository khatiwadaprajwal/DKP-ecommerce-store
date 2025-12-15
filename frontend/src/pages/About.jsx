import React from 'react';
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      {/* Mobile: mx-0 for full width | Laptop: mx-40 for boxed look */}
      <section className="bg-red-50 py-12 md:py-24 mx-0 md:mx-20 lg:mx-40 mt-0 md:mt-8 md:rounded-2xl transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About DKP Clothing</h1>
            <h3 className="text-gray-600 text-base md:text-lg leading-relaxed mb-8">
              Crafting premium clothing with attention to detail since 2018. Our mission is to provide 
              sustainable, ethically made fashion that helps you express your unique style.
            </h3>
            <div className="w-16 h-1 bg-blue-600 mx-auto"></div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-12 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-1/2">
              <img 
                src={assets.dikshyantaImage || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                alt="Our story" 
                className="rounded-lg shadow-lg w-full h-auto object-cover"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="mb-4 text-base md:text-lg font-medium text-gray-700">
                Welcome to DKP Clothing, your go-to destination for stylish and authentic fashion in the heart of Sundarharaincha, Morang. Located in the beautiful eastern region of Nepal, we take pride in offering a diverse collection of clothing that celebrates both modern trends and our rich Nepali culture. 
              </p>
              <p className="mb-4 text-base md:text-lg text-gray-600">
                From elegant suits and graceful sarees to traditional Nepali cultural dresses and trendy tops, DKP Clothing is committed to providing high-quality fashion for every occasion. Our goal is to bring you a unique shopping experience where tradition meets contemporary style, all while delivering exceptional service and affordable prices.
              </p>
              <p className="mb-4 text-base md:text-lg text-gray-600">
                Over the years, we've grown into a team of 6 passionate craftspeople, designers, and fashion enthusiasts 
                who share the same vision – to make clothing that makes you feel confident and comfortable.
              </p>
              <div className="mt-8">
                <p className="text-gray-900 font-medium mt-2">Sharada Bhattarai, Founder</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-red-50 py-12 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-sm md:text-base">
              These core principles guide everything we do, from designing our collections to 
              packaging your order.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                ),
                title: "Sustainability",
                description: "We use eco-friendly materials and ethical manufacturing processes to minimize our environmental footprint."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Quality",
                description: "We believe in creating products that stand the test of time, both in style and durability."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: "Community",
                description: "We're committed to fair labor practices and supporting the communities where our clothing is made."
              }
            ].map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="text-blue-600 mb-4 flex justify-center">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-sm md:text-base">
              The talented individuals behind DKP Clothing who bring creativity and 
              passion to everything we do.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Sharada Bhattarai",
                position: "Founder & Creative Director",
                // Image: Mature professional woman (generic south asian representation)
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              },
              {
                name: "Ambika Sigdel",
                position: "Head of Marketing",
                // Image: Professional woman (generic representation)
                image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              },
              {
                name: "Puja Magar",
                position: "Sales Executive",
                // Image: Young professional woman
                image: "https://images.unsplash.com/photo-1590650153855-d9e808231d41?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              },
              {
                name: "Buddhi Prasad Bhattarai",
                position: "Relation Manager",
                // Image: Professional man (generic representation)
                image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              }
            ].map((member, index) => (
              <div key={index} className="text-center group">
                <div className="overflow-hidden rounded-lg mb-4 mx-auto w-full max-w-[280px] aspect-square shadow-sm">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-blue-600 font-medium text-sm">{member.position}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-red-50 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-black">
            {[
              { number: "7+", label: "Years Experience" },
              { number: "15K+", label: "Happy Customers" },
              { number: "200+", label: "Products" },
              { number: "4", label: "Store Locations" }
            ].map((stat, index) => (
              <div key={index}>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</h2>
                <p className="text-black text-sm md:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-12 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          </div>

          <div className="bg-gray-50 p-8 md:p-12 rounded-lg max-w-3xl mx-auto relative">
            <svg className="h-12 w-12 text-blue-600 opacity-20 absolute top-6 left-6" fill="currentColor" viewBox="0 0 32 32">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            <div className="relative z-10">
              <p className="text-gray-600 text-base md:text-lg italic mb-6">
                "I've been a loyal customer of DKP Clothing for over 3 years now. Their attention to quality
                and detail is unmatched. My shirts from them still look new after countless washes!"
              </p>
              <div className="flex items-center">
                <img
                  // Image: Customer testimonial
                  src="https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                  alt="Customer"
                  className="h-12 w-12 rounded-full object-cover mr-4 shadow-sm"
                />
                <div>
                  <p className="font-medium text-gray-900">Sita Dhungana</p>
                  <p className="text-gray-500 text-sm">Gachhiya, Morang</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

