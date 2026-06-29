import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Flag, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BORDERS, COLORS, TYPOGRAPHY, ZINDEX } from '../1-ions';

interface PostOptionsMenuProps {
	isOwn: boolean;
	onEdit?: () => void;
	onDelete?: () => void;
}

const itemClass = cn(
	'flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer outline-none transition-colors select-none',
	TYPOGRAPHY.TEXT.sm,
	'data-[highlighted]:bg-neutral-800',
);

const PostOptionsMenu = ({ isOwn, onEdit, onDelete }: PostOptionsMenuProps) => (
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild>
			<button
				type="button"
				aria-label="Post options"
				className={cn(
					'p-1.5 rounded-md transition-colors',
					COLORS.textMuted,
					'hover:text-white hover:bg-neutral-800',
				)}
			>
				<MoreHorizontal className="w-4 h-4" />
			</button>
		</DropdownMenu.Trigger>

		<DropdownMenu.Portal>
			<DropdownMenu.Content
				align="end"
				sideOffset={4}
				className={cn(
					'w-40 rounded-md border py-1 shadow-xl',
					COLORS.surface,
					COLORS.border,
					BORDERS.RADIUS.md,
					ZINDEX.dialog,
					'animate-in fade-in-0 zoom-in-95',
				)}
			>
				{isOwn ? (
					<>
						<DropdownMenu.Item
							className={cn(itemClass, COLORS.textSecondary)}
							onSelect={onEdit}
						>
							<Pencil className="w-3.5 h-3.5" />
							Edit
						</DropdownMenu.Item>
						<DropdownMenu.Item
							className={cn(
								itemClass,
								COLORS.danger,
								'data-[highlighted]:bg-neutral-800',
							)}
							onSelect={onDelete}
						>
							<Trash2 className="w-3.5 h-3.5" />
							Delete
						</DropdownMenu.Item>
					</>
				) : (
					<DropdownMenu.Item className={cn(itemClass, COLORS.textSecondary)}>
						<Flag className="w-3.5 h-3.5" />
						Report
					</DropdownMenu.Item>
				)}
			</DropdownMenu.Content>
		</DropdownMenu.Portal>
	</DropdownMenu.Root>
);

export default PostOptionsMenu;
