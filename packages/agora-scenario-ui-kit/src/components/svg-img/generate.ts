const fs = require('fs');
const path = require('path');

fs.readdirSync(path.resolve(__dirname, './paths')).forEach((d) => {
  const value = d.replace('.tsx', '');
  const key = value.toUpperCase().replace(/-/g, '_');

  console.log(`${key} = '${value}',`);
});
