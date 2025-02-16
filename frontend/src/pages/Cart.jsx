import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/Shopcontext";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

const Cart = () => {
  const {
    cartData,
    removeFromCart,
    updateCartQuantity,
    delivery_fee,
    navigate,
  } = useContext(ShopContext);
  const [selectedItems, setSelectedItems] = useState([]);

  // Convert cartData into an array with productId & variants (size, quantity)
  const cartItems = Object.entries(cartData).flatMap(([productId, variants]) =>
    variants.map((variant) => ({
      productId,
      size: variant.size,
      quantity: variant.quantity,
      name: variant.name || "Unknown Product",
      price: variant.price || 0,
      image: variant.image || "/placeholder.jpg",
    }))
  );

  // Calculate total price of selected items
  const totalPrice = selectedItems.reduce((total, selectedItem) => {
    const item = cartItems.find(
      (product) =>
        product.productId === selectedItem.productId &&
        product.size === selectedItem.size
    );
    return total + (item ? item.price * item.quantity : 0);
  }, 0);

  // Handle selection toggle
  const toggleSelectItem = (productId, size) => {
    console.log("Selected Items Before:", selectedItems);
    console.log("Toggling item with Product ID:", productId, "Size:", size);
  
    setSelectedItems((prev) => {
      const updatedItems = prev.some(
        (item) => item.productId === productId && item.size === size
      )
        ? prev.filter((item) => !(item.productId === productId && item.size === size))
        : [...prev, { productId, size }];
      
      console.log("Selected Items After:", updatedItems);
      return updatedItems;
    });
  };
  

  //Handle checkout
  const handleCheckout = () => {
    console.log("Selected Items for Checkout:", selectedItems); // Debugging log
    if (selectedItems.length === 0) {
      toast.error("Select at least one item to proceed to checkout!");
    } else {
      navigate("/placeOrder");
    }
  };
  

  return (
    <div className=" mx-auto min-h-250 p-6">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <p className="text-gray-500 text-xl">Your cart is empty.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Cart Items Section */}
          <div className="md:col-span-2  space-y-4">
            {cartItems.map((item, index) => (
              <div
                key={`${item.productId}-${item.size}-${index}`}
                className="flex items-center bg-gray-200 shadow rounded-2xl p-4"
              >
                <input
                  type="checkbox"
                  checked={selectedItems.some(
                    (selected) =>
                      selected.productId === item.productId &&
                      selected.size === item.size
                  )}
                  onChange={() => toggleSelectItem(item.productId, item.size)}
                  className="mr-4"
                />
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 ml-4">
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="text-gray-600">Size: {item.size}</p>
                  <p className="text-red-500 font-bold">Rs. {item.price}</p>
                  <div className="flex items-center mt-2">
                    <button
                      className="px-2 py-1 bg-gray-200 rounded cursor-pointer"
                      onClick={() =>
                        updateCartQuantity(
                          item.productId,
                          item.size,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                    >
                      -
                    </button>
                    <span className="px-4">{item.quantity}</span>
                    <button
                      className="px-2 py-1 bg-gray-200 rounded cursor-pointer"
                      onClick={() =>
                        updateCartQuantity(
                          item.productId,
                          item.size,
                          item.quantity + 1
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="ml-4 text-red-600 hover:text-red-800 cursor-pointer"
                  onClick={() => removeFromCart(item.productId, item.size)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
          {/* Cart Total Box */}
          <div className="p-6 bg-orange-200 shadow max-h-200 rounded-lg">
            <h2 className="text-4xl font-semibold mb-4">CART TOTALS</h2>
            <div className="bg-orange-100 rounded  px-4 py-4 my-6 flex justify-between">
              <span className="text-xl font-bold">SUB TOTAL :</span>
              <span className="text-xl font-bold">Rs. {totalPrice}</span>
            </div>
            <div className="bg-orange-100 rounded  px-4 py-4 my-6 flex justify-between">
              <span className="text-xl font-bold">SHIPPING COST :</span>
              <span className="text-xl font-bold">Rs. {delivery_fee}</span>
            </div>
            <div className="bg-orange-100 rounded  px-4 py-4 my-6 flex justify-between">
              <span className="text-xl text-red-700 font-bold">TOTAL :</span>
              <span className="text-xl text-red-700 font-bold">
                Rs. {totalPrice + delivery_fee}
              </span>
            </div>
              <button
                disabled={selectedItems.length === 0}
                onClick={handleCheckout}
                className="w-full mt-4 bg-black text-white py-4 rounded cursor-pointer text-xl hover:bg-gray-800 disabled:bg-gray-400"
              >
                Proceed to Checkout
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
