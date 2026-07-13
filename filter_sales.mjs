import fs from 'fs';

const content = fs.readFileSync('src/data.ts', 'utf8');

const salesMarker = 'export const initialSales: Sale[] = [';
const idx = content.indexOf(salesMarker);
const beforeSection = content.substring(0, idx);
const afterOpenBracket = idx + salesMarker.length;

let depth = 1;
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
let rawSales = content.substring(afterOpenBracket, endIdx);

while (rawSales.includes(',]') || rawSales.includes(',}')) {
  rawSales = rawSales.replace(/,\s*([}\]])/g, '$1');
}

const sales = JSON.parse('[' + rawSales + ']');
console.log('Total sales before filter:', sales.length);

const filtered = sales.filter(sale => sale.date && sale.date.startsWith('2024-'));
console.log('Total sales after filter (2024 only):', filtered.length);

const formattedJson = JSON.stringify(filtered, null, 2);
const newContent = beforeSection + salesMarker + formattedJson.slice(1, -1) + afterSection;

fs.writeFileSync('src/data.ts', newContent);
console.log('Filtered data.ts saved successfully');
