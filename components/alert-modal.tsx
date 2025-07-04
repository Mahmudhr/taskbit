import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Button } from './ui/button';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  buttonTitle?: string;
  onSubmit?: () => void;
  handleSubmit?: (e: React.FormEvent) => void;
  submitHandler?: () => void;
  children: React.ReactNode;
  description: string;
  title: string;
  reset?: () => void;
}

export default function AlertModal({
  isOpen,
  setIsOpen,
  children,
  description,
  title,
  reset,
}: ModalProps) {
  const onOpenChange = () => {
    setIsOpen(false);
    if (reset) reset();
  };
  const handleClose = () => {
    setIsOpen(false);
    if (reset) reset();
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
            }}
          >
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <button
              onClick={handleClose}
              aria-label='Close'
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                lineHeight: 1,
                padding: 0,
                marginLeft: '1rem',
              }}
            >
              ×
            </button>
          </div>
          <AlertDialogDescription>{description}</AlertDialogDescription>
          <div>{children}</div>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
