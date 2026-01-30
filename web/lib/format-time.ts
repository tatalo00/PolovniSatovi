/**
 * Shared Serbian-locale relative time formatters.
 *
 * formatTimeAgo  – longer form, used in messages / reviews
 *   "upravo sada", "pre 5 minuta", "pre 3 sati", "pre 2 dana"
 *
 * formatRelativeTime – shorter form, used in listing cards
 *   "pre nekoliko sekundi", "pre 5 min", "pre 3 h", "pre 2 dana", "pre 1 nedelje"
 */

export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "upravo sada";
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `pre ${minutes} ${minutes === 1 ? "minuta" : "minuta"}`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `pre ${hours} ${hours === 1 ? "sata" : "sati"}`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  if (days < 7) return `pre ${days} ${days === 1 ? "dana" : "dana"}`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `pre ${weeks} nedelje`;
  const months = Math.round(days / 30);
  if (months < 12) return `pre ${months} meseci`;
  const years = Math.round(days / 365);
  return `pre ${years} god.`;
}

export function formatRelativeTime(date: Date | string): string {
  const past = new Date(date);
  const diff = Date.now() - past.getTime();
  const minutes = Math.round(diff / 60000);

  if (minutes < 1) return "pre nekoliko sekundi";
  if (minutes < 60) return `pre ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `pre ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `pre ${days} dana`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `pre ${weeks} nedelje`;
  const months = Math.round(days / 30);
  if (months < 12) return `pre ${months} meseci`;
  const years = Math.round(days / 365);
  return `pre ${years} god.`;
}
