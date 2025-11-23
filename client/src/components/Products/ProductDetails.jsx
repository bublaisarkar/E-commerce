import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ProductGrid from "./ProductGrid";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductDetails, fetchSimilarProducts } from "../../redux/slices/productsSlice";
import { addToCart } from "../../redux/slices/cartSlice";

const ProductDetails = ({ productId }) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedProduct, loading, error, similarProducts } = useSelector(
    (state) => state.products
  );
  const { user, guestId } = useSelector((state) => state.auth);
  const [mainImage, setMainImage] = useState(null); // FIX 1: Changed "" to null to avoid src="" warning
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Determine which ID to use (props for inline display, params for full page)
  const productFetchId = productId || id;

  // --- Data Fetching ---
  useEffect(() => {
    if (productFetchId) {
      dispatch(fetchProductDetails(productFetchId));
      dispatch(fetchSimilarProducts({ id: productFetchId }));
    }
  }, [dispatch, productFetchId]);

  // Set initial main image when product data loads
  useEffect(() => {
    if (selectedProduct?.images?.length > 0) {
      setMainImage(selectedProduct.images[0].url);
      // Optional: Auto-select the first size/color if they exist
      if (selectedProduct.sizes && selectedProduct.sizes.length > 0) {
        setSelectedSize(selectedProduct.sizes[0]);
      }
      if (selectedProduct.colors && selectedProduct.colors.length > 0) {
        setSelectedColor(selectedProduct.colors[0]);
      }
    }
  }, [selectedProduct]);

  // --- Handlers ---
  const handleQuantityChange = (action) => {
    if (action === "plus") setQuantity((prev) => prev + 1);
    if (action === "minus" && quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select a size and color before adding to cart.", {
        duration: 1500,
      });
      return;
    }
    setIsButtonDisabled(true);

    dispatch(
      addToCart({
        productId: productFetchId,
        quantity,
        size: selectedSize,
        color: selectedColor,
        // Send guestId if user is null, otherwise send userId
        guestId, 
        userId: user?._id,
      })
    )
      .unwrap() // Use unwrap() to handle rejections from the thunk
      .then(() => {
        toast.success("Product added to cart!", {
          duration: 1500,
        });
      })
      .catch((err) => {
        // Display specific error message from the backend if available
        toast.error(err.message || "Failed to add product to cart.", {
          duration: 3000,
        });
      })
      .finally(() => {
        setIsButtonDisabled(false);
      });
  };

  // --- Render Conditions ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading product details... 🔄</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    );
  }
  
  // If rendering as a standalone page and product is not found
  if (!selectedProduct && id) {
     return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-500">Product not found.</p>
      </div>
    );
  }
  
  // If product details are not yet loaded (e.g., when rendering inline)
  if (!selectedProduct) {
    return null; 
  }


  // --- JSX Rendering ---
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row">
          {/* Left Thumbnails (Desktop) */}
          <div className="hidden md:flex flex-col space-y-4 mr-6">
            {selectedProduct.images?.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={image.altText || `Thumbnail ${index}`}
                className={`w-20 h-20 object-cover rounded-lg cursor-pointer transition-all ${
                  mainImage === image.url ? "border-4 border-black ring-2 ring-black" : "border border-gray-300"
                }`}
                onClick={() => setMainImage(image.url)}
              />
            ))}
          </div>

          {/* Main Image (Now using the stable Aspect Ratio Hack) */}
          <div className="md:w-1/2 flex justify-center items-start">
            <div className="mb-4 w-full relative pt-[100%] overflow-hidden"> 
              <img
                src={mainImage}
                alt="Main Product"
                className="absolute top-0 left-0 w-full h-full object-cover rounded-lg shadow-md"
              />
            </div>
          </div>

          {/* Mobile Thumbnail Scroll */}
          <div className="md:hidden flex overflow-x-scroll space-x-4 mb-4 pb-2">
            {selectedProduct.images?.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={image.altText || `Thumbnail ${index}`}
                className={`flex-shrink-0 w-20 h-20 object-cover rounded-lg cursor-pointer transition-all ${
                  mainImage === image.url ? "border-4 border-black" : "border border-gray-300"
                }`}
                onClick={() => setMainImage(image.url)}
              />
            ))}
          </div>
          
          {/* Right Side - Details and Actions */}
          <div className="md:w-1/2 md:ml-10">
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">
              {selectedProduct.name}
            </h1>
            {selectedProduct.originalPrice && (
              <p className="text-lg text-gray-400 mb-1 line-through">
                 $ {selectedProduct.originalPrice.toFixed(2)}
              </p>
            )}
            <p className="text-2xl font-bold text-black mb-4">
              $ {selectedProduct.price.toFixed(2)}
            </p>
            <p className="text-gray-600 mb-6 border-b pb-4"> {selectedProduct.description}</p>

            {/* Color Selection */}
            <div className="mb-6">
              <p className="text-gray-700 font-medium mb-2">Color: <span className="font-normal capitalize">{selectedColor || 'Select'}</span></p>
              <div className="flex gap-3 mt-2">
                {selectedProduct.colors?.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-150 ${
                      selectedColor === color ? "border-4 border-black ring-2 ring-gray-400" : "border-gray-300"
                    }`}
                    style={{
                      // ✅ CRITICAL FIX: Removed filter and space, used toLowerCase()
                      backgroundColor: color.toLowerCase(),
                    }}
                  ></button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <p className="text-gray-700 font-medium mb-2">Size: <span className="font-normal">{selectedSize || 'Select'}</span></p>
              <div className="flex gap-2 mt-2">
                {selectedProduct.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded border border-gray-300 transition-colors duration-150 ${
                      selectedSize === size ? "bg-black text-white hover:bg-gray-800" : "hover:bg-gray-100"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6 border-b pb-6">
              <p className="text-gray-700 font-medium mb-2"> Quantity:</p>
              <div className="flex items-center space-x-4 mt-2">
                <button
                  onClick={() => handleQuantityChange("minus")}
                  className="w-8 h-8 flex justify-center items-center bg-gray-200 rounded text-lg hover:bg-gray-300 transition-colors"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="text-lg font-medium w-4 text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange("plus")}
                  className="w-8 h-8 flex justify-center items-center bg-gray-200 rounded text-lg hover:bg-gray-300 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isButtonDisabled || !selectedSize || !selectedColor} // Disabled if variants are not selected
              className={`text-white py-3 px-6 rounded w-full text-lg font-semibold transition-all duration-300 ${
                isButtonDisabled || !selectedSize || !selectedColor
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              }`}
            >
              {isButtonDisabled ? "ADDING..." : "ADD TO CART"}
            </button>

            {/* Characteristics Table */}
            <div className="mt-10 text-gray-700">
              <h3 className="text-xl font-bold mb-4 border-b pb-2"> Product Specifications</h3>
              <table className="w-full text-left text-sm text-gray-600">
                <tbody>
                  <tr>
                    <td className="py-1 font-medium w-1/3"> Brand:</td>
                    <td className="py-1">{selectedProduct.brand || "N/A"}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium w-1/3"> Category:</td>
                    <td className="py-1">{selectedProduct.category || "N/A"}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium w-1/3"> Material:</td>
                    <td className="py-1">{selectedProduct.material || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Similar Products Section */}
        <div className="mt-20 border-t pt-10">
          <h2 className="text-2xl text-center font-bold mb-8">
            You May Also Like ✨
          </h2>
          <ProductGrid products={similarProducts} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;