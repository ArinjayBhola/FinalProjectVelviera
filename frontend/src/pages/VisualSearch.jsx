import React, { useState, useRef, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { HiOutlineCamera, HiOutlineArrowUpTray, HiOutlineXMark, HiOutlineSparkles } from 'react-icons/hi2';
import { authDataContext } from '../context/authContext';
import Button from '../components/ui/Button';

const VisualSearch = () => {
    const { serverUrl } = useContext(authDataContext);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef(null);

    const handleFile = (f) => {
        if (!f) return;
        if (!f.type.startsWith('image/')) {
            setError('Please upload a valid image file.');
            return;
        }
        setError('');
        setFile(f);
        setResults([]);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(f);
    };

    const onChoose = (e) => handleFile(e.target.files?.[0]);

    const onDrop = (e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files?.[0]);
    };

    const clearImage = () => {
        setFile(null);
        setPreview(null);
        setResults([]);
        setError('');
    };

    const search = async () => {
        if (!file) return;
        setLoading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('image', file);
            const { data } = await axios.post(`${serverUrl}/api/product/visual-search`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResults(data);
            if (data.length === 0) setError('No similar products found. Try another image.');
        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || 'Visual search failed. The AI model may still be loading — please retry in a moment.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="max-w-3xl mx-auto text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-bold uppercase tracking-widest mb-4">
                    <HiOutlineSparkles className="w-4 h-4" /> AI-Powered
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Visual Search</h1>
                <p className="text-[var(--text-muted)] max-w-xl mx-auto">
                    Upload any photo and our AI will find the most visually similar pieces in our collection.
                </p>
            </div>

            {/* Upload area */}
            <div className="max-w-2xl mx-auto">
                {!preview ? (
                    <div
                        onDrop={onDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileRef.current?.click()}
                        className="border-2 border-dashed border-[var(--border-base)] rounded-soft p-12 text-center cursor-pointer hover:border-[var(--brand-primary)] hover:bg-[var(--background-subtle)]/50 transition-all"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center">
                                <HiOutlineCamera className="w-8 h-8 text-[var(--brand-primary)]" />
                            </div>
                            <div>
                                <p className="text-lg font-bold mb-1">Drop an image here</p>
                                <p className="text-sm text-[var(--text-muted)]">or click to browse • JPG, PNG, WEBP</p>
                            </div>
                            <Button type="button" variant="secondary" size="sm" className="mt-2">
                                <HiOutlineArrowUpTray className="w-4 h-4 mr-2" /> Upload Image
                            </Button>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" onChange={onChoose} className="hidden" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="relative rounded-soft overflow-hidden border border-[var(--border-base)] bg-[var(--background-subtle)]">
                            <img src={preview} alt="Upload preview" className="w-full max-h-[400px] object-contain" />
                            <button
                                onClick={clearImage}
                                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                                title="Remove"
                            >
                                <HiOutlineXMark className="w-5 h-5" />
                            </button>
                        </div>
                        <Button onClick={search} disabled={loading} size="lg" className="h-14 rounded-full text-base">
                            {loading ? 'Analyzing image...' : 'Find Similar Products'}
                        </Button>
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-soft text-xs text-red-700 text-center">
                        {error}
                    </div>
                )}
            </div>

            {/* Results */}
            {results.length > 0 && (
                <div className="mt-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold tracking-tight">Visual Matches</h2>
                        <p className="text-sm text-[var(--text-muted)]">{results.length} products found</p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {results.map((item) => (
                            <Link key={item._id} to={`/productdetail/${item._id}`} className="group">
                                <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-soft bg-[var(--background-subtle)] border border-[var(--border-base)]">
                                    <img src={item.image1} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    {item.matchScore && (
                                        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-[var(--brand-primary)] text-[var(--background-base)] rounded-full">
                                            {item.matchScore}% Match
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-sm font-medium mb-1 group-hover:underline underline-offset-2">{item.name}</h3>
                                <p className="text-sm text-[var(--text-muted)]">₹{item.price}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisualSearch;
