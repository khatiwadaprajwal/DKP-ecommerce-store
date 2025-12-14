import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { motion } from 'framer-motion';
import api from '../config/api'; // ✅ Use centralized API
import { useAuth } from '../context/AuthProvider'; // ✅ Use Auth Context

const Contact = () => {
  const { token } = useAuth(); // ✅ Get token status from context
  
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
    
    // ✅ Check Auth using Context
    if (!token) {
      setStatus({
        type: 'error',
        message: 'Please log in to send a message.'
      });
      setLoading(false);
      return;
    }

    try {
      // ✅ api.post handles BaseURL and Authorization Headers automatically
      const response = await api.post('/v1/send', formData);
      
      setStatus({
        type: 'success',
        message: response.data.message || 'Message sent successfully!'
      });
      
      // Clear form fields
      setFormData({
        name: '',
        email: '',
        msg: ''
      });
    } catch (error) {
      console.error('Error details:', error);
      
      let errorMessage = 'Failed to send message. Please try again.';

      // Handle simplified errors (Interceptor handles redirect on 401)
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
      
      // Clear status message after 5 seconds
      setTimeout(() => {
        setStatus({ type: '', message: '' });
      }, 5000);
    }
  };

  return (
    <div className="contact-page scroll-smooth">
      {/* Hero Section */}
      <motion.section 
        className="bg-red-50 py-16 md:py-24 mx-40 mt-8 rounded-2xl" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contact DKP Clothing</h1>
          <h3 className="text-gray-600 font-light leading-relaxed">
            We're here to help! Whether you have questions about our products, your order, or just want to say hello, feel free to reach out.
          </h3>
        </div>
      </motion.section>

      {/* Contact Information & Form */}
      <section className="py-16 md:py-24 bg-red-50 mt-10 mx-80" data-aos="fade-up">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div data-aos="fade-left">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <p className="text-gray-600 mb-4">
              Visit us at our store in Sundarharaincha, Morang, or contact us through any of the methods below.
            </p>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Store Location</h3>
                <p className="text-gray-600">DKP Clothing, Sundarharaincha, Morang, Nepal</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Phone</h3>
                <p className="text-gray-600">+977-9800000000</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Email</h3>
                <p className="text-gray-600">contact@dkpclothing.com</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Store Hours</h3>
                <p className="text-gray-600">Sunday - Friday: 10 AM - 7 PM</p>
                <p className="text-gray-600">Saturday: Closed</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div data-aos="fade-right">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            
            {/* Status Message */}
            {status.message && (
              <div className={`mb-4 p-3 rounded-lg ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {status.message}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Your Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Message</label>
                <textarea
                  name="msg"
                  placeholder="Write your message"
                  rows="5"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                  value={formData.msg}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className={`w-full font-semibold py-3 rounded-lg transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'}`}
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
          <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
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