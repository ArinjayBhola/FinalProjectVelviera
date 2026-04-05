import {useState, useEffect, useContext} from "react"
import { authDataContext } from '../context/AuthContext';
import axios from 'axios';
import { useModal } from '../context/ModalContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { HiOutlineCloudArrowUp, HiOutlineXCircle } from "react-icons/hi2";

const Add = () => {
  const [images, setImages] = useState([null, null, null, null]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Men");
  const [price, setPrice] = useState("");
  const [subCategory, setSubCategory] = useState("TopWear");
  const [bestseller, setBestSeller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [stock, setStock] = useState(20);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const { serverUrl } = useContext(authDataContext);
  const { showAlert } = useModal();

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/category/list`);
      if (response.data.success) {
        setCategories(response.data.categories);
        if (response.data.categories.length > 0) {
          setCategory(response.data.categories[0].name);
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageChange = (index, file) => {
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (images.every(img => img === null)) {
      showAlert("Missing Images", "Please upload at least one image to proceed.", "warning");
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("stock", stock);
      formData.append("lowStockThreshold", lowStockThreshold);
      
      images.forEach((img, index) => {
        if (img) formData.append(`image${index + 1}`, img);
      });

      const response = await axios.post(`${serverUrl}/api/product/addproduct`, formData, { withCredentials: true });

      if (response.status === 200 || response.status === 201) {
        showAlert("Product Added", "High-five! Your new product is now live in the catalog.", "success");
        setName("");
        setDescription("");
        setImages([null, null, null, null]);
        setPrice("");
        setBestSeller(false);
        setSizes([]);
        setStock(20);
        setLowStockThreshold(5);
      } else {
        showAlert("Error", response.data.message || "Failed to add product", "error");
      }
    } catch (error) {
      const backendMessage = error.response?.data?.message || "Something went wrong while adding the product. Please try again.";
      showAlert("Oops!", backendMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const availableSizes = ["S", "M", "L", "XL", "XXL"];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Add New Product</h1>
        <p className="text-[var(--text-muted)] text-sm">Create a new entry in your product catalog.</p>
      </div>

      <form onSubmit={handleAddProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Product Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="flex flex-col gap-6">
            <Input 
              label="Product Name" 
              placeholder="e.g. Slim Fit Cotton Shirt" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-base)]">Description</label>
              <textarea
                className="w-full px-3 py-2 bg-[var(--background-base)] border border-[var(--border-base)] rounded-soft text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)] focus:border-transparent transition-all min-h-[120px]"
                placeholder="Describe the product features, material, and fit..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-base)]">Category</label>
                <select 
                  className="px-3 py-2 bg-[var(--background-base)] border border-[var(--border-base)] rounded-soft text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)]"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-base)]">Sub-Category</label>
                <select 
                  className="px-3 py-2 bg-[var(--background-base)] border border-[var(--border-base)] rounded-soft text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)]"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                >
                  <option value="TopWear">TopWear</option>
                  <option value="BottomWear">BottomWear</option>
                  <option value="WinterWear">WinterWear</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Price" 
                type="number" 
                placeholder="0.00" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required 
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-base)]">Manage Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])}
                      className={`px-4 py-2 text-xs font-bold rounded-soft border transition-all ${
                        sizes.includes(size) 
                          ? 'bg-[var(--brand-primary)] text-[var(--background-base)] border-[var(--brand-primary)]' 
                          : 'border-[var(--border-base)] text-[var(--text-muted)] hover:border-[var(--brand-secondary)]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Stock Quantity"
                type="number"
                min="0"
                placeholder="20"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
              <Input
                label="Low-Stock Alert Threshold"
                type="number"
                min="0"
                placeholder="5"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                required
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer group w-fit">
              <input 
                type="checkbox" 
                checked={bestseller}
                onChange={() => setBestSeller(!bestseller)}
                className="w-4 h-4 rounded border-[var(--border-base)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
              />
              <span className="text-sm font-medium group-hover:text-[var(--brand-primary)] transition-colors">Mark as Bestseller</span>
            </label>
          </Card>

          <Button type="submit" size="lg" disabled={loading} className="w-full md:w-48 self-end h-12">
            {loading ? "Adding..." : "Add Product"}
          </Button>
        </div>

        {/* Right: Media Upload */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider">Product Images</h3>
            <p className="text-xs text-[var(--text-muted)]">Upload up to 4 high-quality product images.</p>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square">
                  <label 
                    className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-soft transition-all cursor-pointer ${
                      img ? 'border-[var(--brand-primary)] bg-[var(--background-subtle)]' : 'border-[var(--border-base)] hover:border-[var(--brand-secondary)]'
                    }`}
                  >
                    {!img ? (
                      <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
                        <HiOutlineCloudArrowUp className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-center px-2">Image {index + 1}</span>
                      </div>
                    ) : (
                      <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover rounded-soft" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageChange(index, e.target.files[0])} 
                    />
                  </label>
                  {img && (
                    <button 
                      type="button"
                      onClick={() => handleImageChange(index, null)}
                      className="absolute -top-2 -right-2 p-1 bg-white text-red-500 rounded-full shadow-md hover:text-red-700"
                    >
                      <HiOutlineXCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default Add;
