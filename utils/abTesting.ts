
export const getVariant = (testId: string, variants: string[]): string => {
  // Check if running in browser
  if (typeof window === 'undefined') return variants[0];

  const storageKey = `ab-test-${testId}`;
  let variant = sessionStorage.getItem(storageKey);

  if (!variant) {
    const randomIndex = Math.floor(Math.random() * variants.length);
    variant = variants[randomIndex];
    sessionStorage.setItem(storageKey, variant);
  }

  return variant;
};
