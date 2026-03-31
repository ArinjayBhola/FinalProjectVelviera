import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { authDataContext } from '../../context/authContext';
import { userDataContext } from '../../context/UserContext';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';

const RecommendationSection = () => {
  const { serverUrl } = useContext(authDataContext);
  const { token } = useContext(userDataContext);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    if (!token) {
        setLoading(false);
        return;
    }
    try {
      const response = await axios.get(`${serverUrl}/api/product/recommendations`, {
        headers: { token }
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error fetching recommendations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [token]);

  if (!token) return null;
  if (!loading && recommendations.length === 0) return null;

  return (
    <section className="container mx-auto px-4">
      <div className="flex justify-between items-end mb-12">
        <div>
          <span className="text-[var(--brand-secondary)] font-bold text-xs uppercase tracking-widest mb-2 block">Personalized</span>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Recommended For You</h2>
          <p className="text-[var(--text-muted)]">Based on your past purchases and preferences.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-[var(--background-subtle)] rounded-soft mb-4" />
              <div className="h-4 bg-[var(--background-subtle)] rounded-full w-2/3 mb-2" />
              <div className="h-4 bg-[var(--background-subtle)] rounded-full w-1/3" />
            </div>
          ))
        ) : (
          recommendations.map((product) => (
            <Link key={product._id} to={`/productdetail/${product._id}`} className="group relative">
              {product.isHighlyRecommended && (
                <div className="absolute top-3 left-3 z-20 bg-[var(--brand-secondary)] text-[var(--background-base)] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                  Perfect Match
                </div>
              )}
              <Card padding={false} className="aspect-[3/4] mb-4 overflow-hidden bg-[var(--background-subtle)] border-none shadow-none group-hover:shadow-2xl transition-all duration-500 rounded-soft">
                <img 
                  src={product.image1} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--brand-secondary)]" style={{ width: `${product.matchScore}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-white whitespace-nowrap">{product.matchScore}% Match</span>
                   </div>
                </div>
              </Card>
              <div className="px-1">
                <h3 className="text-sm font-semibold mb-1 group-hover:text-[var(--brand-secondary)] transition-colors duration-300 line-clamp-1">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-[var(--text-muted)]">₹{product.price}</p>
                  <span className="text-[10px] font-medium text-[var(--brand-secondary)] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">View Details →</span>
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
