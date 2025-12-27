import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmPhrase: string; // The phrase user must type to confirm
    onConfirm: () => void;
    confirmButtonText?: string;
    isLoading?: boolean;
}

/**
 * A confirmation dialog that requires typing a specific phrase to confirm.
 * Used for destructive actions like "Clear All Data".
 */
export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmPhrase,
    onConfirm,
    confirmButtonText = 'Confirm',
    isLoading = false,
}: ConfirmationDialogProps) {
    const [inputValue, setInputValue] = useState('');

    const isConfirmEnabled = inputValue.toLowerCase() === confirmPhrase.toLowerCase();

    const handleConfirm = () => {
        if (isConfirmEnabled) {
            onConfirm();
            setInputValue('');
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setInputValue(''); // Reset on close
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                        <p className="text-sm text-destructive dark:text-red-400">
                            <strong>Warning:</strong> This action cannot be undone.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-input" className="text-foreground">
                            Type <span className="font-mono font-bold text-destructive">{confirmPhrase}</span> to confirm:
                        </Label>
                        <Input
                            id="confirm-input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={confirmPhrase}
                            className="font-mono"
                            autoComplete="off"
                            autoFocus
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={!isConfirmEnabled || isLoading}
                    >
                        {isLoading ? 'Processing...' : confirmButtonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
