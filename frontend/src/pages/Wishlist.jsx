import React, { useContext, useEffect, useState } from 'react';
import Title from '../component/Title';
import Card from '../components/ui/Card';
import { shopDataContext } from '../context/ShopContext';
import { userDataContext } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { HiOutlineHeart, HiMiniHeart } from 'react-icons/hi2';

const Wishlist = () => {
    const { products, currency } = useContext(shopDataContext);
    const { userData, toggleWishlist } = useContext(userDataContext);
    const [wishlistProducts, setWishlistProducts] = useState([]);

    useEffect(() => {
        if (userData?.wishlist && products) {
            const temp = products.filter(item => userData.wishlist.includes(item._id));
            setWishlistProducts(temp);
        }
    }, [userData, products]);

    return (
        <div className="container mx-auto px-4 py-12 md:py-20 min-h-[60vh]">
            <div className="flex flex-col mb-12">
                <Title text1="MY" text2="WISHLIST" />
                <p className="text-[var(--text-muted)] mt-2">View and manage your saved items.</p>
            </div>

            {wishlistProducts.length === 0 ? (
                <div className="text-center py-20 bg-[var(--background-subtle)] rounded-soft border border-[var(--border-base)] shadow-sm">
                    <HiOutlineHeart className="w-16 h-16 mx-auto text-[var(--border-base)] mb-4" />
                    <h3 className="text-xl font-bold mb-2 text-[var(--text-base)]">Your wishlist is empty</h3>
                    <p className="text-[var(--text-muted)] mb-8">Explore our collections and save your favorite items.</p>
                    <Link to="/collection" className="inline-block px-8 py-3 bg-[var(--brand-primary)] text-[var(--background-base)] font-bold uppercase tracking-widest text-sm rounded-full hover:bg-[var(--brand-secondary)] transition-colors">
                        Explore Collection
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                    {wishlistProducts.map((item) => (
                        <div key={item._id} className="group relative">
                            <Link to={`/productdetail/${item._id}`}>
                                <Card className="p-0 overflow-hidden bg-[var(--background-subtle)] border border-[var(--border-base)] group-hover:border-transparent transition-all duration-500 group-hover:ring-4 group-hover:ring-[var(--brand-secondary)] group-hover:ring-offset-4 group-hover:ring-offset-[var(--background-base)] relative">
                                    <div className="relative aspect-[4/5] overflow-hidden">
                                        <img 
                                            src={item.image1} 
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Card>
                            </Link>
                            <button 
                                onClick={(e) => { e.preventDefault(); toggleWishlist(item._id); }}
                                className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-md text-red-500 hover:scale-110 hover:bg-white transition-all focus:outline-none"
                                title="Remove from wishlist"
                            >
                                <HiMiniHeart className="w-5 h-5 drop-shadow-sm" />
                            </button>
                            <div className="mt-4">
                                <Link to={`/productdetail/${item._id}`}>
                                    <h3 className="text-sm font-bold text-[var(--text-base)] group-hover:underline underline-offset-2 truncate">{item.name}</h3>
                                </Link>
                                <p className="text-sm font-medium text-[var(--text-muted)] mt-1">{currency}{item.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
