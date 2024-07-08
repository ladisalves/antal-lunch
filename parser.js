const fs = require('fs').promises;
const path = require('path');

const parseLunchMenu = async (menuFile, startExp, endExp, lineReplacer) => {
  const filePath = path.join(__dirname, menuFile);
  let output = '';

  try {
    const data = await fs.readFile(filePath, 'utf8');
    let started = false;
    // Split the file content by new line and process each line
    data.split('\n').forEach((line) => {
      if (started && line.trim().match(endExp)) {
        started = false;
        return;
      }
      if (line.trim().match(startExp)) {
        started = true;
      }
      if (started) {
        output = output.concat(
            line.replace(lineReplacer, '###').replace(/<[^>]*>/g, '').replace(/###/g, '<br />')
        );
      }
    });
  } catch (err) {
    console.error('Error reading the file:', err);
    return;
  }

  return output;
};


(async function(){
    const ledarny = await parseLunchMenu(
        './data/ledarny.html',
        /<table class="table">.*/,
        /.*taň se fanouškem.*/,
        /<\/tr>|<\/h5>/g
    )
    const rybarna = await parseLunchMenu(
        './data/rybarna.html',
        /<p><strong>Jídelní lístek.*/,
        /<ul class="wp-block-gallery columns-0 is-cropped"><\/ul>/,
        /<\/p>|<\/li>/g
    )
    const chemicka = await parseLunchMenu(
        './data/chemicka.html',
        /.*Polévka.*/,
        /.*UPOZORNĚNÍ PRO ZÁKAZNÍKY.*/,
        /<\/h2>|<\/tr>/g
    )

    // today formated yyyy-mm-dd
    const today = new Date().toISOString().split('T')[0];
    const lunchMenu = `<html>
    <head>
        <title>Lunch Menu - ${today}</title>
        <style>
            html {
                font-family: Arial, sans-serif;
                color: #fff;
                background: #000;
                font-size: 13pt;
            }
            .menu {
                margin: 10px;
                padding: 10px;
                border: 1px solid #ccc;
                line-height: 1.5em;
                max-width: 1024px;
            }
        </style>
    </head>
    <body>
        <div>generated: ${today}</div>
        <h2>Rybárna</h2>
        <div class="menu">${rybarna}</div>        
        <h2>Ledárny</h2>
        <div class="menu">${ledarny}</div>
        <h2>Chemička</h2>
        <div class="menu">${chemicka}</div>
    </body>
    </html>`;

    // Save the parsed menus to files
    await fs.writeFile('./docs/index.html', lunchMenu);

    console.log('generated');
})();
