import React from 'react';

// ✅ Added 'pageCount' to destructuring to match Collection.jsx usage
const Pagination = ({ totalPages, pageCount, currentPage, onPageChange }) => {
  
  // ✅ Handle Prop Mismatch: Collection passes 'pageCount', this component used 'totalPages'
  const total = totalPages || pageCount || 0;

  // Don't render if there's 0 or 1 page
  if (total <= 1) return null;

  // Determine which page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum visible pagination items
    
    if (total <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 0; i < total; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(0);
      
      // Calculate center pages
      let startPage = Math.max(1, currentPage - 1);
      let endPage = Math.min(currentPage + 1, total - 2);
      
      // Adjust to show 3 pages
      if (startPage > total - 4) {
        startPage = total - 4;
      }
      if (endPage < 3 && total > 3) {
        endPage = 3;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 1) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < total - 2) {
        pages.push('...');
      }
      
      // Always include last page
      pages.push(total - 1);
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex items-center justify-center space-x-1 mt-8">
      {/* Previous button */}
      <button
        onClick={() => currentPage > 0 && onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={`px-4 py-2 rounded-md border ${
          currentPage === 0
            ? 'text-gray-300 border-gray-200 cursor-not-allowed'
            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
        } transition-colors`}
        aria-label="Previous page"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* Page numbers */}
      {pageNumbers.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-4 py-2 text-gray-500">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded-md border ${
                currentPage === page
                  ? 'bg-black text-white border-black'
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              } transition-colors`}
              aria-label={`Page ${page + 1}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page + 1}
            </button>
          )}
        </React.Fragment>
      ))}
      
      {/* Next button */}
      <button
        onClick={() => currentPage < total - 1 && onPageChange(currentPage + 1)}
        disabled={currentPage >= total - 1}
        className={`px-4 py-2 rounded-md border ${
          currentPage >= total - 1
            ? 'text-gray-300 border-gray-200 cursor-not-allowed'
            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
        } transition-colors`}
        aria-label="Next page"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;