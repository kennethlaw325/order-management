import { Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui';

function CustomerStatsCard({ total }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">總客戶數</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{total}</div>
                </CardContent>
            </Card>
        </div>
    );
}

export default CustomerStatsCard;
