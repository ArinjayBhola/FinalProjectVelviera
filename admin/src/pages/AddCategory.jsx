import axios from 'axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { authDataContext } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { HiOutlineTrash } from "react-icons/hi2";

const AddCategory = () => {
    const [name, setName] = useState("");
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const { serverUrl } = useContext(authDataContext);
    const { showAlert } = useModal();

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${serverUrl}/api/category/list`);
            if (response.data.success) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!name) return;

        setLoading(true);
        try {
            const response = await axios.post(`${serverUrl}/api/category/add`, { name }, {
                headers: { token: localStorage.getItem('token') } // Assuming token is needed
            });

            if (response.data.success) {
                showAlert("Success", "Category added successfully", "success");
                setName("");
                fetchCategories();
            } else {
                showAlert("Error", response.data.message, "error");
            }
        } catch (error) {
            showAlert("Error", "Failed to add category", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            const response = await axios.post(`${serverUrl}/api/category/remove`, { id }, {
                headers: { token: localStorage.getItem('token') }
            });
            if (response.data.success) {
                showAlert("Removed", "Category removed successfully", "success");
                fetchCategories();
            } else {
                showAlert("Error", response.data.message, "error");
            }
        } catch (error) {
            showAlert("Error", "Failed to remove category", "error");
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Manage Categories</h1>
                <p className="text-[var(--text-muted)] text-sm">Add or remove product categories.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="flex flex-col gap-6">
                    <h3 className="text-lg font-bold">Add New Category</h3>
                    <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
                        <Input
                            label="Category Name"
                            placeholder="e.g. Summer Collection"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Button type="submit" disabled={loading} className="w-full h-12">
                            {loading ? "Adding..." : "Add Category"}
                        </Button>
                    </form>
                </Card>

                <Card className="flex flex-col gap-6">
                    <h3 className="text-lg font-bold">Existing Categories</h3>
                    <div className="flex flex-col gap-2">
                        {categories.length === 0 ? (
                            <p className="text-[var(--text-muted)] text-sm italic">No categories found.</p>
                        ) : (
                            categories.map((cat) => (
                                <div key={cat._id} className="flex items-center justify-between p-3 bg-[var(--background-subtle)] rounded-soft border border-[var(--border-base)]">
                                    <span className="font-medium">{cat.name}</span>
                                    <button
                                        onClick={() => handleDeleteCategory(cat._id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <HiOutlineTrash className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AddCategory;
