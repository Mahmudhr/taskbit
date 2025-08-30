import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

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
  hideClose?: boolean;
  overlayClassName?: string;
  contentClassName?: string;
}

export default function AlertModal({
  isOpen,
  setIsOpen,
  children,
  description,
  title,
  reset,
  hideClose,
  overlayClassName,
  contentClassName,
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
      <AlertDialogContent
        overlayClassName={overlayClassName}
        className={contentClassName}
      >
        <AlertDialogHeader>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
            }}
          >
            <AlertDialogTitle>{title}</AlertDialogTitle>
            {!hideClose && (
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
            )}
          </div>
          <AlertDialogDescription>{description}</AlertDialogDescription>
          <div className='max-h-[80vh] overflow-y-auto px-1'>{children}</div>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
