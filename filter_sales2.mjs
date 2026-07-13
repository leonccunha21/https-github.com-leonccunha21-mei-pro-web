import fs from 'fs';

const content = fs.readFileSync('src/data.ts', 'utf8');
const marker = 'export const initialSales: Sale[] = [';
const idx = content.indexOf(marker);
const before = content.substring(0, idx);
const openBracket = idx + marker.length; // position of the '['

// Walk from the '[' ; depth starts at 1 because we are inside the array.
let depth = 1;
let endIdx = openBracket;
for (let i = openBracket + 1; i < content.length; i++) {
  const ch = content[i];
  if (ch === '[') depth++;
  else if (ch === ']') {
    depth--;
    if (depth === 0) { endIdx = i; break; }
  }
}
const after = content.substring(endIdx); // includes the closing ']' and ';'
const arrayBody = content.substring(openBracket + 1, endIdx); // content between outer [ ]

// Split arrayBody into top-level sale object strings by tracking brace depth.
const objects = [];
let cur = '';
let bDepth = 0;
let inStr = false;
let strChar = '';
for (let i = 0; i < arrayBody.length; i++) {
  const ch = arrayBody[i];
  if (inStr) {
    cur += ch;
    if (ch === strChar && arrayBody[i - 1] !== '\\') inStr = false;
    continue;
  }
  if (ch === '"' || ch === "'") { inStr = true; strChar = ch; cur += ch; continue; }
  if (ch === '{') { bDepth++; cur += ch; continue; }
  if (ch === '}') {
    bDepth--;
    cur += ch;
    if (bDepth === 0) {
      objects.push(cur);
      cur = '';
    }
    continue;
  }
  if (bDepth > 0) { cur += ch; }
  else if (ch === ',') { /* separator between top-level objects */ }
}

console.log('Top-level sale objects found:', objects.length);

const kept = objects.filter(obj => {
  const m = obj.match(/date:\s*'([^']+)'/);
  if (!m) return true; // keep if no date
  return m[1].startsWith('2024-');
});
const removed = objects.length - kept.length;
console.log('Kept (2024):', kept.length, 'Removed (2025/2026):', removed);

const newBody = kept.join(',\n');
const newContent = before + marker + '\n' + newBody + '\n' + after;
fs.writeFileSync('src/data.ts', newContent);
console.log('data.ts updated.');
