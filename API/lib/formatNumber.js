const formatNumber = (num) => {
  return Number(num || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

module.exports = {
  formatNumber
}