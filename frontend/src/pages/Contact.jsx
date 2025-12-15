import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { motion } from 'framer-motion';
import api from '../config/api'; 
import { useAuth } from '../context/AuthProvider'; 

const Contact = () => {
  const { token } = useAuth(); 
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    msg: ''
  });
  const [status, setStatus] = useState({
    type: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-out',
      once: true,
    });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!token) {
      setStatus({
        type: 'error',
        message: 'Please log in to send a message.'
      });
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/v1/send', formData);
      
      setStatus({
        type: 'success',
        message: response.data.message || 'Message sent successfully!'
      });
      
      setFormData({
        name: '',
        email: '',
        msg: ''
      });
    } catch (error) {
      console.error('Error details:', error);
      let errorMessage = 'Failed to send message. Please try again.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setStatus({ type: '', message: '' });
      }, 5000);
    }
  };

  return (
    <div className="contact-page scroll-smooth">
      {/* Hero Section */}
      <motion.section 
        className="bg-red-50 py-12 md:py-24 mx-0 md:mx-20 lg:mx-40 mt-0 md:mt-8 md:rounded-2xl transition-all duration-300" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contact DKP Clothing</h1>
          <h3 className="text-gray-600 font-light leading-relaxed text-base md:text-lg">
            We're here to help! Whether you have questions about our products, your order, or just want to say hello, feel free to reach out.
          </h3>
        </div>
      </motion.section>

      {/* Contact Information & Form */}
      {/* REMOVED bg-red-50 from here to create the gap effect */}
      <section className="py-12 md:py-24 mt-0 md:mt-10 mx-0 md:mx-20 lg:mx-40 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {/* 1. LEFT CARD: Contact Information */}
          {/* Added bg-red-50 here individually */}
          <div className="bg-red-50 p-8 md:p-10 rounded-2xl shadow-sm" data-aos="fade-left">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <p className="text-gray-600 mb-8">
              Visit us at our store in Sundarharaincha, Morang, or contact us through any of the methods below.
            </p>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm">
                   <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Store Location</h3>
                  <p className="text-gray-600">DKP Clothing, Sundarharaincha,<br/>Morang, Nepal</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                 <div className="bg-white p-3 rounded-full shadow-sm">
                   <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Phone</h3>
                  <p className="text-gray-600">+977-9800000000</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm">
                   <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Email</h3>
                  <p className="text-gray-600">contact@dkpclothing.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                 <div className="bg-white p-3 rounded-full shadow-sm">
                   <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Store Hours</h3>
                  <p className="text-gray-600">Sun - Fri: 10 AM - 7 PM</p>
                  <p className="text-gray-500 text-sm">Saturday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. RIGHT CARD: Contact Form */}
          {/* Added bg-red-50 here individually */}
          <div className="bg-red-50 p-8 md:p-10 rounded-2xl shadow-sm" data-aos="fade-right">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            
            {status.message && (
              <div className={`mb-4 p-3 rounded-lg ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {status.message}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  className="w-full p-4 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 bg-white shadow-sm"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Your Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full p-4 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 bg-white shadow-sm"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Message</label>
                <textarea
                  name="msg"
                  placeholder="Write your message"
                  rows="5"
                  className="w-full p-4 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 bg-white shadow-sm"
                  value={formData.msg}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className={`w-full font-bold py-4 rounded-xl transition-all shadow-md transform active:scale-95 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white hover:shadow-lg'}`}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Google Map Embed */}
      <section className="py-16" data-aos="zoom-in">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">Find Us Here</h2>
          <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
            <iframe
              title="DKP Clothing Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3530.426068483099!2d87.3184119!3d26.657657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ef6fc99f3f457b%3A0x97f335102f708317!2sDikshanta%20Kapada%20Pasal!5e0!3m2!1sen!2snp!4v1709638740736!5m2!1sen!2snp"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;