import React, { useContext, useEffect, useState } from 'react';
import { HiOutlineAdjustmentsHorizontal, HiOutlineChevronRight, HiOutlineChevronLeft, HiOutlineChevronDown } from "react-icons/hi2";
import { shopDataContext } from '../context/ShopContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Link, useLocation } from 'react-router-dom';

const Collections = () => {
  const { products, search, showSearch } = useContext(shopDataContext);
  const location = useLocation();
  const [showFilter, setShowFilter] = useState(false);
  const [filterProduct, setFilterProduct] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const toggleCategory = (value) => {
    setCategory(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
  };

  const toggleSubCategory = (value) => {
    setSubCategory(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
  };

  const applyFilter = () => {
    let productCopy = products?.slice() || [];

    if (showSearch && search) {
      productCopy = productCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (category.length > 0) {
      productCopy = productCopy.filter(item => category.includes(item.category));
    }
    if (subCategory.length > 0) {
      productCopy = productCopy.filter(item => subCategory.includes(item.subCategory));
    }

    // Apply Sorting
    switch (sortType) {
      case 'low-high':
        productCopy.sort((a, b) => a.price - b.price);
        break;
      case 'high-low':
        productCopy.sort((a, b) => b.price - a.price);
        break;
      case 'latest':
        productCopy.sort((a, b) => b.date - a.date);
        break;
      default:
        // Keep as relevant/default
        break;
    }

    setFilterProduct(productCopy);
  };

  useEffect(() => {
    applyFilter();
    setCurrentPage(1);
  }, [category, subCategory, search, showSearch, sortType, products]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    if (catParam) {
      if (catParam === 'mens') setCategory(['Men']);
      else if (catParam === 'womens') setCategory(['Women']);
      else if (catParam === 'kids') setCategory(['Kids']);
      else if (catParam === 'latest') {
        setSortType('latest');
        setCategory([]);
      }
    }
  }, [location.search]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filterProduct.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filterProduct.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex flex-col gap-8">
        <div>
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center justify-between w-full md:cursor-default"
          >
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <HiOutlineAdjustmentsHorizontal className="w-5 h-5" />
              Filters
            </h2>
            <HiOutlineChevronDown className={`w-4 h-4 md:hidden transition-transform ${showFilter ? 'rotate-180' : ''}`} />
          </button>

          <div className={`${showFilter ? 'flex' : 'hidden md:flex'} flex-col gap-8 mt-6`}>
            {/* Category Filter */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Categories</h3>
              <div className="flex flex-col gap-3">
                {['Men', 'Women', 'Kids'].map((cat) => (
                  <label key={cat} className="flex items-center gap-3 text-sm cursor-pointer group">
                    <input 
                      type="checkbox" 
                      value={cat} 
                      checked={category.includes(cat)}
                      onChange={(e) => toggleCategory(e.target.value)}
                      className="w-4 h-4 rounded border-[var(--border-base)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                    />
                    <span className="group-hover:text-[var(--brand-primary)] transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sub-Category Filter */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Type</h3>
              <div className="flex flex-col gap-3">
                {['TopWear', 'BottomWear', 'WinterWear'].map((sub) => (
                  <label key={sub} className="flex items-center gap-3 text-sm cursor-pointer group">
                    <input 
                      type="checkbox" 
                      value={sub} 
                      checked={subCategory.includes(sub)}
                      onChange={(e) => toggleSubCategory(e.target.value)}
                      className="w-4 h-4 rounded border-[var(--border-base)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                    />
                    <span className="group-hover:text-[var(--brand-primary)] transition-colors">{sub}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">All Collections</h1>
            <p className="text-sm text-[var(--text-muted)]">{filterProduct.length} Products Found</p>
          </div>
          
          <select 
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="bg-[var(--background-base)] border border-[var(--border-base)] rounded-soft text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)]"
          >
            <option value="relevant">Sort by: Relevant</option>
            <option value="latest">Sort by: Latest</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {currentProducts.map((item) => (
            <Link key={item._id} to={`/productdetail/${item._id}`} className="group">
              <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-soft bg-[var(--background-subtle)] border border-[var(--border-base)]">
                <img 
                  src={item.image1} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700"
                />
              </div>
              <h3 className="text-sm font-medium mb-1 group-hover:underline underline-offset-2">{item.name}</h3>
              <p className="text-sm text-[var(--text-muted)]">₹{item.price}</p>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filterProduct.length === 0 && (
          <div className="py-24 text-center">
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-[var(--text-muted)] mb-8">Try adjusting your filters or search query.</p>
            <Button variant="secondary" onClick={() => { setCategory([]); setSubCategory([]); }}>Clear All Filters</Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-16">
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => paginate(currentPage - 1)}
              className="p-2"
            >
              <HiOutlineChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`w-9 h-9 flex items-center justify-center rounded-soft text-sm font-medium transition-colors ${
                    currentPage === i + 1 
                      ? 'bg-[var(--brand-primary)] text-[var(--background-base)]' 
                      : 'hover:bg-[var(--background-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <Button 
              variant="secondary" 
              size="sm" 
              disabled={currentPage === totalPages}
              onClick={() => paginate(currentPage + 1)}
              className="p-2"
            >
              <HiOutlineChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;