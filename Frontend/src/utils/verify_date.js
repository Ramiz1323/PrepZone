const getLocalDateString = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const now = new Date();
console.log('Current Local Time:', now.toString());
console.log('UTC String:', now.toISOString());
console.log('getLocalDateString Result:', getLocalDateString(now));

if (getLocalDateString(now) === now.toISOString().split('T')[0]) {
    console.log('WARNING: Local date matches UTC date. This is normal if it is not late night/early morning.');
} else {
    console.log('SUCCESS: Local date differs from UTC date! The fix is working.');
}
