import { AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui';

function StockAlertCard({ lowStock }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    庫存警示
                </CardTitle>
            </CardHeader>
            <CardContent>
                {lowStock > 0 ? (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <div>
                            <div className="text-sm font-semibold">{lowStock} 件商品庫存不足</div>
                            <div className="text-xs text-muted-foreground">庫存低於 10 件</div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 text-sm text-muted-foreground">所有商品庫存充足</div>
                )}
            </CardContent>
        </Card>
    );
}

export default StockAlertCard;
