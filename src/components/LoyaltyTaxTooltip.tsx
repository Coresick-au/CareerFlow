import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { Button } from './ui/button';

/**
 * An info tooltip/popover explaining what "Loyalty Tax" means.
 * Uses Australian context and market data.
 */
export function LoyaltyTaxTooltip() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 rounded-full hover:bg-accent transition-colors"
                aria-label="What is Loyalty Tax?"
            >
                <Info className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <div
                        className="fixed inset-0 z-40 bg-black/20 lg:hidden"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Popover */}
                    <div className="absolute z-50 w-80 p-4 mt-2 -left-32 lg:left-0 bg-card border border-border rounded-lg shadow-lg">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-foreground">
                                What is Loyalty Tax?
                            </h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-3 text-sm text-muted-foreground">
                            <p>
                                <strong className="text-foreground">Loyalty Tax</strong> represents the
                                potential income you've missed by staying at one employer instead of
                                negotiating or changing jobs.
                            </p>

                            <div className="bg-orange-500/10 dark:bg-orange-500/20 rounded-md p-3 border border-orange-500/20">
                                <p className="text-orange-700 dark:text-orange-300">
                                    <strong>Australian market data:</strong>
                                </p>
                                <ul className="mt-1 space-y-1 text-orange-600 dark:text-orange-400">
                                    <li>• Job changers: <strong>10-20%</strong> salary increase</li>
                                    <li>• Internal raises: <strong>2-3%</strong> on average</li>
                                    <li>• Gap widens with tenure</li>
                                </ul>
                            </div>

                            <p>
                                This isn't about encouraging job hopping – it's about understanding
                                your market value and negotiating fairly.
                            </p>

                            <div className="pt-2 border-t border-border">
                                <p className="text-xs">
                                    <strong>How it's calculated:</strong> We compare your salary progression
                                    against industry benchmarks, adjusting for your role level and years of experience.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
