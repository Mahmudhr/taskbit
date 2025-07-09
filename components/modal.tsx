import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

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

export default function Modal({
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className='sm:max-w-xl pt-7 px-4 z-[100]'
        aria-describedby={undefined}
      >
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
