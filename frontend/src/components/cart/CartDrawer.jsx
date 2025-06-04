import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, cartItems = [] }) => {
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Cart Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ShoppingBag className="h-12 w-12 mb-4" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm"
                    >
                      {/* Product Image */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 object-cover rounded-md"
                      />

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.color} / {item.size}
                        </p>
                        <div className="flex items-center mt-2">
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="mx-2">{item.quantity}</span>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-medium">${item.price}</p>
                        <button className="text-sm text-red-500 mt-2">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-gray-50">
              <div className="flex justify-between mb-4">
                <span>Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <button
                disabled={cartItems.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer; 