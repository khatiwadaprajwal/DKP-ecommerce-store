import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { MapPin, CreditCard, DollarSign, X, Package, MapIcon } from "lucide-react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Fix Leaflet Icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ onLocationSelected }) => {
  const [position, setPosition] = useState(null);
  const map = useMapEvents({
    click(e) { setPosition(e.latlng); onLocationSelected(e.latlng); },
  });
  return position === null ? null : <Marker position={position} />;
};

const QuickOrder = ({ isOpen, onClose, productData, selectedSize, selectedColor, quantity }) => {
  const { token, delivery_fee, fetchCartData, backend_url, openPayPalPopup } = useContext(ShopContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [shippingInfo, setShippingInfo] = useState({ fullName: "", address: "", city: "", state: "", zipCode: "", phone: "" });
  const [location, setLocation] = useState({ lat: 27.7172, lng: 85.3240 });
  const [locationSelected, setLocationSelected] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.error(error)
      );
    }
    if (isOpen) {
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
    toast.success("Location selected!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { toast.error("Please login first"); onClose(); navigate('/login'); return; }

    for (const [key, value] of Object.entries(shippingInfo)) { if (!value.trim()) return toast.error(`Enter ${key}`); }
    if (!locationSelected) return toast.error("Select location on map");
    if (!productData || !selectedSize) return toast.error("Select size");
    
    setIsLoading(true);
    
    try {
      const formattedAddress = `${shippingInfo.fullName}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}, ${shippingInfo.phone}`;
      
      const orderData = {
        productId: productData._id,
        quantity: quantity,
        address: formattedAddress,
        location: location,
        paymentMethod: paymentMethod,
        color: selectedColor || "White",
        size: selectedSize
      };
      
      const response = await axios.post(`${backend_url}/v1/place`, orderData, { headers: { Authorization: `Bearer ${token}` } });
      
      if (response.data.khaltiUrl) {
        window.location.href = response.data.khaltiUrl;
      } else if (response.data.approvalUrl) {
        // 🟢 1. SAVE PRODUCT ID TO LOCAL STORAGE BEFORE PAYPAL
        localStorage.setItem('paypal_pending_product_ids', productData._id);
        openPayPalPopup(response.data.approvalUrl);
      } else {
        fetchCartData();
        toast.success("Order placed successfully!");
        onClose();
        navigate("/order", { state: { order: response.data.order } });
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) { toast.error("Session expired"); navigate('/login'); }
      else { toast.error(error.response?.data?.error || "Order failed"); }
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
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4 flex items-center"><MapPin className="mr-2 text-blue-600" />Shipping Information</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input type="text" name="fullName" placeholder="Full Name" value={shippingInfo.fullName} onChange={handleInputChange} className="border p-2 rounded" required />
                  <input type="text" name="address" placeholder="Address" value={shippingInfo.address} onChange={handleInputChange} className="border p-2 rounded" required />
                  <input type="text" name="city" placeholder="City" value={shippingInfo.city} onChange={handleInputChange} className="border p-2 rounded" required />
                  <input type="text" name="state" placeholder="State" value={shippingInfo.state} onChange={handleInputChange} className="border p-2 rounded" required />
                  <input type="text" name="zipCode" placeholder="ZIP" value={shippingInfo.zipCode} onChange={handleInputChange} className="border p-2 rounded" required />
                  <input type="tel" name="phone" placeholder="Phone" value={shippingInfo.phone} onChange={handleInputChange} className="border p-2 rounded" required />
                </div>
                
                <div className="mb-6 h-64 border rounded-lg overflow-hidden">
                  <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker onLocationSelected={handleLocationSelected} />
                    {locationSelected && <Marker position={[location.lat, location.lng]} />}
                  </MapContainer>
                </div>
                
                <h2 className="text-xl font-semibold mb-4"><CreditCard className="inline mr-2" />Payment Method</h2>
                <div className="space-y-3 mb-6">
                  <label className="flex items-center p-3 border rounded cursor-pointer"><input type="radio" name="paymentMethod" value="Cash" checked={paymentMethod === "Cash"} onChange={() => setPaymentMethod("Cash")} className="mr-2" /><DollarSign size={20} className="mr-2 text-green-600" />Cash on Delivery</label>
                  <label className="flex items-center p-3 border rounded cursor-pointer"><input type="radio" name="paymentMethod" value="Khalti" checked={paymentMethod === "Khalti"} onChange={() => setPaymentMethod("Khalti")} className="mr-2" /><span className="ml-2 font-bold text-[#5C2D91]">Pay with Khalti</span></label>
                  <label className="flex items-center p-3 border rounded cursor-pointer"><input type="radio" name="paymentMethod" value="PayPal" checked={paymentMethod === "PayPal"} onChange={() => setPaymentMethod("PayPal")} className="mr-2" /><span className="ml-2 font-bold text-[#003087]">PayPal</span></label>
                </div>
                
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700">{isLoading ? "Processing..." : "Place Order"}</button>
              </form>
            </div>
            
            <div className="md:col-span-1 sticky top-4">
              <h2 className="text-xl font-semibold mb-4"><Package className="inline mr-2" />Order Summary</h2>
              {productData && <div className="mb-4 text-sm"><p>{productData.productName}</p><p>Size: {selectedSize}, Qty: {quantity}</p></div>}
              <div className="border-t pt-2 font-bold flex justify-between"><span>Total</span><span>Rs. {total.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default QuickOrder;