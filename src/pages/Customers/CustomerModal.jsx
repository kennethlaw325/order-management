import { X } from 'lucide-react';
import { Button, Input, Textarea } from '../../components/ui';

function CustomerModal({ formData, setFormData, editingCustomer, onSubmit, onClose }) {
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-md max-h-[90vh] overflow-auto bg-card rounded-lg border border-border shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h3 className="text-base font-semibold">{editingCustomer ? '編輯客戶' : '新增客戶'}</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X className="w-4 h-4" /></Button>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="px-6 py-5 flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">客戶名稱 *</label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">電話</label>
                            <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">地址</label>
                            <Textarea className="min-h-[70px]" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
                        <Button type="button" variant="outline" onClick={onClose}>取消</Button>
                        <Button type="submit">{editingCustomer ? '儲存變更' : '建立客戶'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CustomerModal;
