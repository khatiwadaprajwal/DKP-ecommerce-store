import React, { useContext, useState, useEffect, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import { ToastContainer, toast } from "react-toastify";



const PlaceOrder = () => {
  const [selectedPayment, setSelectedPayment] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [address, setAddress] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);

  const { navigate, totalPrice, delivery_fee } = useContext(ShopContext);

  // Load Google Maps API
  useEffect(() => {
    // This check prevents multiple script loads
    if (!window.google && !document.getElementById("google-maps-script")) {
      const googleMapScript = document.createElement("script");
      googleMapScript.id = "google-maps-script";
      googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
      googleMapScript.async = true;
      googleMapScript.defer = true;

      googleMapScript.onload = () => {
        setMapLoaded(true);
      };

      document.head.appendChild(googleMapScript);
    } else if (window.google) {
      setMapLoaded(true);
    }

    return () => {
      // Cleanup if component unmounts before script loads
      const scriptTag = document.getElementById("google-maps-script");
      if (scriptTag) scriptTag.remove();
    };
  }, []);

  // Initialize map once API is loaded
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      const defaultLocation = { lat: 22.5726, lng: 88.3639 }; // Default to Kolkata

      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Create a marker
      const marker = new window.google.maps.Marker({
        position: defaultLocation,
        map: map,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });

      markerRef.current = marker;

      // Create geocoder
      geocoderRef.current = new window.google.maps.Geocoder();

      // Set initial coordinates
      setCoordinates(defaultLocation);

      // Update coordinates when marker is dragged
      marker.addListener("dragend", () => {
        const position = marker.getPosition();
        const newCoordinates = {
          lat: position.lat(),
          lng: position.lng(),
        };
        setCoordinates(newCoordinates);

        // Get address from coordinates
        geocoderRef.current.geocode(
          { location: newCoordinates },
          (results, status) => {
            if (status === "OK" && results[0]) {
              setAddress(results[0].formatted_address);

              // Extract and fill address components
              const addressComponents = results[0].address_components;
              let street = "";
              let city = "";
              let state = "";
              let zipcode = "";
              let country = "";

              for (const component of addressComponents) {
                const types = component.types;

                if (types.includes("street_number")) {
                  street = component.long_name + " ";
                }
                if (types.includes("route")) {
                  street += component.long_name;
                }
                if (types.includes("locality")) {
                  city = component.long_name;
                }
                if (types.includes("administrative_area_level_1")) {
                  state = component.long_name;
                }
                if (types.includes("postal_code")) {
                  zipcode = component.long_name;
                }
                if (types.includes("country")) {
                  country = component.long_name;
                }
              }

              // Update form fields with extracted data
              const streetInput = document.querySelector(
                'input[placeholder="Street address"]'
              );
              const cityInput = document.querySelector(
                'input[placeholder="City"]'
              );
              const stateInput = document.querySelector(
                'input[placeholder="State"]'
              );
              const zipcodeInput = document.querySelector(
                'input[placeholder="Zip code"]'
              );
              const countryInput = document.querySelector(
                'input[placeholder="Country"]'
              );

              if (streetInput) streetInput.value = street;
              if (cityInput) cityInput.value = city;
              if (stateInput) stateInput.value = state;
              if (zipcodeInput) zipcodeInput.value = zipcode;
              if (countryInput) countryInput.value = country;
            }
          }
        );
      });

      // Allow clicking on map to set marker
      map.addListener("click", (event) => {
        marker.setPosition(event.latLng);
        const newCoordinates = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        setCoordinates(newCoordinates);

        // Get address from coordinates
        geocoderRef.current.geocode(
          { location: newCoordinates },
          (results, status) => {
            if (status === "OK" && results[0]) {
              setAddress(results[0].formatted_address);

              // Extract and fill address components (same as above)
              const addressComponents = results[0].address_components;
              let street = "";
              let city = "";
              let state = "";
              let zipcode = "";
              let country = "";

              for (const component of addressComponents) {
                const types = component.types;

                if (types.includes("street_number")) {
                  street = component.long_name + " ";
                }
                if (types.includes("route")) {
                  street += component.long_name;
                }
                if (types.includes("locality")) {
                  city = component.long_name;
                }
                if (types.includes("administrative_area_level_1")) {
                  state = component.long_name;
                }
                if (types.includes("postal_code")) {
                  zipcode = component.long_name;
                }
                if (types.includes("country")) {
                  country = component.long_name;
                }
              }

              // Update form fields with extracted data
              const streetInput = document.querySelector(
                'input[placeholder="Street address"]'
              );
              const cityInput = document.querySelector(
                'input[placeholder="City"]'
              );
              const stateInput = document.querySelector(
                'input[placeholder="State"]'
              );
              const zipcodeInput = document.querySelector(
                'input[placeholder="Zip code"]'
              );
              const countryInput = document.querySelector(
                'input[placeholder="Country"]'
              );

              if (streetInput) streetInput.value = street;
              if (cityInput) cityInput.value = city;
              if (stateInput) stateInput.value = state;
              if (zipcodeInput) zipcodeInput.value = zipcode;
              if (countryInput) countryInput.value = country;
            }
          }
        );
      });
    }
  }, [mapLoaded]);

  // Handle checkout
  const handlePlaceOrder = () => {
    if (selectedPayment.length === 0) {
      toast.error("Please select a payment method to complete your order");
      return;
    }

    if (!coordinates) {
      toast.error("Please select a delivery location on the map");
      return;
    }

    // Here you would send coordinates along with other data to backend
    console.log("Sending order with coordinates:", coordinates);
    navigate("/Order");
  };

  return (
    <div className="container mx-auto min-h-screen py-8 px-4 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Delivery Information (2/3) */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm p-6">
          {/* Contact Information Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-6">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="relative">
                <input
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                  type="email"
                  placeholder="Email address"
                />
                <p className="text-xs text-gray-500 mt-1 ml-1">
                  We'll send your order confirmation here
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Information Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-6">
              Delivery Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="relative">
                <input
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                  type="text"
                  placeholder="First name"
                />
              </div>
              <div className="relative">
                <input
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                  type="text"
                  placeholder="Last name"
                />
              </div>

              <div className="relative col-span-1 sm:col-span-2">
                <input
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                  type="text"
                  placeholder="Street address"
                />
              </div>

              <div className="relative">
                <input
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                  type="text"
                  placeholder="City"
                />
              </div>

              <div className="relative">
                <input
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                  type="text"
                  placeholder="State"
                />
              </div>

              <div className="relative">
                <input
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                  type="text"
                  placeholder="Zip code"
                />
              </div>

              <div className="relative">
                <input
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                  type="text"
                  placeholder="Country"
                />
              </div>

              <div className="relative col-span-1 sm:col-span-2">
                <input
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                  type="tel"
                  placeholder="Phone number"
                />
                <p className="text-xs text-gray-500 mt-1 ml-1">
                  For delivery updates
                </p>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="my-8">
            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-6">
              Delivery Location
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Pin your exact delivery location by clicking on the map or
              dragging the marker
            </p>
            <div
              ref={mapRef}
              className="w-full h-64 rounded-lg border border-gray-300 mb-4"
              style={{ minHeight: "300px" }}
            ></div>

            {coordinates && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                <p className="text-sm font-medium text-blue-800">
                  Selected Location
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {address || "Address is being loaded..."}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Coordinates: {coordinates.lat.toFixed(6)},{" "}
                  {coordinates.lng.toFixed(6)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Cart Details & Payment (1/3) */}
        <div className="w-full lg:w-1/3">
          {/* Cart Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-6">
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between py-2 text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">Rs. {totalPrice}</span>
              </div>
              <div className="flex justify-between py-2 text-gray-600">
                <span>Shipping Fee</span>
                <span className="font-medium">Rs. {delivery_fee}</span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between pt-2 font-bold text-lg">
                <span>Total</span>
                <span>Rs. {totalPrice + delivery_fee}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-6">
              Payment Method
            </h2>

            <div className="grid grid-cols-1 gap-3 mb-6">
              <div
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPayment === "stripe"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => setSelectedPayment("stripe")}
              >
                <div className="flex-1">
                  <span className="font-medium text-gray-800">
                    Credit Card (Stripe)
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Pay securely with credit or debit card
                  </p>
                </div>
                <div className="h-6 w-6 flex items-center justify-center">
                  {selectedPayment === "stripe" && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>

              <div
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPayment === "razorpay"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => setSelectedPayment("razorpay")}
              >
                <div className="flex-1">
                  <span className="font-medium text-gray-800">Razorpay</span>
                  <p className="text-xs text-gray-500 mt-1">
                    UPI, wallet, netbanking & more
                  </p>
                </div>
                <div className="h-6 w-6 flex items-center justify-center">
                  {selectedPayment === "razorpay" && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>

              <div
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPayment === "cash"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => setSelectedPayment("cash")}
              >
                <div className="flex-1">
                  <span className="font-medium text-gray-800">
                    Cash on Delivery
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Pay when you receive your order
                  </p>
                </div>
                <div className="h-6 w-6 flex items-center justify-center">
                  {selectedPayment === "cash" && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>

            {coordinates && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-6">
                <p className="text-sm text-green-800">
                  ✓ Delivery location selected
                </p>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              className="w-full bg-blue-600 text-white font-semibold py-4 px-4 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
