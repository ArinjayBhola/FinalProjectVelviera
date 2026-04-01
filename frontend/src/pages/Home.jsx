import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { shopDataContext } from '../context/ShopContext';
import { authDataContext } from '../context/authContext';
import { userDataContext } from '../context/UserContext';
import Card from '../components/ui/Card';
import RecommendationSection from '../components/shared/RecommendationSection';
import { motion } from 'framer-motion';

const Home = () => {
  const { products } = useContext(shopDataContext);
  const { serverUrl } = useContext(authDataContext);
  const { token, userData } = useContext(userDataContext);
  
  const latestProducts = products?.slice(0, 4) || [];

  return (
    <div className="flex flex-col gap-32 pb-24 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden bg-[var(--background-base)]">
        {/* Background Layer */}
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="/hero.png" 
            alt="Premium Collection" 
            className="w-full h-full object-cover object-center opacity-60 dark:opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--background-base)] via-[var(--background-base)]/80 to-transparent" />
        </motion.div>

        <div className="container mx-auto px-6 z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-[11px] font-bold tracking-[0.3em] uppercase text-[var(--brand-primary)] bg-[var(--brand-primary)]/5 border border-[var(--brand-primary)]/10 rounded-full backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-secondary)] animate-pulse" />
              Limited Collection 2026
            </motion.div>
            
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-7xl md:text-9xl font-black tracking-tighter mb-10 leading-[0.85] text-gradient"
            >
              PURE <br />
              ESSENCE.
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-xl text-[var(--text-muted)] mb-12 max-w-xl font-medium leading-relaxed"
            >
              A symphony of premium materials and architectural silhouettes. Designed for the discerning individual who find luxury in simplicity.
            </motion.p>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="flex flex-wrap gap-5"
            >
              <Link to="/collection">
                <Button size="lg" className="rounded-full px-10 h-14 bg-[var(--brand-primary)] shadow-xl shadow-[var(--brand-primary)]/20 hover:scale-105 transition-transform">
                  Explore Collection
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="secondary" size="lg" className="rounded-full px-10 h-14 backdrop-blur-md bg-white/30 border-white/20 hover:bg-white/50 transition-all">
                  Our Philosophy
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Categories</h2>
            <p className="text-[var(--text-muted)]">Curation of our most loved pieces.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Mens', img: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=800' },
            { name: 'Womens', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800' },
            { name: 'Latest', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800' }
          ].map((category) => (
            <Link 
              key={category.name}
              to={`/collection?category=${category.name.toLowerCase()}`}
              className="group relative h-96 overflow-hidden rounded-soft bg-[var(--background-subtle)] border border-[var(--border-base)] transition-all duration-500 hover:ring-4 hover:ring-[var(--brand-secondary)] hover:ring-offset-4 hover:ring-offset-[var(--background-base)] hover:border-transparent"
            >
              <img src={category.img} alt={category.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-500 group-hover:opacity-80" />
              <div className="absolute bottom-8 left-8 text-white z-10 transition-transform duration-500 group-hover:-translate-y-2">
                <h3 className="text-3xl font-bold mb-2 tracking-tight text-white">{category.name}</h3>
                <span className="text-sm font-bold uppercase tracking-widest text-[#fdfbf7] border-b-2 border-transparent group-hover:border-[#8b7355] transition-colors duration-300">Explore Collection</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Products */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Latest Arrivals</h2>
            <p className="text-[var(--text-muted)]">Check out what just landed in our store.</p>
          </div>
          <Link to="/collection" className="text-sm font-bold underline underline-offset-4">View All</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {latestProducts.length > 0 ? (
            latestProducts.map((product) => (
              <Link key={product._id} to={`/productdetail/${product._id}`} className="group">
                <Card padding={false} className="aspect-[3/4] mb-4 overflow-hidden bg-[var(--background-subtle)] border-none shadow-none">
                  <img 
                    src={product.image1} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-700"
                  />
                </Card>
                <h3 className="text-sm font-medium mb-1 group-hover:underline underline-offset-2">{product.name}</h3>
                <p className="text-sm text-[var(--text-muted)]">₹{product.price}</p>
              </Link>
            ))
          ) : (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-[var(--background-subtle)] rounded-soft mb-4" />
                <div className="h-4 bg-[var(--background-subtle)] rounded-full w-2/3 mb-2" />
                <div className="h-4 bg-[var(--background-subtle)] rounded-full w-1/3" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recommended for You - ML Model Integrated */}
      <RecommendationSection />

      {/* Newsletter */}
      <section className="container mx-auto px-4">
        <Card className="bg-[var(--brand-primary)] text-[var(--background-base)] py-16 px-8 flex flex-col md:flex-row items-center justify-between gap-12 border-none">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold tracking-tight mb-4 leading-tight">Join the Velviera Inner Circle</h2>
            <p className="text-[var(--background-base)]/70">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
          </div>
          <div className="flex w-full max-w-md gap-3">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 bg-[var(--background-base)]/10 border border-[var(--background-base)]/20 rounded-soft px-4 py-3 placeholder:text-[var(--background-base)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--background-base)]/50"
            />
            <Button variant="secondary" className="px-8 bg-[var(--background-base)] text-[var(--brand-primary)]">Subscribe</Button>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Home;
