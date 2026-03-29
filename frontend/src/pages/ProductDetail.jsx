import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { shopDataContext } from "../context/ShopContext";
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/authContext";
import { HiStar, HiOutlineCheckCircle, HiOutlineHeart, HiMiniHeart } from "react-icons/hi2";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import axios from 'axios';
import { useModal } from "../context/ModalContext";

const ProductDetail = () => {
  const { productId } = useParams();
  const { products, currency, addtoCart, updateQuantity, cartItem, loading } = useContext(shopDataContext);
  const [productData, setProductData] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const { showAlert } = useModal();
  const { userData, toggleWishlist } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const [activeTab, setActiveTab] = useState('description');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRatingEmoji = (num) => {
    switch(num) {
      case 1: return "😠";
      case 2: return "😞";
      case 3: return "😐";
      case 4: return "😊";
      case 5: return "😍";
      default: return "";
    }
  };

  const isInWishlist = userData?.wishlist?.includes(productId);

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
        showAlert("Size Required", "Please select a size before adding the item to your cart.", "info");
        return;
      }
      addtoCart(productData._id, selectedSize);
    } else {
      addtoCart(productData._id, "Standard");
    }
    showAlert("Added to Cart", "The item has been added to your bag. Continue shopping or checkout now!", "success");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
        const res = await axios.post(`${serverUrl}/api/product/${productId}/review`, { rating, comment }, { withCredentials: true });
        if (res.status === 201) {
            showAlert("Success", "Your review has been submitted.", "success");
            setProductData(prev => ({ ...prev, reviews: res.data.product.reviews }));
            setComment('');
        }
    } catch (error) {
        showAlert("Error", error.response?.data?.message || "Failed to submit review", "error");
    } finally {
        setIsSubmitting(false);
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
                {[1, 2, 3, 4, 5].map((i) => {
                   const avgRating = productData.reviews?.length > 0 
                     ? productData.reviews.reduce((a,c) => a+c.rating, 0)/productData.reviews.length 
                     : 5;
                   return (
                     <HiStar key={i} className={`w-5 h-5 ${i <= avgRating ? 'fill-current' : 'text-gray-300 fill-current'}`} />
                   );
                })}
              </div>
              <span className="text-sm text-[var(--text-muted)]">({productData.reviews?.length || 0} Reviews)</span>
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

          <div className="flex flex-col gap-4 max-w-sm">
            <div className="flex gap-4">
              {(cartItem[productId]?.[selectedSize] > 0 || (!isClothing && cartItem[productId]?.["Standard"] > 0)) ? (
                <div className="flex items-center gap-6 flex-1 h-14 bg-[var(--background-subtle)] rounded-full border border-[var(--border-base)] px-6">
                  <button 
                    onClick={() => updateQuantity(productId, isClothing ? selectedSize : "Standard", (cartItem[productId][isClothing ? selectedSize : "Standard"]) - 1)}
                    className="text-2xl font-bold text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors w-8 h-8 flex items-center justify-center p-0 leading-none"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-lg font-bold">
                    {cartItem[productId][isClothing ? selectedSize : "Standard"]}
                  </span>
                  <button 
                    onClick={() => updateQuantity(productId, isClothing ? selectedSize : "Standard", (cartItem[productId][isClothing ? selectedSize : "Standard"]) + 1)}
                    className="text-2xl font-bold text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors w-8 h-8 flex items-center justify-center p-0 leading-none"
                  >
                    +
                  </button>
                </div>
              ) : (
                <Button size="lg" className="flex-1 py-4 rounded-full" onClick={handleAddToCart} disabled={loading}>
                  {loading ? 'Adding...' : 'Add to Cart'}
                </Button>
              )}

              <button 
                  onClick={() => toggleWishlist(productId)}
                  className={`w-14 h-14 flex items-center shrink-0 justify-center rounded-full border shadow-sm transition-all ${isInWishlist ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100 ring-2 ring-red-100 ring-offset-2 ring-offset-[var(--background-base)]' : 'bg-[var(--background-subtle)] border-[var(--border-base)] text-[var(--text-muted)] hover:border-red-200 hover:text-red-500 hover:bg-red-50'}`}
                  title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                  {isInWishlist ? <HiMiniHeart className="w-6 h-6 shrink-0" /> : <HiOutlineHeart className="w-6 h-6 shrink-0" />}
              </button>
            </div>
            
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
          <button onClick={() => setActiveTab('description')} className={`px-8 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'description' ? 'border-[var(--brand-primary)] text-[var(--text-base)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}>Description</button>
          <button onClick={() => setActiveTab('reviews')} className={`px-8 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-[var(--brand-primary)] text-[var(--text-base)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}>Reviews ({productData.reviews?.length || 0})</button>
        </div>
        
        {activeTab === 'description' ? (
          <div className="max-w-3xl text-[var(--text-muted)] leading-relaxed space-y-4 animate-in fade-in">
            <p>
              Experience the perfect blend of style and sustainability with the {productData.name}. Meticulously crafted using premium materials, this piece is designed to withstand the test of time while keeping you at the forefront of contemporary fashion.
            </p>
            <p>
              Whether you're dressing for a casual day out or a refined evening event, its versatile silhouette and superior comfort make it an essential addition to any curated wardrobe.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in">
            <div className="flex flex-col gap-8">
              <h3 className="text-xl font-bold tracking-tight">Customer Reviews</h3>
              {(!productData.reviews || productData.reviews.length === 0) ? (
                <p className="text-[var(--text-muted)] italic">Be the first to review this product.</p>
              ) : (
                 <div className="flex flex-col gap-6">
                    {productData.reviews.map((rev, index) => (
                      <div key={index} className="p-6 bg-[var(--background-subtle)] rounded-soft border border-[var(--border-base)]">
                         <div className="flex justify-between items-start mb-4">
                           <div>
                             <p className="font-bold text-[var(--text-base)]">{rev.name}</p>
                             <p className="text-xs text-[var(--text-muted)]">{new Date(rev.date).toLocaleDateString()}</p>
                           </div>
                           <div className="flex text-yellow-500">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <HiStar key={i} className={`w-4 h-4 ${i <= rev.rating ? 'fill-current' : 'text-gray-300 fill-current'}`} />
                              ))}
                           </div>
                         </div>
                         <p className="text-[var(--text-muted)] text-sm leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                 </div>
              )}
            </div>
            
            <div className="p-8 bg-[var(--background-subtle)] rounded-soft border border-[var(--border-base)] h-fit">
               <h3 className="text-xl font-bold tracking-tight mb-6">Write a Review</h3>
               <form onSubmit={handleReviewSubmit} className="flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2">Rating</label>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2 text-yellow-500 cursor-pointer">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <HiStar 
                            key={i} 
                            onClick={() => setRating(i)}
                            className={`w-8 h-8 transition-transform hover:scale-110 ${i <= rating ? 'fill-current drop-shadow-sm' : 'text-gray-300 fill-current hover:text-yellow-300'}`} 
                          />
                        ))}
                      </div>
                      <div key={rating} className="text-3xl animate-float-emoji">
                        {getRatingEmoji(rating)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Your Review</label>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      placeholder="Share your thoughts about this product..."
                      className="w-full bg-[var(--background-base)] border border-[var(--border-base)] rounded-soft p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)] resize-none"
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="py-4">
                     {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
               </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
