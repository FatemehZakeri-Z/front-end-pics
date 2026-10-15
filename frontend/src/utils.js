export const ORDER_STATUS_LABELS = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأیید شده',
  preparing: 'در حال آماده‌سازی',
  delivering: 'در حال ارسال',
  delivered: 'تحویل شده',
  cancelled: 'لغو شده',
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS);

export const PAYMENT_LABELS = {
  cash: 'پرداخت در محل',
  online: 'پرداخت آنلاین',
};

const faNumber = new Intl.NumberFormat('fa-IR');

export function formatPrice(value) {
  return `${faNumber.format(Number(value) || 0)} تومان`;
}

export function formatNumber(value) {
  return faNumber.format(Number(value) || 0);
}

export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
