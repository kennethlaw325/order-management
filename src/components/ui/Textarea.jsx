import { forwardRef } from 'react';
import { cn } from '../../utils';

export const Textarea = forwardRef(({ className, ...props }, ref) => {
    return (
        <textarea
            ref={ref}
            className={cn(
                'flex min-h-[80px] w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2 text-sm resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        />
    );
});
Textarea.displayName = 'Textarea';
