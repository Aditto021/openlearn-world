const fs = require('fs');
const path = require('path');
const fallback = require('../data/books-fallback.json');

const outDir = path.join(__dirname, '..', 'public', 'books');
fs.mkdirSync(outDir, { recursive: true });

function wrapLines(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) { lines.push(current.trim()); current = word; }
    else current = `${current} ${word}`.trim();
  }
  if (current) lines.push(current.trim());
  return lines;
}

function escapePdfText(text) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function makePlaceholderPdf(book) {
  const titleLines = wrapLines(book.title, 46);
  const bodyLines = wrapLines(book.description, 78);
  let y = 690;
  const ops = [];
  ops.push('BT /F2 10 Tf 72 750 Td (InclusiveCode Academy \\267 Free Learning Library) Tj ET');
  titleLines.forEach((line, i) => {
    ops.push(`BT /F1 22 Tf 72 ${640 + (titleLines.length - 1 - i) * 28} Td (${escapePdfText(line)}) Tj ET`);
  });
  y = 640 - titleLines.length * 28 - 10;
  ops.push(`BT /F2 13 Tf 72 ${y} Td (by ${escapePdfText(book.author)}) Tj ET`);
  y -= 40;
  bodyLines.forEach((line) => { ops.push(`BT /F2 11 Tf 72 ${y} Td (${escapePdfText(line)}) Tj ET`); y -= 18; });
  y -= 20;
  ops.push(`BT /F2 9 Tf 72 ${Math.max(y, 60)} Td (This is a placeholder file. Replace it in public/books/ with the real book once available.) Tj ET`);
  const streamContent = ops.join('\n');

  const objects = [];
  objects.push('<</Type/Catalog/Pages 2 0 R>>');
  objects.push('<</Type/Pages/Kids[3 0 R]/Count 1>>');
  objects.push('<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 4 0 R/F2 5 0 R>>>>/Contents 6 0 R>>');
  objects.push('<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold>>');
  objects.push('<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>');
  objects.push(`<</Length ${Buffer.byteLength(streamContent, 'utf8')}>>\nstream\n${streamContent}\nendstream`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefStart = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i += 1) pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

for (const book of fallback.books) {
  const filePath = path.join(outDir, `${book.slug}.pdf`);
  fs.writeFileSync(filePath, makePlaceholderPdf(book));
  process.stdout.write(`Generated ${filePath}\n`);
}
