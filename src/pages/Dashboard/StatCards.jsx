// src/pages/Dashboard/StatCards.jsx
import { useEffect, useRef } from 'react';
import { Package, DollarSign, Users, Tag, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui';

function useCountUp(target, duration = 800) {
    const ref = useRef(null);
    useEffect(() => {
        if (target === null || target === undefined) return;
        const numericTarget = parseFloat(String(target).replace(/[^0-9.]/g, ''));
        if (isNaN(numericTarget)) {
            if (ref.current) ref.current.textContent = target;
            return;
        }
        const start = performance.now();
        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
        const isFormatted = String(target).includes(',') || String(target).startsWith('NT');

        const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const value = numericTarget * easeOutCubic(progress);
            if (ref.current) {
                ref.current.textContent = isFormatted
                    ? `NT$${Math.round(value).toLocaleString()}`
                    : Math.round(value).toString();
            }
            if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }, [target, duration]);
    return ref;
}

function TrendBadge({ trend }) {
    if (trend === null || trend === undefined) return <span className="text-xs text-muted-foreground">—</span>;
    const value = parseFloat(trend);
    const positive = value >= 0;
    const Icon = positive ? ArrowUpRight : ArrowDownRight;
    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            <Icon className="h-3 w-3" />
            {Math.abs(value)}% 較上週
        </span>
    );
}

function StatCard({ label, value, icon: Icon, trend, iconBg = 'bg-indigo-50 dark:bg-indigo-950/50', iconColor = 'text-indigo-600 dark:text-indigo-400' }) {
    const countRef = useCountUp(value);
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold" ref={countRef}>{value}</div>
                <div className="mt-1">
                    <TrendBadge trend={trend} />
                </div>
            </CardContent>
        </Card>
    );
}

function StatCards({ stats }) {
    const trends = stats?.trends || {};
    const cards = [
        { label: '總訂單數', value: stats?.orders?.total || 0, icon: Package, trend: trends.orders },
        { label: '總收入（已完成）', value: `NT$${(stats?.revenue || 0).toLocaleString()}`, icon: DollarSign, trend: trends.revenue },
        { label: '客戶數', value: stats?.customers || 0, icon: Users, trend: trends.customers },
        { label: '產品數', value: stats?.products?.total || 0, icon: Tag, trend: null },
    ];
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(card => <StatCard key={card.label} {...card} />)}
        </div>
    );
}

export default StatCards;
