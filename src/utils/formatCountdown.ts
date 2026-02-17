/**
 * Utility functions for payment countdown timer
 */

export interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
}

/**
 * Calculate remaining time until expiration
 * @param expiresAt ISO timestamp string
 * @returns Countdown time object
 */
export function calculateCountdown(expiresAt: string | null): CountdownTime {
  if (!expiresAt) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isExpired: true,
    };
  }

  const now = new Date().getTime();
  const expiration = new Date(expiresAt).getTime();
  const diff = expiration - now;

  if (diff <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isExpired: true,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    totalSeconds,
    isExpired: false,
  };
}

/**
 * Format countdown time as HH:MM:SS
 * @param countdown CountdownTime object
 * @returns Formatted string like "00:59:45"
 */
export function formatCountdownTime(countdown: CountdownTime): string {
  if (countdown.isExpired) {
    return "00:00:00";
  }

  const pad = (num: number) => String(num).padStart(2, '0');
  
  return `${pad(countdown.hours)}:${pad(countdown.minutes)}:${pad(countdown.seconds)}`;
}

/**
 * Get warning level based on remaining time
 * @param totalSeconds Total seconds remaining
 * @returns Warning level: 'safe' | 'warning' | 'danger'
 */
export function getWarningLevel(totalSeconds: number): 'safe' | 'warning' | 'danger' {
  const minutes = totalSeconds / 60;
  
  if (minutes > 30) return 'safe';      // Green: More than 30min
  if (minutes > 10) return 'warning';   // Yellow: 10-30min
  return 'danger';                      // Red: Less than 10min
}

/**
 * Get human-readable time remaining message
 * @param countdown CountdownTime object
 * @returns Message like "59 minutos restantes"
 */
export function getTimeRemainingMessage(countdown: CountdownTime): string {
  if (countdown.isExpired) {
    return "Tiempo agotado";
  }

  const { hours, minutes } = countdown;

  if (hours > 0) {
    return `${hours}h ${minutes}m restantes`;
  }

  if (minutes > 1) {
    return `${minutes} minutos restantes`;
  }

  return "Menos de 1 minuto restante";
}
