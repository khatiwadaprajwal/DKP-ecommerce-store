import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { 
  MapPin, 
  CreditCard, 
  DollarSign,
  X,
  Package,
  MapIcon
} from "lucide-react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Leaflet Icon Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ onLocationSelected }) => {
  const [position, setPosition] = useState(null);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelected(e.latlng);
    },
  });
  return position === null ? null : <Marker position={position} />;
};

const QuickOrder = ({ isOpen, onClose, productData, selectedSize, selectedColor, quantity }) => {
  const { token, delivery_fee, fetchCartData, backend_url } = useContext(ShopContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "", address: "", city: "", state: "", zipCode: "", phone: ""
  });

  const [location, setLocation] = useState({ lat: 27.7172, lng: 85.3240 });
  const [locationSelected, setLocationSelected] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => { setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }); },
        (error) => { console.error("Error getting location:", error); }
      );
    }
    if (isOpen) {
      // Reset form when opening
      setShippingInfo({ fullName: "", address: "", city: "", state: "", zipCode: "", phone: "" });
      setLocationSelected(false);
      setPaymentMethod("Cash");
    }
  }, [isOpen]);

  const subtotal = productData ? productData.price * quantity : 0;
  const total = subtotal + delivery_fee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLocationSelected = (latlng) => {
    setLocation({ lat: latlng.lat, lng: latlng.lng });
    setLocationSelected(true);
    toast.success("Location selected successfully!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 🔴 1. Check if User is Logged In
    if (!token) {
      toast.error("Please login to place an order");
      onClose();
      navigate('/login'); // Redirect to login page
      return;
    }

    // Validation
    for (const [key, value] of Object.entries(shippingInfo)) {
      if (!value.trim()) {
        toast.error(`Please enter your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }
    
    if (!locationSelected) { toast.error("Please select your location on the map"); return; }
    if (!productData || !selectedSize) { toast.error("Please select a product size"); return; }
    
    setIsLoading(true);
    
    try {
      const formattedAddress = `${shippingInfo.fullName}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}, ${shippingInfo.phone}`;
      
      const orderData = {
        productId: productData._id,
        quantity: quantity,
        address: formattedAddress,
        location: location,
        paymentMethod: paymentMethod, 
        color: selectedColor || "White", // Default if missing
        size: selectedSize
      };
      
      const response = await axios.post(
        `${backend_url}/v1/place`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.khaltiUrl) {
        // Redirect to Khalti
        window.location.href = response.data.khaltiUrl;
      } else {
        // Standard Success (COD)
        fetchCartData();
        toast.success("Order placed successfully!");
        onClose();
        navigate("/order", { state: { order: response.data.order } });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      
      // 🔴 2. Handle 401 specifically in catch block
      if (error.response && error.response.status === 401) {
        toast.error("Session expired. Please login again.");
        onClose();
        navigate('/login');
      } else {
        toast.error(error.response?.data?.error || "Failed to place order");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-[70%] max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">Quick Checkout</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center"><MapPin className="mr-2 text-blue-600" />Shipping Information</h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4 col-span-2"><label className="block text-sm font-medium">Full Name</label><input type="text" name="fullName" value={shippingInfo.fullName} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" required /></div>
                    <div className="mb-4 col-span-2"><label className="block text-sm font-medium">Address</label><input type="text" name="address" value={shippingInfo.address} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" required /></div>
                    <div className="mb-4"><label className="block text-sm font-medium">City</label><input type="text" name="city" value={shippingInfo.city} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" required /></div>
                    <div className="mb-4"><label className="block text-sm font-medium">State</label><input type="text" name="state" value={shippingInfo.state} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" required /></div>
                    <div className="mb-4"><label className="block text-sm font-medium">ZIP Code</label><input type="text" name="zipCode" value={shippingInfo.zipCode} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" required /></div>
                    <div className="mb-4"><label className="block text-sm font-medium">Phone</label><input type="tel" name="phone" value={shippingInfo.phone} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" required /></div>
                  </div>
                  
                  <div className="mt-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><MapIcon className="mr-2 text-blue-600" />Select Your Location</h2>
                    <div className="border rounded-lg overflow-hidden" style={{ height: "250px" }}>
                      <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationPicker onLocationSelected={handleLocationSelected} />
                        {locationSelected && <Marker position={[location.lat, location.lng]} />}
                      </MapContainer>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-4 mt-6 flex items-center"><CreditCard className="mr-2 text-blue-600" />Payment Method</h2>
                  
                  <div className="flex flex-col space-y-3 mb-6">
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${paymentMethod === "Cash" ? "border-gray-500 bg-gray-50" : ""}`}>
                      <input type="radio" name="paymentMethod" value="Cash" checked={paymentMethod === "Cash"} onChange={() => setPaymentMethod("Cash")} className="mr-2" />
                      <DollarSign size={20} className="mr-2 text-green-600" />
                      <span>Cash on Delivery</span>
                    </label>
                    
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-purple-50 ${paymentMethod === "Khalti" ? "border-[#5C2D91] bg-purple-50" : ""}`}>
                      <input type="radio" name="paymentMethod" value="Khalti" checked={paymentMethod === "Khalti"} onChange={() => setPaymentMethod("Khalti")} className="mr-2 accent-[#5C2D91]" />
                      <span className="ml-2 text-lg font-bold text-[#5C2D91]">Pay with Khalti</span>
                    </label>
                  </div>
                  
                  <button type="submit" disabled={isLoading || !productData} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400">
                    {isLoading ? "Processing..." : (paymentMethod === "Khalti" ? "Pay with Khalti" : "Place Order")}
                  </button>
                </form>
              </div>
            </div>
            
            <div className="md:col-span-1">
              <div className="sticky top-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center"><Package className="mr-2 text-blue-600" />Order Summary</h2>
                {productData && (
                  <div className="mb-4 border-b pb-4">
                    <div className="flex items-center">
                      <img src={`${backend_url}/public/${productData.images[0]}`} alt={productData.productName} className="w-16 h-16 object-cover rounded-md mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{productData.productName}</p>
                        <p className="text-sm text-gray-600">Size: {selectedSize}, Qty: {quantity}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-2"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm mb-2"><span>Shipping</span><span>Rs. {delivery_fee.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total</span><span>Rs. {total.toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default QuickOrder;