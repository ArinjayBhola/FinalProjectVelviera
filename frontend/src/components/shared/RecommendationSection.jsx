import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { authDataContext } from '../../context/authContext';
import { userDataContext } from '../../context/UserContext';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";

const RecommendationSection = () => {
  const { serverUrl } = useContext(authDataContext);
  const { userData } = useContext(userDataContext);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const fetchRecommendations = async () => {
    if (!userData) {
        setLoading(false);
        return;
    }
    try {
      const response = await axios.get(`${serverUrl}/api/product/recommendations`, {
        withCredentials: true
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error fetching recommendations", error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8 
        : scrollLeft + clientWidth * 0.8;
      
      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [userData]);

  if (!userData) return null;
  if (!loading && recommendations.length === 0) return null;

  return (
    <section className="container mx-auto px-4 relative group">
      <div className="flex justify-between items-end mb-10">
        <div>
          <span className="text-[var(--brand-secondary)] font-bold text-xs uppercase tracking-widest mb-2 block">Personalized</span>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Recommended For You</h2>
          <p className="text-[var(--text-muted)]">Based on your past purchases and preferences.</p>
        </div>
        
        <div className="hidden md:flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-2 rounded-full border border-[var(--border-base)] hover:bg-[var(--background-subtle)] hover:text-[var(--brand-primary)] transition-all"
          >
            <HiOutlineChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2 rounded-full border border-[var(--border-base)] hover:bg-[var(--background-subtle)] hover:text-[var(--brand-primary)] transition-all"
          >
            <HiOutlineChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-8"
      >
        {loading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="min-w-[190px] animate-pulse">
              <div className="aspect-[3/4] bg-[var(--background-subtle)] rounded-soft mb-4" />
              <div className="h-4 bg-[var(--background-subtle)] rounded-full w-2/3 mb-2" />
              <div className="h-4 bg-[var(--background-subtle)] rounded-full w-1/3" />
            </div>
          ))
        ) : (
          recommendations.map((product) => (
            <Link 
              key={product._id} 
              to={`/productdetail/${product._id}`} 
              className="group relative min-w-[190px] lg:min-w-[210px]"
            >
              {product.isHighlyRecommended && (
                <div className="absolute top-2 left-2 z-20 bg-[var(--brand-secondary)] text-white px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-lg">
                  Perfect Match
                </div>
              )}
              <Card padding={false} className="aspect-[3/4] mb-3 overflow-hidden bg-[var(--background-subtle)] border-none shadow-none group-hover:shadow-xl transition-all duration-500 rounded-soft">
                <img 
                  src={product.image1} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-700"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--brand-secondary)]" style={{ width: `${product.matchScore}%` }} />
                      </div>
                      <span className="text-[8px] font-bold text-white whitespace-nowrap">{product.matchScore}% Match</span>
                   </div>
                </div>
              </Card>
              <div className="px-1">
                <h3 className="text-xs font-semibold mb-0.5 group-hover:text-[var(--brand-secondary)] transition-colors duration-300 line-clamp-1 leading-tight">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-[var(--text-muted)]">₹{product.price}</p>
                  <span className="text-[9px] font-medium text-[var(--brand-secondary)] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">View Details</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
};

export default RecommendationSection;
