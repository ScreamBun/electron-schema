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
    var PACKAGE_NAME = "importlib_metadata.data";
    var REMOTE_PACKAGE_BASE = "importlib_metadata.data";
    if (typeof Module["locateFilePackage"] === "function" && !Module["locateFile"]) {
      Module["locateFile"] = Module["locateFilePackage"];
      err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)")
    }
    var REMOTE_PACKAGE_NAME = Module["locateFile"] ? Module["locateFile"](REMOTE_PACKAGE_BASE, "") : REMOTE_PACKAGE_BASE;
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;
    const fetchRemotePackage = require('./utils').fetchRemotePackage;

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
      Module["FS_createPath"]("/lib/python3.7/site-packages", "importlib_metadata", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/importlib_metadata", "tests", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/importlib_metadata/tests", "data", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/importlib_metadata", "docs", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages", "importlib_metadata-1.5.0-py3.7.egg-info", true, true);

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
          cachedOffset: 46119,
          cachedIndexes: [-1, -1],
          cachedChunks: [null, null],
          offsets: [0, 1329, 2617, 3732, 4980, 6209, 7457, 8634, 9868, 10927, 12105, 13500, 14543, 15552, 16754, 17893, 19100, 20128, 21013, 22076, 23213, 24088, 25496, 26915, 28350, 29671, 31136, 32452, 33960, 35417, 36658, 38052, 39394, 40905, 42422, 43869, 45128, 46050],
          sizes: [1329, 1288, 1115, 1248, 1229, 1248, 1177, 1234, 1059, 1178, 1395, 1043, 1009, 1202, 1139, 1207, 1028, 885, 1063, 1137, 875, 1408, 1419, 1435, 1321, 1465, 1316, 1508, 1457, 1241, 1394, 1342, 1511, 1517, 1447, 1259, 922, 69],
          successes: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]
        };
        compressedData.data = byteArray;
        assert(typeof Module.LZ4 === "object", "LZ4 not present - was your app build with  -s LZ4=1  ?");
        Module.LZ4.loadPackage({
          metadata: metadata,
          compressedData: compressedData
        });
        Module["removeRunDependency"]("datafile_importlib_metadata.data")
      }
      Module["addRunDependency"]("datafile_importlib_metadata.data");
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
      filename: "/lib/python3.7/site-packages/importlib_metadata/__init__.py",
      start: 0,
      end: 18117,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/_compat.py",
      start: 18117,
      end: 22001,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/tests/__init__.py",
      start: 22001,
      end: 22001,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/tests/test_api.py",
      start: 22001,
      end: 27545,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/tests/test_zip.py",
      start: 27545,
      end: 29917,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/tests/test_integration.py",
      start: 29917,
      end: 31192,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/tests/test_main.py",
      start: 31192,
      end: 39175,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/tests/fixtures.py",
      start: 39175,
      end: 44504,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/tests/data/__init__.py",
      start: 44504,
      end: 44504,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/tests/data/example-21.12-py3-none-any.whl",
      start: 44504,
      end: 45959,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/tests/data/example-21.12-py3.6.egg",
      start: 45959,
      end: 47456,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/docs/__init__.py",
      start: 47456,
      end: 47456,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/docs/using.rst",
      start: 47456,
      end: 56742,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/docs/conf.py",
      start: 56742,
      end: 62320,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/docs/index.rst",
      start: 62320,
      end: 64227,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/docs/changelog.rst",
      start: 64227,
      end: 71982,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata-1.5.0-py3.7.egg-info/top_level.txt",
      start: 71982,
      end: 72001,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata-1.5.0-py3.7.egg-info/PKG-INFO",
      start: 72001,
      end: 73994,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata-1.5.0-py3.7.egg-info/SOURCES.txt",
      start: 73994,
      end: 75669,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata-1.5.0-py3.7.egg-info/dependency_links.txt",
      start: 75669,
      end: 75670,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata-1.5.0-py3.7.egg-info/requires.txt",
      start: 75670,
      end: 75845,
      audio: 0
    }],
    remote_package_size: 50215,
    package_uuid: "620d2733-dc03-40a9-9f57-2170291971dd"
  })
})();