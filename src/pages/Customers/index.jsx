import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { Button } from '../../components/ui';
import LoadingSpinner from '../../components/LoadingSpinner';
import CustomerStatsCard from './CustomerStatsCard';
import CustomerTable from './CustomerTable';
import CustomerModal from './CustomerModal';

function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
    const toast = useToast();

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        try { setCustomers(await fetch('/api/customers').then(r => r.json())); }
        catch { toast.error('無法載入客戶資料'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
            const res = await fetch(url, { method: editingCustomer ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
            if (!res.ok) { const d = await res.json(); toast.error(d.error || '操作失敗'); return; }
            toast.success(editingCustomer ? '客戶資料已更新' : '客戶建立成功');
            fetchCustomers(); closeModal();
        } catch { toast.error('儲存客戶資料失敗'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('確定要刪除此客戶嗎？')) return;
        try {
            const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
            if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || '操作失敗'); return; }
            toast.success('客戶已刪除'); fetchCustomers();
        } catch { toast.error('刪除客戶失敗'); }
    };

    const openModal = (customer = null) => {
        setEditingCustomer(customer);
        setFormData(customer ? { name: customer.name, email: customer.email || '', phone: customer.phone || '', address: customer.address || '' } : { name: '', email: '', phone: '', address: '' });
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingCustomer(null); };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">客戶管理</h1>
                    <p className="text-muted-foreground mt-1">管理您的客戶資料</p>
                </div>
                <Button onClick={() => openModal()}><Plus className="h-4 w-4 mr-2" />新增客戶</Button>
            </div>
            <CustomerStatsCard total={customers.length} />
            <CustomerTable
                customers={customers}
                search={search}
                onSearchChange={setSearch}
                onEdit={openModal}
                onDelete={handleDelete}
                onCreateClick={() => openModal()}
            />
            {showModal && (
                <CustomerModal
                    formData={formData}
                    setFormData={setFormData}
                    editingCustomer={editingCustomer}
                    onSubmit={handleSubmit}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}

export default Customers;
