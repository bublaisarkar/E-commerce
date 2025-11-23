import React from "react";
import {useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { fetchProductDetails, updateProduct } from "../../redux/slices/productsSlice";

const EditProductPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { selectedProduct, loading, error } = useSelector(
        (state) => state.products
    );

    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: 0,
        countInStock: 0,
        sku: "",
        category: "",
        brand: "",
        sizes: [],
        colors: [],
        collections: [],
        material: "",
        gender: "",
        images: [],
    });

    const [uploading, setUploading] = useState(false);
    
    // --- Lifecycle Hooks ---
    useEffect(() => {
        if (id) {
            dispatch(fetchProductDetails(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (selectedProduct) {
            // Ensure productData is set from the fetched product
            setProductData(selectedProduct);
        }
    }, [selectedProduct]);

    // --- Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("image", file);

        try {
            setUploading(true);
            // 💡 Get token if necessary for upload, check backend requirement
            const { data } = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
                formData,
                {
                    headers: { 
                        "Content-Type": "multipart/form-data",
                        // Authorization: `Bearer ${getToken()}`, // Uncomment if auth is needed
                    },
                }
            );
            setProductData((prevData) => ({
                ...prevData,
                // Append the new image URL to the images array
                images: [...prevData.images, { url: data.imageUrl, altText: "" }],
            }));
            setUploading(false);
        } catch (error) {
            console.error("Image upload failed:", error);
            setUploading(false);
        }
    };
    
    // 🎯 NEW HANDLER: Remove image from state
    const handleImageRemove = (urlToRemove) => {
        setProductData((prevData) => ({
            ...prevData,
            // Filter out the image that matches the urlToRemove
            images: prevData.images.filter(image => image.url !== urlToRemove)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Dispatch the update action
        dispatch(updateProduct({ id, productData }));
        // Navigate back to the admin product list page
        navigate("/admin/products");
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-600">Error: {error}</p>;


    // --- JSX Form ---
    return (
        <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md">
            <h2 className="text-3xl font-bold mb-6">Edit Product</h2>
            <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2"> Product Name</label>
                    <input
                        type="text"
                        name="name"
                        value={productData.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                {/* Description */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2"> Description</label>
                    <textarea
                        name="description"
                        value={productData.description}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                        rows="4"
                        required
                    />
                </div>
                {/* Price */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Price</label>
                    <input
                        type="number"
                        name="price"
                        value={productData.price}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                {/* Count In stock */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Count in Stock</label>
                    <input
                        type="number"
                        name="countInStock"
                        value={productData.countInStock}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                {/* SKU */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">SKU</label>
                    <input
                        type="text"
                        name="sku"
                        value={productData.sku}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                {/* Sizes */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">
                        Sizes (comma-separated)
                    </label>
                    <input
                        type="text"
                        name="sizes"
                        value={productData.sizes.join(", ")}
                        onChange={(e) =>
                            setProductData({
                                ...productData,
                                sizes: e.target.value.split(",").map((size) => size.trim()).filter(s => s !== ""),
                            })
                        }
                        className="w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                {/* Colors */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">
                        Colors (comma-separated)
                    </label>
                    <input
                        type="text"
                        name="colors"
                        value={productData.colors.join(", ")}
                        onChange={(e) =>
                            setProductData({
                                ...productData,
                                colors: e.target.value.split(",").map((color) => color.trim()).filter(c => c !== ""),
                            })
                        }
                        className="w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                {/* Image Upload */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2"> Upload Image</label>
                    <input type="file" onChange={handleImageUpload} />
                    {uploading && <p>Uploading image...</p>}
                    
                    {/* 🎯 UPDATED IMAGE DISPLAY WITH REMOVE BUTTON */}
                    <div className="flex gap-4 mt-4 flex-wrap">
                        {productData.images.map((image, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={image.url}
                                    alt={image.altText || `Product Image ${index + 1}`}
                                    className="w-20 h-20 object-cover rounded-md shadow-md"
                                />
                                {/* Remove Button */}
                                <button
                                    type="button" // Important: use type="button" to prevent form submission
                                    onClick={() => handleImageRemove(image.url)}
                                    className="absolute top-[-8px] right-[-8px] bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-700"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
                >
                    Update Product
                </button>
            </form>
        </div>
    );
};

export default EditProductPage;