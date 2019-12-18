var Module;
if (typeof pyodide !== 'undefined') {
  Module = pyodide; // browsers
} else if (typeof process['pyodide'] !== 'undefined') {
  Module = process['pyodide']; // node
} else {
  Module = {};
}
if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0
}
Module.expectedDataFileDownloads++;
(function() {
  var loadPackage = function(metadata) {
    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
      console.warn('Browser environment'); // BROWSER
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
      console.warn('Web worker environment'); // WEB WORKER
    } else if (typeof process === "object" && typeof require === "function") {
      PACKAGE_PATH = encodeURIComponent(require('path').join(__dirname, '/'));
      console.warn('Node environment'); // NODE
    } else {
      throw 'using preloaded data can only be done on a web page, web worker or in nodejs';
    }
    var PACKAGE_NAME = "typeguard.data";
    var REMOTE_PACKAGE_BASE = "typeguard.data";
    if (typeof Module["locateFilePackage"] === "function" && !Module["locateFile"]) {
      Module["locateFile"] = Module["locateFilePackage"];
      err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)")
    }
    var REMOTE_PACKAGE_NAME = Module["locateFile"] ? Module["locateFile"](REMOTE_PACKAGE_BASE, "") : REMOTE_PACKAGE_BASE;
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;

    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      if (typeof XMLHttpRequest !== 'undefined') { // BROWSER
        var xhr = new XMLHttpRequest();
        xhr.open('GET', packageName, true);
        xhr.responseType = 'arraybuffer';
        xhr.onprogress = function(event) {
          var url = packageName;
          var size = packageSize;
          if (event.total) size = event.total;
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
            var total = 0;
            var loaded = 0;
            var num = 0;
            for (var download in Module.dataFileDownloads) {
              var data = Module.dataFileDownloads[download];
              total += data.total;
              loaded += data.loaded;
              num++;
            }
            total = Math.ceil(total * Module.expectedDataFileDownloads / num);
            if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
          } else if (!Module.dataFileDownloads) {
            if (Module['setStatus']) Module['setStatus']('Downloading data...');
          }
        };
        xhr.onerror = function(event) {
          throw new Error("NetworkError for: " + packageName);
        }
        xhr.onload = function(event) {
          if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            var packageData = xhr.response;
            callback(packageData);
          } else {
            throw new Error(xhr.statusText + " : " + xhr.responseURL);
          }
        };
        xhr.send(null);
      } else {
        function fetch_node(file) {
          var fs = require('fs');
          var fetch = require('isomorphic-fetch');
          return new Promise((resolve, reject) => {
            if (file.indexOf('http') == -1) {
              fs.readFile(file, (err, data) => err ? reject(err) : resolve({
                buffer: () => data
              })); // local
            } else {
              fetch(file).then((buff) => resolve({
                buffer: () => buff.buffer()
              })); // remote
            }
          });
        }
        fetch_node(packageName).then((buffer) => buffer.buffer()).then((packageData) => {
          if (!Module.dataFileDownloads) {
            if (Module['setStatus']) Module['setStatus']('Downloading data...');
            console.log('Downloading ' + packageName + ' data...');
          } else {
            Module.dataFileDownloads[packageName] = {
              loaded: packageSize,
              total: packageSize
            }
            var total = 0;
            var loaded = 0;
            var num = 0;
            for (var download in Module.dataFileDownloads) {
              var data = Module.dataFileDownloads[download];
              total += data.total;
              loaded += data.loaded;
              num++
            }
            total = Math.ceil(total * Module.expectedDataFileDownloads / num);
            if (Module['setStatus']) {
              Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
              console.log('Downloaded ' + packageName + ' data... (' + loaded + '/' + total + ')');
            }
          }
          callback(packageData);
        }).catch((err) => {
          console.error('Something wrong happened ' + err);
          throw new Error('Something wrong happened ' + err);
        });
      }
    }

    function handleError(error) {
      console.error("package error:", error)
    }
    var fetchedCallback = null;
    var fetched = Module["getPreloadedPackage"] ? Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;
    if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
      if (fetchedCallback) {
        fetchedCallback(data);
        fetchedCallback = null
      } else {
        fetched = data
      }
    }, handleError);

    function runWithFS() {
      function assert(check, msg) {
        if (!check) throw msg + (new Error).stack
      }
      Module["FS_createPath"]("/", "lib", true, true);
      Module["FS_createPath"]("/lib", "python3.7", true, true);
      Module["FS_createPath"]("/lib/python3.7", "site-packages", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages", "typeguard-2.7.0-py3.7.egg-info", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages", "typeguard", true, true);

      function DataRequest(start, end, audio) {
        this.start = start;
        this.end = end;
        this.audio = audio
      }
      DataRequest.prototype = {
        requests: {},
        open: function(mode, name) {
          this.name = name;
          this.requests[name] = this;
          Module["addRunDependency"]("fp " + this.name)
        },
        send: function() {},
        onload: function() {
          var byteArray = this.byteArray.subarray(this.start, this.end);
          this.finish(byteArray)
        },
        finish: function(byteArray) {
          var that = this;
          Module["FS_createPreloadedFile"](this.name, null, byteArray, true, true, function() {
            Module["removeRunDependency"]("fp " + that.name)
          }, function() {
            if (that.audio) {
              Module["removeRunDependency"]("fp " + that.name)
            } else {
              err("Preloading file " + that.name + " failed")
            }
          }, false, true);
          this.requests[this.name] = null
        }
      };

      function processPackageData(arrayBuffer) {
        Module.finishedDataFileDownloads++;
        assert(arrayBuffer, "Loading data file failed.");
        arrayBuffer = arrayBuffer instanceof ArrayBuffer ? arrayBuffer : arrayBuffer.buffer;
        assert(arrayBuffer instanceof ArrayBuffer, "bad input to processPackageData");
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        var compressedData = {
          data: null,
          cachedOffset: 28820,
          cachedIndexes: [-1, -1],
          cachedChunks: [null, null],
          offsets: [0, 1259, 2573, 3778, 5080, 6001, 7342, 8509, 9436, 10196, 11155, 12260, 13112, 13980, 15071, 16244, 17441, 18281, 19596, 20753, 22081, 23367, 24531, 25648, 26718, 27994],
          sizes: [1259, 1314, 1205, 1302, 921, 1341, 1167, 927, 760, 959, 1105, 852, 868, 1091, 1173, 1197, 840, 1315, 1157, 1328, 1286, 1164, 1117, 1070, 1276, 826],
          successes: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        };
        compressedData.data = byteArray;
        assert(typeof Module.LZ4 === "object", "LZ4 not present - was your app build with  -s LZ4=1  ?");
        Module.LZ4.loadPackage({
          metadata: metadata,
          compressedData: compressedData
        });
        Module["removeRunDependency"]("datafile_typeguard.data")
      }
      Module["addRunDependency"]("datafile_typeguard.data");
      if (!Module.preloadResults) Module.preloadResults = {};
      Module.preloadResults[PACKAGE_NAME] = {
        fromCache: false
      };
      if (fetched) {
        processPackageData(fetched);
        fetched = null
      } else {
        fetchedCallback = processPackageData
      }
    }
    if (Module["calledRun"]) {
      runWithFS()
    } else {
      if (!Module["preRun"]) Module["preRun"] = [];
      Module["preRun"].push(runWithFS)
    }
  };
  loadPackage({
    files: [{
      filename: "/lib/python3.7/site-packages/typeguard-2.7.0-py3.7.egg-info/top_level.txt",
      start: 0,
      end: 10,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/typeguard-2.7.0-py3.7.egg-info/entry_points.txt",
      start: 10,
      end: 58,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/typeguard-2.7.0-py3.7.egg-info/PKG-INFO",
      start: 58,
      end: 3593,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/typeguard-2.7.0-py3.7.egg-info/SOURCES.txt",
      start: 3593,
      end: 4256,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/typeguard-2.7.0-py3.7.egg-info/not-zip-safe",
      start: 4256,
      end: 4257,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/typeguard-2.7.0-py3.7.egg-info/dependency_links.txt",
      start: 4257,
      end: 4258,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/typeguard-2.7.0-py3.7.egg-info/requires.txt",
      start: 4258,
      end: 4358,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/typeguard/__init__.py",
      start: 4358,
      end: 46204,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/typeguard/py.typed",
      start: 46204,
      end: 46204,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/typeguard/pytest_plugin.py",
      start: 46204,
      end: 46762,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/typeguard/importhook.py",
      start: 46762,
      end: 52383,
      audio: 0
    }],
    remote_package_size: 32916,
    package_uuid: "dacc2f32-4815-47eb-8179-5c37f6dc7277"
  })
})();