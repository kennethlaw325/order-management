// src/pages/Dashboard/StockAlertCard.jsx
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui';

function StockAlertCard({ lowStock }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">庫存警示</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {lowStock > 0 ? (
                    <>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{lowStock} 項產品庫存偏低</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">庫存低於 10 件</p>
                            </div>
                        </div>
                        <Link to="/products" className="text-sm text-primary hover:underline block text-center">查看全部產品 →</Link>
                    </>
                ) : (
                    <div className="flex flex-col items-center py-6 text-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-2">
                            <span className="text-emerald-500 text-lg">✓</span>
                        </div>
                        <p className="text-sm text-muted-foreground">所有產品庫存充足</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default StockAlertCard;
