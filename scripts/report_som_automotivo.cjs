const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '..', 'src', 'data.json');
const raw = fs.readFileSync(dataPath, 'utf-8');
const data = JSON.parse(raw);

const products = data.products.filter(p => p.category && p.category.toLowerCase().includes('som automotivo'));
const sales = data.sales;

const results = products.map(p => {
  // Find sales items that match this product name
  const matchingSales = sales.filter(s =>
    s.items.some(item => item.productName === p.name)
  );
  let totalRev = 0;
  let totalCost = 0;
  matchingSales.forEach(s => {
    s.items.forEach(item => {
      if (item.productName === p.name) {
        totalRev += item.total || 0;
        totalCost += (item.costPrice || 0) * (item.quantity || 0);
      }
    });
  });
  const profit = totalRev - totalCost;
  return {
    name: p.name,
    category: p.category,
    salePrice: p.salePrice,
    costPrice: p.costPrice,
    totalRevenue: parseFloat(totalRev.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    profit: parseFloat(profit.toFixed(2))
  };
});

console.log(JSON.stringify(results, null, 2));
