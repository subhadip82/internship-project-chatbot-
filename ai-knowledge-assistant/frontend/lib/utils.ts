export function cn(...inputs: Array<string | undefined | false | null>) {
  return inputs.filter(Boolean).join(' ');
}

export function formatRelativeTime(value: string | Date | undefined) {
  if (!value) return 'just now';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}
