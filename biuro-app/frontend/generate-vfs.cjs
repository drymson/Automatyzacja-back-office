const fs = require('fs');
const path = require('path');
const fontkit = require('@pdf-lib/fontkit');
const { PDFDocument } = require('pdf-lib');

const fonts = {
  'Roboto-Regular': 'src/assets/fonts/Roboto-Regular.ttf',
  'Roboto-Medium': 'src/assets/fonts/Roboto-Medium.ttf',
  'Roboto-Italic': 'src/assets/fonts/Roboto-Italic.ttf',
  'Roboto-MediumItalic': 'src/assets/fonts/Roboto-MediumItalic.ttf'
};

const out = {};
for (const [name, filePath] of Object.entries(fonts)) {
  const absPath = path.resolve(__dirname, filePath);
  const data = fs.readFileSync(absPath);
  out[name] = data.toString('base64');
}

const jsContent = `pdfMake.vfs = ${JSON.stringify(out, null, 2)};`;

fs.writeFileSync('src/assets/fonts/custom-vfs.js', jsContent);
console.log('custom-vfs.js generated successfully');
