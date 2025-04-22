import React, { useState, useEffect } from "react";

function ListNavigation({ totalPages, currentPage, setCurrentPage, showInput, setShowInput, inputPage, setInputPage, setHoveredCafe, pageNumbers }) {
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
          setShowInput(false);
          setInputPage("");
          setHoveredCafe(null);
        }
      };
    
      const handleInputSubmit = (e) => {
        e.preventDefault();
        const pageNum = parseInt(inputPage);
        if (pageNum >= 1 && pageNum <= totalPages) handlePageChange(pageNum);
      };

    return (
        <div className="fixed bottom-0 bg-white shadow-lg p-4 w-full">
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Previous
          </button>
          {pageNumbers.map((number, index) => (
            <div key={index}>
              {number === "..." ? (
                showInput ? (
                  <form onSubmit={handleInputSubmit} className="inline">
                    <input
                      type="number"
                      value={inputPage}
                      onChange={(e) => setInputPage(e.target.value)}
                      className="w-16 px-2 py-1 border rounded"
                      min="1"
                      max={totalPages}
                    />
                  </form>
                ) : (
                  <button onClick={() => setShowInput(true)} className="px-2 py-1">
                    ...
                  </button>
                )
              ) : (
                <button
                  onClick={() => handlePageChange(number)}
                  className={`px-3 py-1 rounded ${currentPage === number ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}
                >
                  {number}
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Next
          </button>
        </div>
      </div>
    )
}

export default ListNavigation;