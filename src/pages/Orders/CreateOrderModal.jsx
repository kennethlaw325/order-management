import { X } from 'lucide-react';
import { useFormatCurrency } from '../../utils';
import { Button, Input, Select, Textarea } from '../../components/ui';

function CreateOrderModal({ formData, setFormData, customers, products, onSubmit, onClose, onAddItem, onRemoveItem, onUpdateItem }) {
    const formatCurrency = useFormatCurrency();
    const total = formData.items.reduce((s, i) => {
        const p = products.find(x => x.id === parseInt(i.product_id));
        return s + (p ? p.price * i.quantity : 0);
    }, 0);

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-xl max-h-[90vh] overflow-auto bg-card rounded-lg border border-border shadow-xl animate-modal-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h3 className="text-base font-semibold">新增訂單</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X className="w-4 h-4" /></Button>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="px-6 py-5 flex flex-col gap-5">
                        <div>
                            <label className="block text-sm font-medium mb-1">客戶</label>
                            <Select value={formData.customer_id} onChange={e => setFormData({ ...formData, customer_id: e.target.value })}>
                                <option value="">選擇客戶（可選）</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">訂單項目 *</label>
                            <div className="flex flex-col gap-3">
                                {formData.items.map((item, i) => (
                                    <div key={i} className="grid gap-3" style={{ gridTemplateColumns: '1fr 80px 80px 36px' }}>
                                        <Select value={item.product_id} onChange={e => onUpdateItem(i, 'product_id', e.target.value)} required>
                                            <option value="">選擇產品</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>)}
                                        </Select>
                                        <Input type="number" className="text-center" value={item.quantity} onChange={e => onUpdateItem(i, 'quantity', e.target.value)} min="1" />
                                        <div className="flex items-center text-xs font-medium text-muted-foreground">
                                            {(() => { const p = item.product_id && products.find(x => x.id === parseInt(item.product_id)); return p ? formatCurrency(p.price * item.quantity) : '—'; })()}
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveItem(i)} disabled={formData.items.length === 1} className="h-10 w-9"><X className="w-4 h-4" /></Button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={onAddItem} className="mt-3 text-xs font-medium text-primary hover:text-primary/80 bg-transparent border-none cursor-pointer">+ 新增項目</button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">備註</label>
                            <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 rounded-[var(--radius)] bg-muted">
                            <span className="text-sm font-medium">訂單總計</span>
                            <span className="text-lg font-bold text-primary">{formatCurrency(total)}</span>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
                        <Button type="button" variant="outline" onClick={onClose}>取消</Button>
                        <Button type="submit">建立訂單</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateOrderModal;
