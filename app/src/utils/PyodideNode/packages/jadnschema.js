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
    var PACKAGE_NAME = "jadnschema.data";
    var REMOTE_PACKAGE_BASE = "jadnschema.data";
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
      Module["FS_createPath"]("/lib/python3.7/site-packages", "jadnschema-0.1.dev10+g1248988.d20191218-py3.7.egg-info", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages", "jadnschema", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/jadnschema", "convert", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/jadnschema/convert", "schema", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/jadnschema/convert/schema", "readers", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/jadnschema/convert/schema", "writers", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/jadnschema/convert/schema/writers", "html", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/jadnschema/convert", "message", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/jadnschema/convert/message", "serializations", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/jadnschema", "schema", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/jadnschema/schema", "formats", true, true);
      Module["FS_createPath"]("/", "bin", true, true);

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
          cachedOffset: 100017,
          cachedIndexes: [-1, -1],
          cachedChunks: [null, null],
          offsets: [0, 980, 2152, 3377, 4356, 5493, 6491, 7587, 8731, 9761, 10585, 11534, 12590, 13766, 15036, 16192, 17294, 18325, 19506, 20535, 21449, 22371, 23412, 24636, 25633, 26820, 28071, 29325, 30352, 31254, 32043, 33007, 34200, 35360, 36166, 37019, 38025, 39208, 40370, 41550, 42445, 43320, 44492, 45566, 46773, 48015, 49123, 50236, 51236, 52485, 53665, 54429, 55636, 56849, 57951, 58837, 59710, 60649, 61656, 62811, 64074, 65251, 66358, 67531, 68623, 69723, 70965, 72092, 72988, 74223, 75352, 76497, 77487, 78532, 79830, 80857, 81885, 82903, 83934, 84866, 86128, 87268, 88405, 89485, 90596, 91780, 92723, 93664, 94399, 95372, 96534, 97725, 98673, 99848],
          sizes: [980, 1172, 1225, 979, 1137, 998, 1096, 1144, 1030, 824, 949, 1056, 1176, 1270, 1156, 1102, 1031, 1181, 1029, 914, 922, 1041, 1224, 997, 1187, 1251, 1254, 1027, 902, 789, 964, 1193, 1160, 806, 853, 1006, 1183, 1162, 1180, 895, 875, 1172, 1074, 1207, 1242, 1108, 1113, 1e3, 1249, 1180, 764, 1207, 1213, 1102, 886, 873, 939, 1007, 1155, 1263, 1177, 1107, 1173, 1092, 1100, 1242, 1127, 896, 1235, 1129, 1145, 990, 1045, 1298, 1027, 1028, 1018, 1031, 932, 1262, 1140, 1137, 1080, 1111, 1184, 943, 941, 735, 973, 1162, 1191, 948, 1175, 169],
          successes: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        };
        compressedData.data = byteArray;
        assert(typeof Module.LZ4 === "object", "LZ4 not present - was your app build with  -s LZ4=1  ?");
        Module.LZ4.loadPackage({
          metadata: metadata,
          compressedData: compressedData
        });
        Module["removeRunDependency"]("datafile_jadnschema.data")
      }
      Module["addRunDependency"]("datafile_jadnschema.data");
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
      filename: "/lib/python3.7/site-packages/jadnschema-0.1.dev10+g1248988.d20191218-py3.7.egg-info/top_level.txt",
      start: 0,
      end: 11,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema-0.1.dev10+g1248988.d20191218-py3.7.egg-info/entry_points.txt",
      start: 11,
      end: 63,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema-0.1.dev10+g1248988.d20191218-py3.7.egg-info/PKG-INFO",
      start: 63,
      end: 708,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema-0.1.dev10+g1248988.d20191218-py3.7.egg-info/SOURCES.txt",
      start: 708,
      end: 2663,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema-0.1.dev10+g1248988.d20191218-py3.7.egg-info/dependency_links.txt",
      start: 2663,
      end: 2664,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema-0.1.dev10+g1248988.d20191218-py3.7.egg-info/requires.txt",
      start: 2664,
      end: 2821,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/__init__.py",
      start: 2821,
      end: 3158,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/utils.py",
      start: 3158,
      end: 9800,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/jadn.py",
      start: 9800,
      end: 12524,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/exceptions.py",
      start: 12524,
      end: 13056,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/base.py",
      start: 13056,
      end: 14694,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/cli.py",
      start: 14694,
      end: 17404,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/__init__.py",
      start: 17404,
      end: 18256,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/__init__.py",
      start: 18256,
      end: 23935,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/enums.py",
      start: 23935,
      end: 24294,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/base.py",
      start: 24294,
      end: 30957,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/readers/__init__.py",
      start: 30957,
      end: 30970,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/__init__.py",
      start: 30970,
      end: 31228,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/json_schema.py",
      start: 31228,
      end: 51956,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/jadn.py",
      start: 51956,
      end: 53044,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/jadn_idl.py",
      start: 53044,
      end: 64872,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/markdown.py",
      start: 64872,
      end: 75672,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/html/__init__.py",
      start: 75672,
      end: 91101,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/html/theme.less",
      start: 91101,
      end: 92569,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/html/theme.css",
      start: 92569,
      end: 94027,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/message/__init__.py",
      start: 94027,
      end: 94123,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/message/message.py",
      start: 94123,
      end: 96007,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/message/serializations/__init__.py",
      start: 96007,
      end: 98582,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/message/serializations/xml.py",
      start: 98582,
      end: 100055,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/__init__.py",
      start: 100055,
      end: 100295,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/exceptions.py",
      start: 100295,
      end: 100795,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/schema.py",
      start: 100795,
      end: 126267,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/base.py",
      start: 126267,
      end: 133687,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/options.py",
      start: 133687,
      end: 145389,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/fields.py",
      start: 145389,
      end: 150266,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/definitions.py",
      start: 150266,
      end: 172066,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/__init__.py",
      start: 172066,
      end: 172519,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/network.py",
      start: 172519,
      end: 177561,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/rfc_3339.py",
      start: 177561,
      end: 179201,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/rfc_3987.py",
      start: 179201,
      end: 180397,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/constants.py",
      start: 180397,
      end: 180488,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/rfc_3986.py",
      start: 180488,
      end: 181671,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/jadn_idna.py",
      start: 181671,
      end: 183517,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/general.py",
      start: 183517,
      end: 190140,
      audio: 0
    }, {
      filename: "/bin/jadnschema",
      start: 190140,
      end: 190657,
      audio: 0
    }],
    remote_package_size: 104113,
    package_uuid: "1f99de98-ef31-47e0-8a0a-aa91db696e83"
  })
})();