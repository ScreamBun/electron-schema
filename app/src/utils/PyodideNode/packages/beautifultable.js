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
    var PACKAGE_NAME = "beautifultable.data";
    var REMOTE_PACKAGE_BASE = "beautifultable.data";
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
      Module["FS_createPath"]("/lib/python3.7/site-packages", "beautifultable-0.8.0-py3.7.egg-info", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages", "beautifultable", true, true);

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
          cachedOffset: 40496,
          cachedIndexes: [-1, -1],
          cachedChunks: [null, null],
          offsets: [0, 924, 1944, 2752, 3946, 4941, 5839, 6986, 8119, 9076, 10046, 10888, 11742, 12787, 13666, 14740, 15745, 16614, 17473, 18347, 19324, 20420, 21368, 22437, 23550, 24641, 25886, 26591, 27181, 28207, 29335, 30380, 31657, 32899, 33882, 34966, 35921, 36965, 37951, 38942, 39652, 40337],
          sizes: [924, 1020, 808, 1194, 995, 898, 1147, 1133, 957, 970, 842, 854, 1045, 879, 1074, 1005, 869, 859, 874, 977, 1096, 948, 1069, 1113, 1091, 1245, 705, 590, 1026, 1128, 1045, 1277, 1242, 983, 1084, 955, 1044, 986, 991, 710, 685, 159],
          successes: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        };
        compressedData.data = byteArray;
        assert(typeof Module.LZ4 === "object", "LZ4 not present - was your app build with  -s LZ4=1  ?");
        Module.LZ4.loadPackage({
          metadata: metadata,
          compressedData: compressedData
        });
        Module["removeRunDependency"]("datafile_beautifultable.data")
      }
      Module["addRunDependency"]("datafile_beautifultable.data");
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
      filename: "/lib/python3.7/site-packages/beautifultable-0.8.0-py3.7.egg-info/top_level.txt",
      start: 0,
      end: 15,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/beautifultable-0.8.0-py3.7.egg-info/PKG-INFO",
      start: 15,
      end: 11834,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/beautifultable-0.8.0-py3.7.egg-info/SOURCES.txt",
      start: 11834,
      end: 12361,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/beautifultable-0.8.0-py3.7.egg-info/dependency_links.txt",
      start: 12361,
      end: 12362,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/beautifultable-0.8.0-py3.7.egg-info/requires.txt",
      start: 12362,
      end: 12394,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/beautifultable/__init__.py",
      start: 12394,
      end: 13376,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/beautifultable/beautifultable.py",
      start: 13376,
      end: 61894,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/beautifultable/enums.py",
      start: 61894,
      end: 63817,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/beautifultable/utils.py",
      start: 63817,
      end: 65773,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/beautifultable/__version__.py",
      start: 65773,
      end: 66075,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/beautifultable/exceptions.py",
      start: 66075,
      end: 66144,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/beautifultable/meta.py",
      start: 66144,
      end: 67276,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/beautifultable/ansi.py",
      start: 67276,
      end: 70983,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/beautifultable/rows.py",
      start: 70983,
      end: 77660,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/beautifultable/base.py",
      start: 77660,
      end: 79607,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/beautifultable/compat.py",
      start: 79607,
      end: 80002,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/beautifultable/styles.py",
      start: 80002,
      end: 84337,
      audio: 0
    }],
    remote_package_size: 44592,
    package_uuid: "b124cd96-0396-417b-b769-690df12e3469"
  })
})();