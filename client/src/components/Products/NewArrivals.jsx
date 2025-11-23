import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import axios from "axios";

const NewArrivals = () => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0); // Renamed to scrollStart for clarity
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [newArrivals, setNewArrivals] = useState([]);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/new-arrivals`
        );
        setNewArrivals(response.data);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      }
    };
    fetchNewArrivals();
  }, []);

  // --- Drag Logic Handlers ---

  const handleMouseDown = (e) => {
    // Only allow dragging with the primary mouse button (left click)
    if (e.button !== 0) return; 
    setIsDragging(true);
    // ✅ CRITICAL FIX: Changed e.pagex to e.pageX
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollStart(scrollRef.current.scrollLeft); // Storing the initial scroll position
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevents selection while dragging

    const x = e.pageX - scrollRef.current.offsetLeft;
    // Calculate how far the mouse has moved
    const walk = x - startX; 
    // Set the new scroll position based on the initial scroll and the distance walked
    scrollRef.current.scrollLeft = scrollStart - walk; 
  };
  
  const handleMouseUpOrLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // --- Button Scroll Logic ---
  const scroll = (direction) => {
    const scrollAmount = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ 
      left: scrollAmount, 
      // ✅ MINOR FIX: Corrected typo 'behaviour' to 'behavior'
      behavior: "smooth" 
    });
  };

  // --- Scroll Button State Update ---
  const updateScrollButtons = () => {
    const container = scrollRef.current;

    if (container) {
      const leftScroll = container.scrollLeft;
      // Calculate if there is space to scroll right
      const rightScrollable =
        container.scrollWidth > Math.ceil(leftScroll + container.clientWidth);

      setCanScrollLeft(leftScroll > 0);
      setCanScrollRight(rightScrollable);
    }
  };
  
  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
      updateScrollButtons(); // Initial check

      // Cleanup function to remove the event listener
      return () => container.removeEventListener("scroll", updateScrollButtons);
    }
    // Dependency array cleaned up: newArrivals is not needed here.
  }, []); 

  return (
    <section className="py-16 px-4 lg:px-0">
      <div className="container mx-auto text-center mb-10 relative">
        <h2 className="text-3xl font-bold mb-4">✨ Explore New Arrivals</h2>
        <p className="text-lg text-gray-600 mb-8">
          Discover the latest styles straight off the runway, freshly added to
          keep your wardrobe on the cutting edge of fashion.
        </p>

        {/* Scroll Buttons */}
        {/* Adjusted positioning to be relative to the container for better placement */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex space-x-2 z-10">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-2 rounded border transition-colors duration-200 ${
              canScrollLeft
                ? "bg-white text-black hover:bg-gray-100"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FiChevronLeft className="text-2xl" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`p-2 rounded border transition-colors duration-200 ${
              canScrollRight
                ? "bg-white text-black hover:bg-gray-100"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FiChevronRight className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className={`container mx-auto overflow-x-scroll flex space-x-6 relative py-2 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } scrollbar-hide`} // Added scrollbar-hide (Tailwind utility if available)
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        {newArrivals.map((product) => (
          <div
            key={product._id}
            // Ensure product cards don't shrink while dragging
            className="min-w-[100%] sm:min-w-[50%] lg:min-w-[30%] flex-shrink-0 relative"
          >
            <Link to={`/product/${product._id}`} className="block">
              <img
                src={product.images[0]?.url}
                alt={product.images[0]?.altText || product.name}
                className="w-full h-[500px] object-cover rounded-lg"
                draggable="false"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 backdrop-blur-sm text-white p-4 rounded-b-lg">
                <h4 className="font-medium">{product.name}</h4>
                <p className="mt-1">${product.price}</p>
              </div>
            </Link>
          </div>
        ))}
        {newArrivals.length === 0 && !scrollRef.current?.scrollWidth && (
            <p className="text-center w-full text-gray-500">No new arrivals to display yet.</p>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;