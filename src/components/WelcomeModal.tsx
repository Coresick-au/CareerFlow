import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
    FileText,
    Briefcase,
    TrendingUp,
    DollarSign,
    Database,
    ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WELCOME_DISMISSED_KEY = 'careerflow_welcome_dismissed';

interface WelcomeModalProps {
    onLoadSampleData?: () => void;
    forceOpen?: boolean;
    onClose?: () => void;
}

/**
 * First-run welcome modal explaining CareerFlow's purpose.
 * Dismisses permanently when user chooses an action or checks "Don't show again".
 */
export function WelcomeModal({ onLoadSampleData, forceOpen, onClose }: WelcomeModalProps) {
    const [open, setOpen] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user has dismissed the welcome modal before
        const dismissed = localStorage.getItem(WELCOME_DISMISSED_KEY);
        if (!dismissed) {
            setOpen(true);
        }
    }, []);

    // Handle forceOpen from external trigger
    useEffect(() => {
        if (forceOpen) {
            setOpen(true);
        }
    }, [forceOpen]);

    const handleClose = () => {
        setOpen(false);
        onClose?.();
    };

    const handleDismiss = () => {
        if (dontShowAgain) {
            localStorage.setItem(WELCOME_DISMISSED_KEY, 'true');
        }
        handleClose();
    };

    const handleAction = (action: 'ato' | 'job' | 'sample' | 'explore') => {
        localStorage.setItem(WELCOME_DISMISSED_KEY, 'true');
        setOpen(false);

        switch (action) {
            case 'ato':
                navigate('/compensation'); // Will update to Career Ledger route
                break;
            case 'job':
                navigate('/career');
                break;
            case 'sample':
                onLoadSampleData?.();
                break;
            case 'explore':
                // Just close and let them explore
                break;
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        Welcome to CareerFlow
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        Track your career earnings, understand your real hourly rate, and identify
                        your "Loyalty Tax" – the income you may have missed by not negotiating or changing jobs.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {/* Australian Context */}
                    <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 mb-6">
                        <h3 className="font-semibold text-foreground mb-2">
                            🇦🇺 Built for Australians
                        </h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Financial year tracking (July - June)</li>
                            <li>• Super guarantee rates built-in (currently 11.5%)</li>
                            <li>• Works with your ATO payment summary data</li>
                            <li>• Take-home pay calculations after PAYG</li>
                        </ul>
                    </div>

                    {/* Quick Start Options */}
                    <h3 className="font-semibold text-foreground mb-3">
                        How would you like to start?
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Card
                            className="cursor-pointer hover:border-primary transition-colors"
                            onClick={() => handleAction('ato')}
                        >
                            <CardContent className="p-4 flex items-start gap-3">
                                <FileText className="h-8 w-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-foreground">Add my tax return</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Enter your yearly ATO summary data
                                    </p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer hover:border-primary transition-colors"
                            onClick={() => handleAction('job')}
                        >
                            <CardContent className="p-4 flex items-start gap-3">
                                <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-foreground">Add a new job</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Record your employment history
                                    </p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer hover:border-primary transition-colors"
                            onClick={() => handleAction('sample')}
                        >
                            <CardContent className="p-4 flex items-start gap-3">
                                <Database className="h-8 w-8 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-foreground">See example data</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Load sample career to explore features
                                    </p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer hover:border-primary transition-colors"
                            onClick={() => handleAction('explore')}
                        >
                            <CardContent className="p-4 flex items-start gap-3">
                                <DollarSign className="h-8 w-8 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-foreground">Just explore</h4>
                                    <p className="text-sm text-muted-foreground">
                                        I'll figure it out myself
                                    </p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            className="rounded border-border"
                        />
                        Don't show this again
                    </label>
                    <Button variant="outline" onClick={handleDismiss}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Hook to reset the welcome modal (useful for testing)
 */
export function resetWelcomeModal() {
    localStorage.removeItem(WELCOME_DISMISSED_KEY);
}
