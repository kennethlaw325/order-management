import { Card, CardContent, Button } from '../../components/ui';

const FILTERS = [
    { value: '', label: '全部' },
    { value: 'pending', label: '待處理' },
    { value: 'processing', label: '處理中' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
];

function OrderFilters({ statusFilter, onFilterChange }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex gap-2">
                    {FILTERS.map(f => (
                        <Button
                            key={f.value}
                            variant={statusFilter === f.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFilterChange(f.value)}
                        >
                            {f.label}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default OrderFilters;
