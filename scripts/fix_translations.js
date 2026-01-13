const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'translations.ts');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Lines are 1-indexed in the viewer, but 0-indexed in the array.
// We want to delete lines 481 to 1203 inclusive.
// Array indices: 480 to 1202.
const startLine = 481;
const endLine = 1203;

console.log(`Original line count: ${lines.length}`);
console.log(`Deleting lines ${startLine} to ${endLine}...`);

const before = lines.slice(0, startLine - 1);
const after = lines.slice(endLine);

const newContent = before.concat(after).join('\n');
fs.writeFileSync(filePath, newContent, 'utf8');

console.log(`New line count: ${newContent.split('\n').length}`);
console.log('Done!');
