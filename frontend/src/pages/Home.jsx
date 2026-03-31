import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { shopDataContext } from '../context/ShopContext';
import { authDataContext } from '../context/authContext';
import { userDataContext } from '../context/UserContext';
import Card from '../components/ui/Card';
import RecommendationSection from '../components/shared/RecommendationSection';

const Home = () => {
  const { products } = useContext(shopDataContext);
  const { serverUrl } = useContext(authDataContext);
  const { token, userData } = useContext(userDataContext);
  
  const latestProducts = products?.slice(0, 4) || [];

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden bg-[var(--background-subtle)]">
        <div className="container mx-auto px-4 z-10">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest uppercase text-[var(--brand-secondary)] border border-[var(--border-base)] rounded-full">
              New Collection 2026
            </span>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[0.9]">
              ESSENTIALS <br />
              <span className="text-[var(--brand-secondary)]">REDEFINED.</span>
            </h1>
            <p className="text-lg text-[var(--text-muted)] mb-10 max-w-lg leading-relaxed">
              Discover our latest drop of premium essentials. Crafted with precision, designed for the modern individual who values quality and minimalism.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/collection">
                <Button size="lg" className="rounded-full px-8">Shop Collection</Button>
              </Link>
              <Link to="/about">
                <Button variant="secondary" size="lg" className="rounded-full px-8">Our Story</Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Abstract shapes or placeholder for image */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--border-base)]/20 -skew-x-12 translate-x-1/4" />
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
