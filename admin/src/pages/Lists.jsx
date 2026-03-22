import axios from 'axios';
import {useState, useContext, useEffect} from "react";
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { HiOutlineTrash, HiOutlineCube } from "react-icons/hi2";
import { useModal } from '../context/ModalContext';
import { authDataContext } from '../context/AuthContext';

const Lists = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { serverUrl } = useContext(authDataContext);
  const { showAlert, showConfirm } = useModal();

  const fetchList = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/product/list`);
      setList(response.data || []);
    } catch (error) {
      showAlert("Error", "We couldn't retrieve your product catalog. Please check your connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  const removeList = async (id) => {
    showConfirm(
      "Confirm Deletion",
      "Are you sure you want to remove this product from your catalog? This action cannot be undone.",
      async () => {
        try {
          const response = await axios.post(`${serverUrl}/api/product/remove/${id}`, {}, { withCredentials: true });
          if (response.status === 200 || response.status === 201) {
            showAlert("Removed", "The product has been successfully removed from your store.", "success");
            fetchList();
          } else {
            showAlert("Error", response.data.message || "Could not remove product", "error");
          }
        } catch (error) {
          showAlert("Error", "Something went wrong while trying to delete the product.", "error");
        }
      }
    );
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Product List</h1>
          <p className="text-[var(--text-muted)] text-sm">Manage your inventory and product visibility.</p>
        </div>
        <p className="text-sm font-bold text-[var(--brand-primary)] bg-[var(--background-base)] px-4 py-2 border border-[var(--border-base)] rounded-full">
          {list.length} Products
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse h-24" />
          ))
        ) : list.length > 0 ? (
          <div className="flex flex-col gap-4">
            {/* Table Header (Desktop) */}
            <div className="hidden md:grid grid-cols-[80px_1fr_120px_120px_60px] gap-6 px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
              <span>Image</span>
              <span>Name</span>
              <span>Category</span>
              <span>Price</span>
              <span className="text-right">Action</span>
            </div>

            {list.map((item) => (
              <Card key={item._id} padding={false} className="overflow-hidden group">
                <div className="grid grid-cols-1 md:grid-cols-[80px_1fr_120px_120px_60px] items-center gap-6 p-4 md:p-2 md:px-6">
                  <div className="w-16 h-16 md:w-12 md:h-12 bg-[var(--background-subtle)] rounded-soft overflow-hidden border border-[var(--border-base)]">
                    <img src={item.image1} alt="" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="font-bold text-sm md:text-base">{item.name}</span>
                    <span className="text-xs text-[var(--text-muted)] md:hidden">{item.category}</span>
                  </div>

                  <span className="hidden md:block text-sm text-[var(--text-muted)]">{item.category}</span>
                  
                  <span className="font-bold text-sm">₹{item.price}</span>

                  <div className="flex justify-end">
                    <button 
                      onClick={() => removeList(item._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete Product"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-[var(--border-base)] rounded-soft">
            <HiOutlineCube className="w-12 h-12 text-[var(--border-base)] mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-4">No products found</h3>
            <Button onClick={() => window.location.href='/admin/add'}>Add Your First Product</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lists;
