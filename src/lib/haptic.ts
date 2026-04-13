/** Trigger vibration if the device supports it (silently no-ops otherwise) */
export function haptic(pattern: number | number[] = 20) {
   if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
   }
}

export const HAPTIC = {
   tap:    () => haptic(15),
   done:   () => haptic(20),
   delete: () => haptic([20, 60, 20]),
   add:    () => haptic(30),
   error:  () => haptic([50, 30, 50]),
} as const;
