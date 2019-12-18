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
    var PACKAGE_NAME = "inflect.data";
    var REMOTE_PACKAGE_BASE = "inflect.data";
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
      Module["FS_createPath"]("/lib/python3.7/site-packages", "inflect-3.0.2-py3.7.egg-info", true, true);

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
          cachedOffset: 60960,
          cachedIndexes: [-1, -1],
          cachedChunks: [null, null],
          offsets: [0, 1060, 2332, 3358, 4356, 5279, 6375, 7359, 8285, 9411, 10391, 11276, 12066, 13103, 14320, 15228, 16153, 17284, 18681, 19771, 20793, 21844, 23052, 24221, 24816, 25518, 26533, 27445, 28502, 29543, 30349, 31179, 31935, 32970, 33931, 35126, 35893, 36667, 37481, 38185, 39298, 40111, 41294, 42363, 43047, 43883, 45081, 46049, 47262, 48331, 49378, 50319, 51259, 52452, 53820, 54980, 56291, 57568, 58666, 59831],
          sizes: [1060, 1272, 1026, 998, 923, 1096, 984, 926, 1126, 980, 885, 790, 1037, 1217, 908, 925, 1131, 1397, 1090, 1022, 1051, 1208, 1169, 595, 702, 1015, 912, 1057, 1041, 806, 830, 756, 1035, 961, 1195, 767, 774, 814, 704, 1113, 813, 1183, 1069, 684, 836, 1198, 968, 1213, 1069, 1047, 941, 940, 1193, 1368, 1160, 1311, 1277, 1098, 1165, 1129],
          successes: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        };
        compressedData.data = byteArray;
        assert(typeof Module.LZ4 === "object", "LZ4 not present - was your app build with  -s LZ4=1  ?");
        Module.LZ4.loadPackage({
          metadata: metadata,
          compressedData: compressedData
        });
        Module["removeRunDependency"]("datafile_inflect.data")
      }
      Module["addRunDependency"]("datafile_inflect.data");
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
      filename: "/lib/python3.7/site-packages/inflect.py",
      start: 0,
      end: 97843,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/inflect-3.0.2-py3.7.egg-info/top_level.txt",
      start: 97843,
      end: 97851,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/inflect-3.0.2-py3.7.egg-info/PKG-INFO",
      start: 97851,
      end: 121498,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/inflect-3.0.2-py3.7.egg-info/SOURCES.txt",
      start: 121498,
      end: 122360,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/inflect-3.0.2-py3.7.egg-info/dependency_links.txt",
      start: 122360,
      end: 122361,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/inflect-3.0.2-py3.7.egg-info/requires.txt",
      start: 122361,
      end: 122539,
      audio: 0
    }],
    remote_package_size: 65056,
    package_uuid: "a22ac590-3055-4778-a790-f1a5821a517c"
  })
})();