export const formatCurrency = (value: number, currency: string) => {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  let locale = 'en-US';

  // Special handling for Indonesian Rupiah for better formatting
  if (currency === 'IDR') {
    locale = 'id-ID';
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 0;
  }

  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch (error) {
    console.warn(`Could not format currency for ${currency} with locale ${locale}. Falling back to USD.`, error);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
};