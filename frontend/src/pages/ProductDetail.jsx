import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { shopDataContext } from "../context/ShopContext";
import { FaStar } from "react-icons/fa";
import { FaStarHalfAlt } from "react-icons/fa";
import RelatedProduct from "../component/RelatedProduct";
import Loading from "../component/Loading";
import { toast } from 'react-toastify';

function ProductDetail() {
  let { productId } = useParams();
  let { products, currency, addtoCart, loading } = useContext(shopDataContext);
  let [productData, setProductData] = useState(false);

  const [image, setImage] = useState("");
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [image3, setImage3] = useState("");
  const [image4, setImage4] = useState("");
  const [size, setSize] = useState("");

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item);
        console.log(productData);
        setImage1(item.image1);
        setImage2(item.image2);
        setImage3(item.image3);
        setImage4(item.image4);
        setImage(item.image1);

        return null;
      }
    });
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  // Helper to safely parse sizes
  const getProcessedSizes = () => {
    if (!productData || !productData.sizes) return [];
    
    let sizes = productData.sizes;
    
    // Handle case where sizes might be a stringified array inside an array
    if (Array.isArray(sizes) && sizes.length === 1 && typeof sizes[0] === 'string') {
      try {
        // Try to parse if it looks like a JSON array
        if (sizes[0].startsWith('[')) {
           const parsed = JSON.parse(sizes[0]);
           if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error("Error parsing sizes:", e);
      }
    }
    
    return sizes;
  };

  const processedSizes = getProcessedSizes();

  const handleAddToCart = () => {
    const isClothing = ['clothing', 'men', 'women', 'kids'].includes(productData.category.toLowerCase());
    
    if (isClothing) {
      if (!size) {
        toast.error("Please Select Size");
        return;
      }
      addtoCart(productData._id, size);
    } else {
      addtoCart(productData._id, "Standard");
    }
  };

  return productData ? (
    <div className="w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] flex flex-col items-center pt-20 pb-10">
      <div className="max-w-7xl w-full flex flex-col lg:flex-row gap-10 px-4 md:px-10">
        {/* Image Gallery Section */}
        <div className="flex flex-col-reverse lg:flex-row gap-4 lg:w-1/2">
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto justify-between lg:justify-start">
            {[image1, image2, image3, image4].map((img, index) => (
              img && (
                <div key={index} className="w-20 h-20 md:w-24 md:h-24 bg-slate-300 border border-gray-600 rounded-md overflow-hidden cursor-pointer flex-shrink-0" onClick={() => setImage(img)}>
                  <img
                    src={img}
                    alt={`product-thumb-${index}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                  />
                </div>
              )
            ))}
          </div>
          <div className="flex-1 border border-gray-600 rounded-md overflow-hidden h-[400px] md:h-[500px] lg:h-[600px]">
            <img
              src={image}
              alt="product-main"
              className="w-full h-full object-contain bg-[#1a1a1a]"
            />
          </div>
        </div>

        {/* Product Info Section */}
        <div className="flex flex-col gap-6 lg:w-1/2 text-white">
          <h1 className="text-3xl md:text-4xl font-bold">{productData.name.toUpperCase()}</h1>
          
          <div className="flex items-center gap-1">
            <div className="flex text-yellow-400">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStarHalfAlt />
            </div>
            <p className="text-gray-300 ml-2">(124 verified ratings)</p>
          </div>

          <p className="text-3xl font-semibold">
            {currency} {productData.price}
          </p>

          <p className="text-gray-300 text-lg leading-relaxed">
            {productData.description}
          </p>

          {/* Conditional Size Selector */}
          {['clothing', 'men', 'women', 'kids'].includes(productData.category.toLowerCase()) && (
            <div className="flex flex-col gap-3 my-4">
              <p className="text-xl font-semibold">Select Size</p>
              <div className="flex gap-3 flex-wrap">
                {processedSizes.map((item, index) => (
                  <button
                    key={index}
                    className={`py-3 px-6 border rounded-md transition-all duration-200 text-lg font-medium min-w-[60px]
                    ${item === size 
                      ? "bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.5)] scale-105" 
                      : "bg-[#ffffff05] text-gray-300 border-gray-600 hover:bg-[#ffffff15] hover:border-gray-400"}`}
                    onClick={() => setSize(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            className="w-full md:w-auto bg-white text-black font-bold py-4 px-10 rounded-full mt-4 hover:bg-gray-200 transition-all active:scale-95 shadow-xl text-lg"
            onClick={handleAddToCart}>
            {loading ? <Loading /> : "ADD TO CART"}
          </button>

          <div className="w-full h-[1px] bg-gray-700 my-4"></div>
          
          <div className="text-sm text-gray-400 space-y-1">
            <p>✓ 100% Original Product.</p>
            <p>✓ Cash on delivery is available on this product</p>
            <p>✓ Easy return and exchange policy within 7 days</p>
          </div>
        </div>
      </div>

      {/* Description & Reviews Section */}
      <div className="w-full max-w-7xl px-4 md:px-10 mt-20">
        <div className="flex border-b border-gray-700">
          <button className="px-6 py-3 text-sm font-bold text-white border-b-2 border-white">Description</button>
          <button className="px-6 py-3 text-sm text-gray-400 hover:text-white">Reviews (124)</button>
        </div>

        <div className="py-6 text-gray-300 text-sm md:text-base leading-relaxed border border-gray-700 p-6 mt-4 rounded-md bg-[#ffffff05]">
          <p>
            Upgrade your wardrobe with this stylish slim-fit cotton shirt, available now on Velviera. Crafted from
            breathable, high-quality fabric, it offers all-day comfort and effortless style. Easy to maintain and
            perfect for any setting, this shirt is a must-have essential for those who value both fashion and function.
          </p>
        </div>

        <div className="mt-10">
          <RelatedProduct
            category={productData.category}
            subCategory={productData.subCategory}
            currentProductId={productData._id}
          />
        </div>
      </div>
    </div>
  ) : (
    <div className="w-full min-h-screen bg-[#141414]"></div>
  );
}

export default ProductDetail;
