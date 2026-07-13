const fs = require('fs');

// Filter sales to only 2024

const content = fs.readFileSync('src/data.ts', 'utf8');

// Find the sales array
const salesMarker = 'export const initialSales: Sale[] = [';
const idx = content.indexOf(salesMarker);
const beforeSection = content.substring(0, idx);
const afterOpenBracket = idx + salesMarker.length;

// Find matching closing bracket
let depth = 0;
let endIdx = afterOpenBracket;

for (let i = afterOpenBracket; i < content.length; i++) {
  if (content[i] === '[') {
    depth++;
  } else if (content[i] === ']') {
    depth--;
    if (depth === 0) {
      endIdx = i;
      break;
    }
  }
}

const afterSection = content.substring(endIdx);

// Extract raw sales
let rawSales = content.substring(afterOpenBracket, endIdx);

// Clean up trailing commas before ] or }
while (rawSales.includes(',]') || rawSales.includes(',}')) {
  rawSales = rawSales.replace(/,\s*([}\]])/g, '$1');
}

// Parse and filter
sales = JSON.parse(rawSales);
console.log('Total sales before filter:', sales.length);

sales = sales.filter(sale => sale.date && sale.date.startsWith('2024-'));
console.log('Total sales after filter (2024 only):', sales.length);

// Recreate file content
const formattedJson = JSON.stringify(sales, null, 2);
const newContent = beforeSection + salesMarker + formattedJson + afterSection;

fs.writeFileSync('src/data.ts', newContent);
console.log('Filtered data.ts saved successfully');