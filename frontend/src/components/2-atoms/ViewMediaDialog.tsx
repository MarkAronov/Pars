import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ZINDEX } from '../1-ions';

interface ViewMediaDialogProps {
	src: string;
	alt?: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const ViewMediaDialog = ({
	src,
	alt = '',
	open,
	onOpenChange,
}: ViewMediaDialogProps) => (
	<Dialog.Root open={open} onOpenChange={onOpenChange}>
		<Dialog.Portal>
			<Dialog.Overlay
				className={cn(
					'fixed inset-0 bg-black/80 backdrop-blur-sm',
					ZINDEX.dialog,
				)}
			/>
			<Dialog.Content
				className={cn(
					'fixed inset-0 flex items-center justify-center p-4',
					ZINDEX.dialog,
				)}
				aria-describedby={undefined}
			>
				<Dialog.Title className="sr-only">Media viewer</Dialog.Title>
				<Dialog.Close asChild>
					<button
						type="button"
						aria-label="Close"
						className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</Dialog.Close>
				<img
					src={src}
					alt={alt}
					className="max-w-full max-h-full rounded-lg object-contain shadow-2xl"
				/>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
);

export default ViewMediaDialog;
