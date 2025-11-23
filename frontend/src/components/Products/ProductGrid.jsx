import React from "react";
import { Link } from "react-router-dom";

// Define a placeholder image URL for products missing images
const PLACEHOLDER_IMAGE = "/images/placeholder.jpg"; 

const ProductGrid = ({ products, loading, error }) => {
    // --- State Rendering ---
    if (loading) {
        return <p className="text-center py-8">Loading products...</p>;
    }
    
    if (error) {
        // Correctly display the error variable
        return <p className="text-red-600 text-center py-8">Error: {error}</p>;
    }

    // --- Main Grid Rendering ---
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
                // Check if the product has a primary image, otherwise use the placeholder
                const primaryImage = product.images && product.images.length > 0 
                    ? product.images[0]
                    : null;
                
                // Use product._id for the stable React key
                return (
                    <Link 
                        key={product._id} 
                        to={`/product/${product._id}`} 
                        className="block group" // Added group for hover effects if needed
                    >
                        <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                            <div className="w-full h-96 mb-4">
                                <img
                                    // 🛡️ Defensive code: Use primaryImage.url or fallback
                                    src={primaryImage?.url || PLACEHOLDER_IMAGE}
                                    alt={primaryImage?.altText || product.name || "Product Image"}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>
                            <h3 className="text-md font-semibold mb-2 truncate"> 
                                {product.name}
                            </h3>
                            <p className="text-gray-700 text-lg tracking-tighter">
                                $ {product.price ? product.price.toFixed(2) : '0.00'}
                            </p>
                        </div>
                    </Link>
                );
            })}
            
            {products.length === 0 && !loading && (
                <p className="text-gray-500 col-span-full text-center py-10">
                    No products found.
                </p>
            )}
        </div>
    );
};

export default ProductGrid;