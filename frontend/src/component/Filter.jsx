import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { motion } from "framer-motion";

const Filter = ({ showFilter, setShowFilter }) => {
  const {
    gender,
    category,
    sizes,
    colors,
    priceRange,
    toggleGender,
    toggleCategory,
    toggleSizes,
    toggleColor,
    setPriceRange,
    resetGenderFilter,
    resetCategoryFilter,
    resetSizeFilter,
    resetColorFilter,
    resetPriceFilter,
    resetAllFilters,
    applyFilter
  } = useContext(ShopContext);

  // State to track gender checkbox status
  const [checkedGenders, setCheckedGenders] = useState({
    All: gender.length === 0,
    Men: gender.includes("Men"),
    Women: gender.includes("Women"),
    Kids: gender.includes("Kids"),
  });

  // State to track category checkbox status
  const [checkedCategories, setCheckedCategories] = useState({
    All: category.length === 0,
    Formal: category.includes("Formal"),
    Casual: category.includes("Casual"),
    Ethnic: category.includes("Ethnic"),
  });

  // State to track size checkbox status
  const [checkedSizes, setCheckedSizes] = useState({
    S: sizes.includes("S"),
    M: sizes.includes("M"),
    L: sizes.includes("L"),
    XL: sizes.includes("XL"),
    XXL: sizes.includes("XXL"),
  });

  // State to track color selection
  const [checkedColors, setCheckedColors] = useState({
    Black: colors.includes("Black"),
    White: colors.includes("White"),
    Blue: colors.includes("Blue"),
    Red: colors.includes("Red"),
    Green: colors.includes("Green"),
  });

  // Color options array
  const colorOptions = ["Black", "White", "Blue", "Red", "Green"];

  // Handle gender checkbox change
  const handleGenderChange = (genderValue) => {
    if (genderValue === "All") {
      // If "All" is selected, uncheck all other genders
      setCheckedGenders({
        All: true,
        Men: false,
        Women: false,
        Kids: false,
        Unisex: false,
      });
      resetGenderFilter();
    } else {
      // If a specific gender is selected, handle it accordingly
      const newCheckedState = !checkedGenders[genderValue];

      // Update the checked state for this gender
      setCheckedGenders((prev) => ({
        ...prev,
        [genderValue]: newCheckedState,
        // If we're checking a specific gender, uncheck "All"
        All: false,
      }));

      // Update the gender array for filtering
      toggleGender(genderValue);

      // If no genders are selected, check "All"
      const updatedChecked = {
        ...checkedGenders,
        [genderValue]: newCheckedState,
        All: false,
      };

      if (
        !updatedChecked.Men &&
        !updatedChecked.Women &&
        !updatedChecked.Kids &&
        !updatedChecked.Unisex
      ) {
        setCheckedGenders((prev) => ({
          ...prev,
          All: true,
        }));
        resetGenderFilter();
      }
    }
  };

  // Handle category checkbox change
  const handleCategoryChange = (categoryValue) => {
    if (categoryValue === "All") {
      // If "All" is selected, uncheck all other categories
      setCheckedCategories({
        All: true,
        Formal: false,
        Casual: false,
        Ethnic: false,
      });
      resetCategoryFilter();
    } else {
      // If a specific category is selected, handle it accordingly
      const newCheckedState = !checkedCategories[categoryValue];

      // Update the checked state for this category
      setCheckedCategories((prev) => ({
        ...prev,
        [categoryValue]: newCheckedState,
        // If we're checking a specific category, uncheck "All"
        All: false,
      }));

      // Update the category array for filtering
      toggleCategory(categoryValue);

      // If no categories are selected, check "All"
      const updatedChecked = {
        ...checkedCategories,
        [categoryValue]: newCheckedState,
        All: false,
      };

      if (
        !updatedChecked.Formal &&
        !updatedChecked.Casual &&
        !updatedChecked.Ethnic
      ) {
        setCheckedCategories((prev) => ({
          ...prev,
          All: true,
        }));
        resetCategoryFilter();
      }
    }
  };

  // Handle size checkbox change
  const handleSizeChange = (size) => {
    setCheckedSizes((prev) => ({
      ...prev,
      [size]: !prev[size],
    }));

    toggleSizes(size);
  };

  // Handle color toggle
  const handleColorToggle = (color) => {
    setCheckedColors((prev) => ({
      ...prev,
      [color]: !prev[color],
    }));
    toggleColor(color);
  };

  // Handle price range change
  const handlePriceChange = (e, index) => {
    const newValue = parseInt(e.target.value);
    setPriceRange((prev) => {
      const newRange = [...prev];
      newRange[index] = newValue;
      return newRange;
    });
  };

  // Update checkbox states when filter states change
  useEffect(() => {
    setCheckedGenders({
      All: gender.length === 0,
      Men: gender.includes("Men"),
      Women: gender.includes("Women"),
      Kids: gender.includes("Kids"),
      Unisex: gender.includes("Unisex"),
    });
  }, [gender]);

  useEffect(() => {
    setCheckedCategories({
      All: category.length === 0,
      Formal: category.includes("Formal"),
      Casual: category.includes("Casual"),
      Ethnic: category.includes("Ethnic"),
    });
  }, [category]);

  useEffect(() => {
    setCheckedSizes({
      S: sizes.includes("S"),
      M: sizes.includes("M"),
      L: sizes.includes("L"),
      XL: sizes.includes("XL"),
      XXL: sizes.includes("XXL"),
    });
  }, [sizes]);

  useEffect(() => {
    setCheckedColors({
      Black: colors.includes("Black"),
      White: colors.includes("White"),
      Blue: colors.includes("Blue"),
      Red: colors.includes("Red"),
      Green: colors.includes("Green"),
    });
  }, [colors]);

  return (
    <div
      className={`${
        showFilter ? "block" : "hidden"
      } lg:block lg:w-64 space-y-6`}
    >
      {/* Mobile close button */}
      <div className="lg:hidden flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <h2 className="font-bold text-lg">Filters</h2>
        <button
          onClick={() => setShowFilter(false)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Gender Section */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="font-bold text-lg text-gray-800">Gender</h2>
          <button
            onClick={resetGenderFilter}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={gender.length === 0}
          >
            Reset
          </button>
        </div>
        <div className="space-y-3">
          {["All", "Men", "Women", "Kids", "Unisex"].map((item) => (
            <label
              key={item}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                type="checkbox"
                checked={checkedGenders[item] || false}
                onChange={() => handleGenderChange(item)}
              />
              <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="font-bold text-lg text-gray-800">Categories</h2>
          <button
            onClick={resetCategoryFilter}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={category.length === 0}
          >
            Reset
          </button>
        </div>
        <div className="space-y-3">
          {["All", "Formal", "Casual", "Ethnic"].map((item) => (
            <label
              key={item}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                type="checkbox"
                checked={checkedCategories[item] || false}
                onChange={() => handleCategoryChange(item)}
              />
              <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sizes Section */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="font-bold text-lg text-gray-800">Sizes</h2>
          <button
            onClick={resetSizeFilter}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={sizes.length === 0}
          >
            Reset
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <label
              key={size}
              className={`flex items-center justify-center h-10 rounded-lg cursor-pointer transition-all ${
                checkedSizes[size]
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checkedSizes[size] || false}
                onChange={() => handleSizeChange(size)}
              />
              {size}
            </label>
          ))}
        </div>
      </div>

      {/* Colors Section */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="font-bold text-lg text-gray-800">Colors</h2>
          <button
            onClick={resetColorFilter}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={colors.length === 0}
          >
            Reset
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              onClick={() => handleColorToggle(color)}
              className={`w-8 h-8 rounded-full border-2 ${
                checkedColors[color]
                  ? "ring-2 ring-blue-500 ring-offset-2"
                  : ""
              }`}
              style={{
                backgroundColor: color.toLowerCase(),
                borderColor:
                  color.toLowerCase() === "white"
                    ? "#e5e7eb"
                    : color.toLowerCase(),
              }}
              aria-label={color}
            />
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="font-bold text-lg text-gray-800">Price Range</h2>
          <button
            onClick={resetPriceFilter}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={priceRange[0] === 0 && priceRange[1] === 5000}
          >
            Reset
          </button>
        </div>
        <div className="px-2">
          <div className="flex justify-between mb-2">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
          <div className="flex flex-col gap-4">
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={priceRange[0]}
              onChange={(e) => handlePriceChange(e, 0)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(e, 1)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Apply and Reset Buttons */}
      <div className="flex gap-2">
        <button
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          onClick={applyFilter}
        >
          Apply Filters
        </button>
        <button
          className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          onClick={resetAllFilters}
        >
          Reset All
        </button>
      </div>
    </div>
  );
};

export default Filter;