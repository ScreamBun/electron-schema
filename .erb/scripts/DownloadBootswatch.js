import fs from 'fs';
import path from 'path';
import querystring from 'querystring';
import download from 'download-file-sync';
import GetGoogleFonts from 'get-google-fonts';
import NamedRegExp from 'named-regexp-groups';
import request from 'sync-request';

const ROOT_DIR = path.join(__dirname, '..', '..', 'src', 'resources');
const THEME_DIR = path.join(ROOT_DIR, 'themes');
const THEME_FONT_DIR = path.join(ROOT_DIR, 'assets', 'fonts');
const CHECK_DIRS = ['themes', 'assets', 'assets/fonts'];

const THEME_API = 'https://bootswatch.com/api/4.json';
const THEME_FONT_URL = '../assets/';

const CSS_URL_IMPORT = new NamedRegExp(/^@import url\(["'](:<url>.*?)["']\);\s*?$/);
// const FILE_URL_IMPORT = new NamedRegExp(/\s*?src:( local\(.*?\),)? local\(['"](:<name>.*?)['"]\), url\(['"]?(:<url>.*?)['"]?\) format\(['"](:<format>.*?)['"]\);/);
const FILE_URL_IMPORT = new NamedRegExp(/\s*?src:(.*?url\(['"]?(:<url>.*?)['"]?\).*);/);
const URL_REPLACE = new NamedRegExp(/url\([""]?(:<url>.*?)[""]?\)/);

CHECK_DIRS.forEach(d => {
  const dir = path.join(ROOT_DIR, d);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});

let BootswatchThemes = request('GET', THEME_API);
BootswatchThemes = JSON.parse(BootswatchThemes.getBody('utf8'));

BootswatchThemes.themes.forEach(theme => {
  console.log(`Downloading Theme: ${theme.name}`);
  const themeName = theme.name.toLowerCase();

  let preProcessCss = [];
  const css = request('GET', theme.css).getBody('utf8');

  // Imported items
  css.split(/\n\r?/gm).forEach(line => {
    if (line.startsWith('@import url("https://fonts.googleapis.com')){
      const ext_url = new NamedRegExp(/\s*?@import url(\(['"]?(:<url>.*?)['"]?\));/).exec(line).groups.url;
      const args = querystring.parse(ext_url.split('?').pop());
      const family = args.family.split(':').reverse().pop().replace(/[|\s]/g, '_');
      new GetGoogleFonts({
        cssFile: `${theme.name}-${family}.css`,
        outputDir:  THEME_FONT_DIR
      }).download(ext_url)
      preProcessCss.push(`@import url('${THEME_FONT_URL}fonts/${theme.name}-${family}.css');`);
    } else if (line.startsWith('@import url(')) {
      const cssImportURL = line.replace(CSS_URL_IMPORT, '$+{url}');
      const cssImport = request('GET', cssImportURL).getBody('utf8');

      preProcessCss.push(`/* ${line} */`);
      preProcessCss = preProcessCss.concat(cssImport.split(/\n\r?/g));
    } else {
      preProcessCss.push(line);
    }
  });

  // set imports to local & download files
  const postProcessCss = preProcessCss.map(line => {
    let processedLine = line;
    if (line.match(/\s*?src:.*?url\(["']?https?:\/\/.*/) && !line.startsWith('/*')) {
      const ext_url = FILE_URL_IMPORT.exec(line).groups.url;
      const ext_file = ext_url.split(/\//g).pop()
      const font_file = path.join(THEME_FONT_DIR, ext_file)

      if (!fs.existsSync(font_file)) {
        fs.writeFileSync(font_file, download(ext_url));
        console.log(`Downloaded reference: ${ext_file}`);
      }
      processedLine = processedLine.replace(URL_REPLACE, `url('${THEME_FONT_URL}fonts/${ext_file}')`);
    }

    processedLine = processedLine.replace(/\\[^\\]/g, '\\\\');
    processedLine = processedLine.replace(/^\s+\*/, '*');
    processedLine = processedLine.replace(/^\s+/, '\t');
    return processedLine;
  });

  const outFile = path.join(THEME_DIR, `${themeName}.css`);
  const themeCss = fs.createWriteStream(outFile, { flags: 'w' });
  themeCss.write(postProcessCss.join('\n'));
  themeCss.end();
});
