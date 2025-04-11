export const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    });
  };
  