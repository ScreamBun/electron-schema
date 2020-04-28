import depcheck from 'depcheck';
import path from 'path';

const ROOT_DIR = path.join(__dirname, '..', '..');
const PKG = import(path.join(ROOT_DIR, 'package.json'));

const options = {
  ignoreBinPackage: false, // ignore the packages with bin entry
  skipMissing: false, // skip calculation of missing dependencies
  ignoreDirs: [
    // folder with these names will be ignored
    'dist',
    'internals',
    'flow-typed',
    'node_modules',
    'release'
  ],
  parsers: {
    // the target parsers
    '*.js': depcheck.parser.es6,
    '*.jsx': depcheck.parser.jsx,
  },
  detectors: [
    // the target detectors
    depcheck.detector.requireCallExpression,
    depcheck.detector.exportDeclaration,
    depcheck.detector.importDeclaration,
  ],
  specials: [
    // the target special parsers
    depcheck.special.babel,
    depcheck.special.eslint,
    depcheck.special.webpack,
  ],
  package: {
    // may specify dependencies instead of parsing package.json
    dependencies: PKG.dependencies,
    devDependencies: PKG.devDependencies,
    peerDependencies: {},
    optionalDependencies: {},
  }
};

const toSimple = (obj, ind) => {
  ind = 1 || ind;
  if (obj && typeof obj == 'object') {
    if (Array.isArray(obj) && obj.length > 0) {
      let o = obj.join(`\n${'  '.repeat(ind)}--> `);
      return `${'  '.repeat(ind)}--> ${o}`;
    } else if (!Array.isArray(obj)) {
      let rtn = '';
      for (let k in obj) {
        rtn += `${'  '.repeat(ind)}${k}\n${toSimple(obj[k], ind+1)}\n`;
      }
      return rtn
    }
  }
  return '';
}

depcheck(ROOT_DIR, options, (unused) => {
  // an array containing the unused dependencies
  console.log(`Unused Dependencies:\n${toSimple(unused.dependencies)}\n`);
  // an array containing the unused devDependencies
  console.log(`Unused DevDependencies:\n${toSimple(unused.devDependencies)}\n`);
  // a lookup containing the dependencies missing in `package.json` and where they are used
  console.log(`Missing Dependencies:\n${toSimple(unused.missing)}\n`);
  // a lookup indicating each dependency is used by which files
  // console.log(`Used Dependencies:\n${toSimple(unused.using)}\n`);
  // files that cannot access or parse
  console.log(`Invalid Files:\n${toSimple(unused.invalidFiles)}\n`);
  // directories that cannot access
  console.log(`Invalid Dirs:\n${toSimple(unused.invalidDirs)}\n`);
});