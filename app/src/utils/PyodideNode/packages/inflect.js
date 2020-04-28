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
      Module["FS_createPath"]("/lib/python3.7/site-packages", "inflect-0.0.0-py3.7.egg-info", true, true);

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
          cachedOffset: 61316,
          cachedIndexes: [-1, -1],
          cachedChunks: [null, null],
          offsets: [0, 1010, 2281, 3328, 4344, 5232, 6345, 7321, 8242, 9381, 10383, 11281, 12068, 13087, 14320, 15264, 16183, 17280, 18682, 19816, 20757, 21795, 22941, 24103, 24834, 25660, 26628, 27533, 28600, 29519, 30319, 31166, 31952, 32964, 33961, 35080, 35888, 36649, 37493, 38224, 39246, 40111, 41292, 42404, 43115, 43917, 45133, 46164, 47268, 48348, 49329, 50275, 51193, 52056, 53415, 54589, 55851, 57164, 58268, 59331, 60658],
          sizes: [1010, 1271, 1047, 1016, 888, 1113, 976, 921, 1139, 1002, 898, 787, 1019, 1233, 944, 919, 1097, 1402, 1134, 941, 1038, 1146, 1162, 731, 826, 968, 905, 1067, 919, 800, 847, 786, 1012, 997, 1119, 808, 761, 844, 731, 1022, 865, 1181, 1112, 711, 802, 1216, 1031, 1104, 1080, 981, 946, 918, 863, 1359, 1174, 1262, 1313, 1104, 1063, 1327, 658],
          successes: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
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
      end: 98181,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/inflect-0.0.0-py3.7.egg-info/top_level.txt",
      start: 98181,
      end: 98189,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/inflect-0.0.0-py3.7.egg-info/PKG-INFO",
      start: 98189,
      end: 122789,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/inflect-0.0.0-py3.7.egg-info/SOURCES.txt",
      start: 122789,
      end: 123671,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/inflect-0.0.0-py3.7.egg-info/dependency_links.txt",
      start: 123671,
      end: 123672,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/inflect-0.0.0-py3.7.egg-info/requires.txt",
      start: 123672,
      end: 123881,
      audio: 0
    }],
    remote_package_size: 65412,
    package_uuid: "457be61b-c8bd-456b-ba9f-caf8637a4c25"
  })
})();