const formatPrice = (price, currency = 'INR') => {
  if (!price && price !== 0) return 'Price not listed'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}

export default formatPrice