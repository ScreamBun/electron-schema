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
      Module["FS_createPath"]("/lib/python3.7/site-packages", "importlib_metadata-1.3.0-py3.7.egg-info", true, true);

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
          cachedOffset: 44983,
          cachedIndexes: [-1, -1],
          cachedChunks: [null, null],
          offsets: [0, 1336, 2626, 3742, 4989, 6216, 7459, 8637, 9664, 10740, 12125, 13384, 14495, 15609, 16721, 17967, 19151, 20008, 21110, 22296, 23185, 24640, 25947, 27424, 28766, 30200, 31568, 32970, 34399, 35766, 37153, 38364, 39898, 41434, 42852, 44090],
          sizes: [1336, 1290, 1116, 1247, 1227, 1243, 1178, 1027, 1076, 1385, 1259, 1111, 1114, 1112, 1246, 1184, 857, 1102, 1186, 889, 1455, 1307, 1477, 1342, 1434, 1368, 1402, 1429, 1367, 1387, 1211, 1534, 1536, 1418, 1238, 893],
          successes: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
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
      end: 17358,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/_compat.py",
      start: 17358,
      end: 21390,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/tests/__init__.py",
      start: 21390,
      end: 21390,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/tests/test_api.py",
      start: 21390,
      end: 26934,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/tests/test_zip.py",
      start: 26934,
      end: 29306,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/tests/test_integration.py",
      start: 29306,
      end: 29992,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/tests/test_main.py",
      start: 29992,
      end: 37171,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/tests/fixtures.py",
      start: 37171,
      end: 42175,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/tests/data/__init__.py",
      start: 42175,
      end: 42175,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/tests/data/example-21.12-py3-none-any.whl",
      start: 42175,
      end: 43630,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/tests/data/example-21.12-py3.6.egg",
      start: 43630,
      end: 45127,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/docs/__init__.py",
      start: 45127,
      end: 45127,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/docs/using.rst",
      start: 45127,
      end: 54933,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/docs/conf.py",
      start: 54933,
      end: 60401,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/docs/index.rst",
      start: 60401,
      end: 62566,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata/docs/changelog.rst",
      start: 62566,
      end: 69790,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata-1.3.0-py3.7.egg-info/top_level.txt",
      start: 69790,
      end: 69809,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata-1.3.0-py3.7.egg-info/PKG-INFO",
      start: 69809,
      end: 71802,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata-1.3.0-py3.7.egg-info/SOURCES.txt",
      start: 71802,
      end: 73480,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata-1.3.0-py3.7.egg-info/dependency_links.txt",
      start: 73480,
      end: 73481,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/importlib_metadata-1.3.0-py3.7.egg-info/requires.txt",
      start: 73481,
      end: 73656,
      audio: 0
    }],
    remote_package_size: 49079,
    package_uuid: "7042ada2-eaf9-4772-b8fa-3ae8c1f4d1f0"
  })
})();