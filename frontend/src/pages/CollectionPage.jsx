import { useEffect, useRef, useState } from "react";
import { FaFilter } from "react-icons/fa";
import FilterSidebar from "../components/Products/FilterSidebar";
import SortOptions from "../components/Products/SortOptions";
import ProductGrid from "../components/Products/ProductGrid";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByFilters } from '../redux/slices/productsSlice';

const CollectionPage = () => {
  const { collection } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const queryParams = Object.fromEntries([...searchParams]);

  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null); // Ref for the toggle button
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Data Fetching Effect ---
  // Re-fetches products whenever the collection name or search parameters change
  useEffect(() => {
    dispatch(fetchProductsByFilters({ collection, ...queryParams }));
  }, [dispatch, collection, searchParams]);

  // --- Sidebar Logic ---
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleClickOutside = (e) => {
    // Check if the click is outside the sidebar AND not on the toggle button
    if (
      sidebarRef.current && 
      !sidebarRef.current.contains(e.target) &&
      toggleButtonRef.current && 
      !toggleButtonRef.current.contains(e.target)
    ) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    // Set up the global listener for clicks outside the sidebar
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      // Cleanup event listener on unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Mobile Filter button */}
      <button
        ref={toggleButtonRef} // Attach ref to the toggle button
        onClick={toggleSidebar}
        className="lg:hidden border p-3 flex justify-center items-center font-medium bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <FaFilter className="mr-2" /> Filters
      </button>

      {/* Sidebar for filters */}
      <div
        ref={sidebarRef}
        className={`
          ${isSidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"} 
          fixed 
          inset-y-0           
          z-50 
          left-0 
          w-64 
          bg-white 
          overflow-y-auto 
          transition-transform duration-300 
          lg:static 
          lg:translate-x-0 
          lg:w-72 
          lg:border-r 
          p-4
        `}
      >
        <FilterSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-grow p-4 lg:p-8">
        <h1 className="text-3xl font-bold uppercase mb-4 border-b pb-2"> 
          {collection || "All Products"} 
        </h1>
        
        {/* Sort Options and Product Count (assuming SortOptions handles context) */}
        <div className="flex justify-end mb-6">
          <SortOptions />
        </div>

        {/* Products Grid */}
        <ProductGrid products={products} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default CollectionPage;