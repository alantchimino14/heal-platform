import { cn } from '@/lib/utils';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

const colorPairs = [
  { bg: 'bg-heal-100', text: 'text-heal-600' },
  { bg: 'bg-sage-100', text: 'text-sage-600' },
  { bg: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { bg: 'bg-amber-100', text: 'text-amber-600' },
  { bg: 'bg-purple-100', text: 'text-purple-600' },
  { bg: 'bg-rose-100', text: 'text-rose-600' },
  { bg: 'bg-cyan-100', text: 'text-cyan-600' },
];

function getColorFromName(name: string) {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colorPairs[hash % colorPairs.length];
}

export function Avatar({ firstName = '', lastName = '', size = 'md', className }: AvatarProps) {
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '?';
  const color = getColorFromName(`${firstName}${lastName}`);

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold',
        sizeClasses[size],
        color.bg,
        color.text,
        className
      )}
    >
      {initials}
    </div>
  );
}

export function AvatarGroup({
  users,
  max = 4,
  size = 'sm',
}: {
  users: Array<{ firstName: string; lastName: string }>;
  max?: number;
  size?: 'sm' | 'md';
}) {
  const displayed = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex -space-x-2">
      {displayed.map((user, i) => (
        <Avatar
          key={i}
          firstName={user.firstName}
          lastName={user.lastName}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-medium ring-2 ring-white',
            'bg-heal-200 text-heal-700',
            size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
