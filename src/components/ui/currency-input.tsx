import { forwardRef, useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

export interface CurrencyInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value?: number;
    onChange?: (value: number) => void;
    showCents?: boolean;
    min?: number;
    max?: number;
    error?: string;
}

/**
 * A currency input with AUD $ prefix, live formatting, and validation.
 * Displays formatted value but stores raw number.
 */
const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({
        className,
        value,
        onChange,
        showCents = false,
        min = 0,
        max = 10000000, // $10 million max by default
        error,
        disabled,
        ...props
    }, ref) => {
        const [displayValue, setDisplayValue] = useState('');
        const [isFocused, setIsFocused] = useState(false);

        // Format number for display
        const formatForDisplay = (num: number | undefined): string => {
            if (num === undefined || isNaN(num)) return '';

            if (showCents) {
                return num.toLocaleString('en-AU', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
            }
            return num.toLocaleString('en-AU', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            });
        };

        // Parse string to number
        const parseValue = (str: string): number => {
            // Remove all non-numeric characters except decimal point
            const cleaned = str.replace(/[^0-9.]/g, '');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? 0 : parsed;
        };

        // Update display when value prop changes (and not focused)
        useEffect(() => {
            if (!isFocused && value !== undefined) {
                setDisplayValue(formatForDisplay(value));
            }
        }, [value, isFocused, showCents]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const rawValue = e.target.value;
            setDisplayValue(rawValue);

            const numericValue = parseValue(rawValue);
            onChange?.(numericValue);
        };

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            // Show raw number when focused for easier editing
            if (value !== undefined) {
                setDisplayValue(showCents ? value.toFixed(2) : value.toString());
            }
            props.onFocus?.(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);

            // Parse and validate
            const numericValue = parseValue(displayValue);
            const clampedValue = Math.min(Math.max(numericValue, min), max);

            // Update display to formatted value
            setDisplayValue(formatForDisplay(clampedValue));

            // Notify parent of final value
            if (numericValue !== clampedValue) {
                onChange?.(clampedValue);
            }

            props.onBlur?.(e);
        };

        // Validation
        const numericValue = parseValue(displayValue);
        const isInvalid = error || numericValue < min || numericValue > max;
        const validationMessage = error || (
            numericValue < min ? `Minimum value is $${min.toLocaleString()}` :
                numericValue > max ? `Maximum value is $${max.toLocaleString()}` :
                    null
        );

        return (
            <div className="relative">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                        $
                    </span>
                    <input
                        type="text"
                        inputMode="decimal"
                        ref={ref}
                        value={displayValue}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        disabled={disabled}
                        className={cn(
                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                            "placeholder:text-muted-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            "pl-7", // Make room for $ prefix
                            isInvalid && "border-destructive focus-visible:ring-destructive",
                            className
                        )}
                        {...props}
                    />
                </div>
                {validationMessage && (
                    <p className="mt-1 text-xs text-destructive">
                        {validationMessage}
                    </p>
                )}
            </div>
        );
    }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
