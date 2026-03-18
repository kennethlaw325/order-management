import { Package, DollarSign, Users, Tag, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui';

function StatCards({ stats }) {
    const cards = [
        { label: '總訂單數', value: stats?.orders?.total || 0, icon: Package, trend: '+12.5%', positive: true },
        { label: '總收入（已完成）', value: formatCurrency(stats?.revenue || 0), icon: DollarSign, trend: '+8.2%', positive: true },
        { label: '客戶數', value: stats?.customers || 0, icon: Users, trend: '+5.1%', positive: true },
        { label: '產品數', value: stats?.products?.total || 0, icon: Tag, trend: '-2.1%', positive: false },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(({ label, value, icon: Icon, trend, positive }) => (
                <Card key={label}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{label}</CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{value}</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            {positive
                                ? <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                                : <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                            }
                            <span className={positive ? 'text-green-500' : 'text-red-500'}>{trend}</span>
                            <span className="ml-1">較上週</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default StatCards;
