import { X } from 'lucide-react';
import { Button, Input, Textarea } from '../../components/ui';

function ProductModal({ formData, setFormData, editingProduct, onSubmit, onClose }) {
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-md max-h-[90vh] overflow-auto bg-card rounded-lg border border-border shadow-xl animate-modal-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h3 className="text-base font-semibold">{editingProduct ? '編輯產品' : '新增產品'}</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X className="w-4 h-4" /></Button>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="px-6 py-5 flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">產品名稱 *</label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">描述</label>
                            <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">價格 (TWD)</label>
                                <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} min="0" step="1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">庫存數量</label>
                                <Input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} min="0" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
                        <Button type="button" variant="outline" onClick={onClose}>取消</Button>
                        <Button type="submit">{editingProduct ? '儲存變更' : '建立產品'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductModal;
