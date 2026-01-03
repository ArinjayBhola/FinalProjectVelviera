import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { shopDataContext } from "../context/ShopContext";
import { HiStar, HiOutlineCheckCircle } from "react-icons/hi2";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { productId } = useParams();
  const { products, currency, addtoCart, loading } = useContext(shopDataContext);
  const [productData, setProductData] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const fetchProductData = () => {
    const product = products.find(item => item._id === productId);
    if (product) {
      const images = [product.image1, product.image2, product.image3, product.image4].filter(Boolean);
      
      let parsedSizes = [];
      try {
        if (typeof product.sizes === 'string') {
          parsedSizes = JSON.parse(product.sizes);
        } else if (Array.isArray(product.sizes)) {
          // Sometimes it comes as an array containing a single JSON string
          if (product.sizes.length === 1 && typeof product.sizes[0] === 'string' && product.sizes[0].startsWith('[')) {
            parsedSizes = JSON.parse(product.sizes[0]);
          } else {
            parsedSizes = product.sizes;
          }
        }
      } catch (e) {
        console.error("Failed to parse sizes", e);
        parsedSizes = Array.isArray(product.sizes) ? product.sizes : [];
      }

      setProductData({ ...product, images, sizes: parsedSizes });
      setMainImage(images[0] || "");
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  const handleAddToCart = () => {
    const isClothing = ['clothing', 'men', 'women', 'kids'].includes(productData.category.toLowerCase());
    
    if (isClothing) {
      if (!selectedSize) {
        toast.error("Please select a size");
        return;
      }
      addtoCart(productData._id, selectedSize);
    } else {
      addtoCart(productData._id, "Standard");
    }
  };

  if (!productData) return <div className="min-h-screen bg-[var(--background-base)]" />;

  const isClothing = ['clothing', 'men', 'women', 'kids'].includes(productData.category.toLowerCase());

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Image Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto">
            {productData.images.map((img, index) => (
              <button 
                key={index} 
                onClick={() => setMainImage(img)}
                className={`w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-soft border transition-all ${
                  mainImage === img ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/10' : 'border-[var(--border-base)] hover:border-[var(--brand-secondary)]'
                } overflow-hidden bg-[var(--background-subtle)]`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex-1 aspect-[4/5] rounded-soft overflow-hidden bg-[var(--background-subtle)] border border-[var(--border-base)]">
            <img src={mainImage} alt={productData.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col gap-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3 block">
              {productData.category} / {productData.subCategory}
            </span>
            <h1 className="text-4xl font-bold tracking-tight mb-4">{productData.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <HiStar key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="text-sm text-[var(--text-muted)]">(124 Reviews)</span>
            </div>
          </div>

          <p className="text-3xl font-medium">{currency}{productData.price}</p>
          
          <p className="text-[var(--text-muted)] leading-relaxed max-w-xl">
            {productData.description}
          </p>

          {/* Size Selector */}
          {isClothing && productData.sizes && (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider">Select Size</h3>
              <div className="flex flex-wrap gap-3">
                {productData.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[56px] h-12 flex items-center justify-center px-4 rounded-soft border text-sm font-medium transition-all ${
                      selectedSize === size 
                        ? 'bg-[var(--brand-primary)] text-[var(--background-base)] border-[var(--brand-primary)] shadow-md' 
                        : 'border-[var(--border-base)] text-[var(--text-base)] hover:border-[var(--brand-secondary)]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Button size="lg" className="w-full md:w-64 py-4 rounded-full" onClick={handleAddToCart} disabled={loading}>
              {loading ? 'Adding...' : 'Add to Cart'}
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-[var(--border-base)]">
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                <span>100% Original product</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                <span>Cash on delivery available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Reviews Tabs */}
      <div className="mt-24">
        <div className="flex border-b border-[var(--border-base)] mb-8">
          <button className="px-8 py-4 text-sm font-bold border-b-2 border-[var(--brand-primary)]">Description</button>
          <button className="px-8 py-4 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-base)]">Reviews (124)</button>
        </div>
        <div className="max-w-3xl text-[var(--text-muted)] leading-relaxed space-y-4">
          <p>
            Experience the perfect blend of style and sustainability with the {productData.name}. Meticulously crafted using premium materials, this piece is designed to withstand the test of time while keeping you at the forefront of contemporary fashion.
          </p>
          <p>
            Whether you're dressing for a casual day out or a refined evening event, its versatile silhouette and superior comfort make it an essential addition to any curated wardrobe.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
