// Pyodide Utility Functions
/* global pyodide */

let Module;
if (typeof pyodide !== 'undefined') {
  Module = pyodide; // browsers
} else if (typeof process.pyodide !== 'undefined') {
  Module = process.pyodide; // node
} else {
  Module = {};
}
if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}

const fetchNode = file => {
  return new Promise((resolve, reject) => {
    const fetch = require('isomorphic-fetch');
    const fs = require('fs-extra');

    if (file.indexOf('http') === -1) {
      // local
      fs.readFile(file, (err, data) => err ? reject(err) : resolve({
        buffer: () => data
      }));
    } else {
      // remote
      fetch(file).then(buff => resolve({
        buffer: () => buff.buffer()
      }));
    }
  });
};

export const fetchRemotePackage = (packageName, packageSize, callback, errback) => {
  if (typeof XMLHttpRequest !== 'undefined') { // BROWSER
    const xhr = new XMLHttpRequest();
    xhr.open('GET', packageName, true);
    xhr.responseType = 'arraybuffer';
    xhr.onprogress = event => {
      const url = packageName;
      const size = event.total ? event.total : packageSize;
      if (event.loaded) {
        if (!xhr.addedTotal) {
          xhr.addedTotal = true;
          if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
          Module.dataFileDownloads[url] = {
            loaded: event.loaded,
            total: size
          };
        } else {
          Module.dataFileDownloads[url].loaded = event.loaded;
        }
        let total = 0;
        let loaded = 0;
        let num = 0;
        Module.dataFileDownloads.each(download => {
          const data = Module.dataFileDownloads[download];
          total += data.total;
          loaded += data.loaded;
          num++;
        });
        total = Math.ceil(total * Module.expectedDataFileDownloads / num);
        if (Module['setStatus']) Module['setStatus'](`Downloading data... (${loaded}/${total})`);
      } else if (!Module.dataFileDownloads) {
        if (Module['setStatus']) Module['setStatus']('Downloading data...');
      }
    };
    xhr.onerror = event => {
      errback(new Error('NetworkError for: ' + packageName));
    }
    xhr.onload = event => {
      if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        callback(xhr.response);
      } else {
        errback(new Error(xhr.statusText + ' : ' + xhr.responseURL));
      }
    };
    xhr.send(null);
  } else {
    fetchNode(packageName).then(buffer => buffer.buffer()).then(packageData => {
      if (!Module.dataFileDownloads) {
        if (Module['setStatus']) Module['setStatus']('Downloading data...');
        console.log(`Downloading ${packageName} data...`);
      } else {
        Module.dataFileDownloads[packageName] = {
          loaded: packageSize,
          total: packageSize
        };
        let total = 0;
        let loaded = 0;
        let num = 0;
        Module.dataFileDownloads.each(download => {
          const data = Module.dataFileDownloads[download];
          total += data.total;
          loaded += data.loaded;
          num++;
        });
        total = Math.ceil(total * Module.expectedDataFileDownloads / num);
        if (Module['setStatus']) {
          Module['setStatus'](`Downloading data... (${loaded}/${total})`);
          console.log(`Downloaded ${packageName} data... (${loaded}/${total})`);
        }
      }
      callback(packageData);
    }).catch(err => {
      console.error('Something wrong happened ' + err);
      errback(new Error('Something wrong happened ' + err))
    });
  }
};