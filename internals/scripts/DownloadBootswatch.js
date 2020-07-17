import fs from 'fs';
import path from 'path';
import download from 'download-file';
import NamedRegExp from 'named-regexp-groups';
import request from 'sync-request';

const ROOT_DIR = path.join(__dirname, '..', '..', 'app', 'resources');
const THEME_DIR = path.join(ROOT_DIR, 'themes');
const THEME_FONT_DIR = path.join(ROOT_DIR, 'assets', 'fonts');
const CHECK_DIRS = ['themes', 'assets', 'assets/fonts'];

const THEME_API = 'https://bootswatch.com/api/4.json';
const THEME_FONT_URL = '../assets/';

const CSS_URL_IMPORT = new NamedRegExp(/^@import url\(["'](:<url>.*?)["']\);\s*?$/);
const FILE_URL_IMPORT = new NamedRegExp(/\s*?src:( local\(.*?\),)? local\(['"](:<name>.*?)['"]\), url\(['"]?(:<url>.*?)['"]?\) format\(['"](:<format>.*?)['"]\);/);
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

  css.split(/\n\r?/gm).forEach(line => {
    if (line.startsWith('@import url(')) {
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
    if (line.match(/\s*?src:.*url\(["']?https?:\/\/.*/) && !line.startsWith('/*')) {
      const src = FILE_URL_IMPORT.exec(line).groups;
      const ext = path.extname(src.url);
      const fileName = `${src.name}${ext}`;

      if (!fs.existsSync(path.join(THEME_FONT_DIR, fileName))) {
        const opts = {
          directory: THEME_FONT_DIR,
          filename: fileName
        };
        download(src.url, opts, err => {
          if (err) throw err;
          console.log(`Downloaded reference: ${opts.filename}`);
        });
      }
      processedLine = processedLine.replace(URL_REPLACE, `url('${THEME_FONT_URL}fonts/${fileName}')`);
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
