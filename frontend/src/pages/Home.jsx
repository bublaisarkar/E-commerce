import { useState } from "react";
import Hero from "../components/Layout/Hero";
import FeaturedCollection from "../components/Products/FeaturedCollection";
import FeaturesSection from "../components/Products/FeaturesSection";
import GenderCollectionSection from "../components/Products/GenderCollectionSection";
import NewArrivals from "../components/Products/NewArrivals";
import ProductDetails from "../components/Products/ProductDetails";
import ProductGrid from "../components/Products/ProductGrid";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchProductsByFilters } from "../redux/slices/productsSlice";
import axios from "axios";

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const [bestSellerProduct, setBestSellerProduct] = useState(null);

  useEffect(() => {
    // 1. Fetch products for a specific collection (Top Wears for Women)
    dispatch(
      fetchProductsByFilters({
        gender: "Women",
        // ✅ FIX: Changed 'Bottom Wear' to 'Top Wear' to match the heading below
        category: "Top Wear", 
        limit: 8,
      })
    );

    // 2. Fetch best seller product
    const fetchBestSeller = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`
        );
        setBestSellerProduct(response.data);
      } catch (error) {
        console.error("Error fetching best seller:", error);
      }
    };
    fetchBestSeller();
  }, [dispatch]);

  return (
    <div>
      <Hero />
      <GenderCollectionSection />
      <NewArrivals />

      {/* Best Seller Section */}
      <div className="py-10">
        <h2 className="text-3xl text-center font-bold mb-4">⭐ Best Seller</h2>
        {bestSellerProduct ? (
          // Assuming ProductDetails can render single product details based on ID
          <ProductDetails productId={bestSellerProduct._id} /> 
        ) : (
          <p className="text-center text-gray-600">
            {/* Display simple loading state */}
            {bestSellerProduct === null ? "Loading best seller product..." : "Best seller not available."} 
          </p>
        )}
      </div>

      {/* Featured Collection: Top Wears for Women */}
      <div className="container mx-auto py-10">
        <h2 className="text-3xl text-center font-bold mb-8">
          👗 Top Wears for Women
        </h2>
        {/* ProductGrid displays the products fetched in the useEffect */}
        <ProductGrid products={products} loading={loading} error={error} />
      </div>

      <FeaturedCollection />
      <FeaturesSection />
    </div>
  );
};

export default Home;