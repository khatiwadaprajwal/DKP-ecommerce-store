import React, { useState } from 'react';
import axios from 'axios'; 
import { toast } from "react-hot-toast";

const AddProduct = () => {
  const [product, setProduct] = useState({
    productName: '',
    description: '',
    price: '',
    category: '',
    gender: '',
    variants: [],
    totalQuantity: 0,
    totalSold: 0,
    images: []
  });
  
  const [variantForm, setVariantForm] = useState({
    color: '',
    size: '',
    quantity: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const token = localStorage.getItem('token');
  
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colorOptions = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Gray', 'Brown'];
  const categoryOptions = ['Formal','Casual', 'Ethnic'];
  const genderOptions = ['Men', 'Women', 'Kids'];
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setProduct({ ...product, [name]: Number(value) });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };
  
  const handleVariantChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setVariantForm({ ...variantForm, [name]: Number(value) });
    } else {
      setVariantForm({ ...variantForm, [name]: value });
    }
  };
  
  const addVariant = () => {
    // Check if this variant already exists
    const existingVariantIndex = product.variants.findIndex(
      v => v.color === variantForm.color && v.size === variantForm.size
    );
    
    if (existingVariantIndex !== -1) {
      // Update existing variant
      const updatedVariants = [...product.variants];
      updatedVariants[existingVariantIndex] = {
        ...updatedVariants[existingVariantIndex],
        quantity: variantForm.quantity
      };
      
      setProduct({
        ...product,
        variants: updatedVariants,
        // Update total quantity
        totalQuantity: calculateTotalQuantity(updatedVariants)
      });
      
      toast.info('Variant updated successfully');
    } else {
      // Add new variant
      const newVariant = {
        color: variantForm.color,
        size: variantForm.size,
        quantity: variantForm.quantity
      };
      
      const updatedVariants = [...product.variants, newVariant];

      setProduct({ 
        ...product, 
        variants: updatedVariants,
        // Update total quantity
        totalQuantity: calculateTotalQuantity(updatedVariants)
      });
      
      toast.success('Variant added successfully');
    }
    
    // Reset variant form
    setVariantForm({
      color: '',
      size: '',
      quantity: 1
    });
  };
  
  const calculateTotalQuantity = (variants) => {
    return variants.reduce((total, variant) => total + variant.quantity, 0);
  };
  
  const removeVariant = (index) => {
    const updatedVariants = [...product.variants];
    updatedVariants.splice(index, 1);
    
    setProduct({
      ...product,
      variants: updatedVariants,
      totalQuantity: calculateTotalQuantity(updatedVariants)
    });
    
    toast.info('Variant removed');
  };
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setLoading(true);
  
    try {
      const newImagePreviews = files.map(file => ({
        file, // keep file for FormData
        preview: URL.createObjectURL(file), // for preview only
        name: file.name
      }));
  
      setProduct({
        ...product,
        images: [...product.images, ...newImagePreviews]
      });
  
      setError(null);
    } catch (err) {
      console.error('Error processing images:', err);
      setError('Failed to process images. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const removeImage = (index) => {
    try {
      const imageToRemove = product.images[index];
      
      // Revoke the object URL to avoid memory leaks
      if (imageToRemove.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      
      // Remove from local state
      const newImages = [...product.images];
      newImages.splice(index, 1);
      setProduct({ ...product, images: newImages });
    } catch (err) {
      console.error('Error removing image:', err);
      setError('Failed to remove image. Please try again.');
    }
  };
  
  const resetForm = () => {
    setProduct({
      productName: '',
      description: '',
      price: '',
      category: '',
      gender: '',
      variants: [],
      totalQuantity: 0,
      totalSold: 0,
      images: []
    });
    setVariantForm({
      color: '',
      size: '',
      quantity: 1
    });
    setSuccess(false);
    setError(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      // Validation
      if (product.variants.length === 0) throw new Error('Please add at least one variant with size, color and quantity');
      if (product.images.length === 0) throw new Error('Please upload at least one product image');
  
      // Prepare FormData
      const formData = new FormData();
      formData.append('productName', product.productName);
      formData.append('description', product.description);
      formData.append('category', product.category);
      formData.append('price', product.price);
      formData.append('gender', product.gender);
      formData.append('totalQuantity', product.totalQuantity);
      formData.append('totalSold', product.totalSold);
      
      // Append variants as JSON string
      formData.append('variants', JSON.stringify(product.variants));
      
      // Append images
      product.images.forEach(img => formData.append('images', img.file));

      console.log('Submitting product:', product);
  
      const response = await axios.post("http://localhost:3001/v1/product", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
  
      console.log('Product added:', response.data.product);
      toast.success(response.data.message || 'Product added successfully!');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Auto-hide after 3 sec
      resetForm();
  
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.response?.data?.message || err.message || 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All entered data will be lost.')) {
      resetForm();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Add New Product</h2>
      
      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          Product added successfully!
          <button 
            className="ml-2 text-green-800 underline"
            onClick={() => setSuccess(false)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
          <button 
            className="ml-2 text-red-800 underline"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name*
            </label>
            <input
              type="text"
              name="productName"
              value={product.productName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ($)*
            </label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category*
            </label>
            <select
              name="category"
              value={product.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender*
            </label>
            <select
              name="gender"
              value={product.gender}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              {genderOptions.map(gender => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Quantity (Calculated)
            </label>
            <input
              type="number"
              value={product.totalQuantity}
              readOnly
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-calculated from variants
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Sold
            </label>
            <input
              type="number"
              name="totalSold"
              value={product.totalSold}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description*
          </label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        
        {/* Variant Management Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Manage Variants</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color*
              </label>
              <select
                name="color"
                value={variantForm.color}
                onChange={handleVariantChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Color</option>
                {colorOptions.map(color => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size*
              </label>
              <select
                name="size"
                value={variantForm.size}
                onChange={handleVariantChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Size</option>
                {sizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity*
              </label>
              <input
                type="number"
                name="quantity"
                value={variantForm.quantity}
                onChange={handleVariantChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addVariant}
              disabled={!variantForm.color || !variantForm.size || variantForm.quantity < 1}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 disabled:opacity-70"
            >
              Add Variant
            </button>
          </div>
          
          {/* Variants List */}
          {product.variants.length > 0 ? (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Added Variants:</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {product.variants.map((variant, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{variant.color}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{variant.size}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{variant.quantity}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-red-500 mt-4">
              Please add at least one variant with size, color and quantity
            </p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images*
          </label>
          <div className="flex items-center gap-4 mb-4">
            <label className={`cursor-pointer px-4 py-2 ${
              loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'
            } text-gray-700 rounded-md transition duration-200`}>
              <span>{loading ? 'Uploading...' : 'Add Images'}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={loading}
              />
            </label>
            <span className="text-sm text-gray-500">
              Upload at least one image
            </span>
          </div>
          
          {product.images.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {product.images.map((imageObj, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageObj.preview}
                    alt={`Product preview ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-red-500">
              Please upload at least one product image
            </p>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-4 hover:bg-gray-300 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || product.variants.length === 0 || product.images.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 disabled:opacity-70"
          >
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;