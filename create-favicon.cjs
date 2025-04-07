const fs = require('fs');
const svg2img = require('svg2img');
const path = require('path');

const svgPath = path.join(__dirname, 'public', 'cropsay-icon.svg');
const pngPath = path.join(__dirname, 'public', 'favicon.ico');

const svgContent = fs.readFileSync(svgPath, 'utf8');

svg2img(svgContent, {width: 32, height: 32}, function(error, buffer) {
  if (error) {
    console.error('Error converting SVG to ICO:', error);
    return;
  }
  
  fs.writeFileSync(pngPath, buffer);
  console.log('Favicon created successfully!');
});
