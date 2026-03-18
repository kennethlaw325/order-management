import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { Button } from '../../components/ui';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProductStatsCards from './ProductStatsCards';
import ProductTable from './ProductTable';
import ProductModal from './ProductModal';

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '' });
    const toast = useToast();

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try { setProducts(await fetch('/api/products').then(r => r.json())); }
        catch { toast.error('無法載入產品資料'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
            const res = await fetch(url, { method: editingProduct ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, price: parseFloat(formData.price) || 0, stock: parseInt(formData.stock) || 0 }) });
            if (!res.ok) { const d = await res.json(); toast.error(d.error || '操作失敗'); return; }
            toast.success(editingProduct ? '產品資料已更新' : '產品建立成功');
            fetchProducts(); closeModal();
        } catch { toast.error('儲存產品資料失敗'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('確定要刪除此產品嗎？')) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || '操作失敗'); return; }
            toast.success('產品已刪除'); fetchProducts();
        } catch { toast.error('刪除產品失敗'); }
    };

    const openModal = (product = null) => {
        setEditingProduct(product);
        setFormData(product ? { name: product.name, description: product.description || '', price: String(product.price), stock: String(product.stock) } : { name: '', description: '', price: '', stock: '' });
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingProduct(null); };

    if (loading) return <LoadingSpinner />;

    const lowStockCount = products.filter(p => p.stock < 10).length;

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={() => openModal()}><Plus className="h-4 w-4 mr-2" />新增產品</Button>
            </div>
            <ProductStatsCards total={products.length} lowStockCount={lowStockCount} />
            <ProductTable
                products={products}
                search={search}
                onSearchChange={setSearch}
                onEdit={openModal}
                onDelete={handleDelete}
                onCreateClick={() => openModal()}
            />
            {showModal && (
                <ProductModal
                    formData={formData}
                    setFormData={setFormData}
                    editingProduct={editingProduct}
                    onSubmit={handleSubmit}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}

export default Products;
