import React from "react";

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  if (totalPages <= 1) return null; // Hide pagination if only 1 page

  return (
    <div className="flex justify-center items-center mt-6 space-x-2">
      {/* Prev Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={`px-4 py-2 border rounded-md ${
          currentPage === 0 ? "cursor-not-allowed opacity-50" : "hover:bg-gray-200"
        }`}
      >
        Prev
      </button>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }).map((_, index) => (
        <button
          key={index}
          onClick={() => onPageChange(index)}
          className={`px-3 py-2 rounded-md font-medium transition ${
            currentPage === index
              ? "bg-black text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {index + 1}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className={`px-4 py-2 border rounded-md ${
          currentPage >= totalPages - 1 ? "cursor-not-allowed opacity-50" : "hover:bg-gray-200"
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
