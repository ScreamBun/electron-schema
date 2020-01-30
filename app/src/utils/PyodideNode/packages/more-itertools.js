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
    var PACKAGE_NAME = "more-itertools.data";
    var REMOTE_PACKAGE_BASE = "more-itertools.data";
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
      Module["FS_createPath"]("/lib/python3.7/site-packages", "more_itertools", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/more_itertools", "tests", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages", "more_itertools-7.2.0-py3.7.egg-info", true, true);

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
          cachedOffset: 123765,
          cachedIndexes: [-1, -1],
          cachedChunks: [null, null],
          offsets: [0, 1359, 2578, 3803, 5192, 6446, 7690, 8638, 10017, 11366, 12591, 13769, 14844, 16249, 17660, 18695, 19976, 21312, 22652, 24022, 25191, 26385, 27682, 28914, 30081, 31356, 32702, 34028, 35378, 36622, 38001, 39287, 40452, 41811, 42693, 43970, 45161, 46373, 47787, 48946, 50193, 51445, 52470, 53877, 55041, 56248, 57512, 58882, 59979, 60962, 61888, 62876, 63849, 64892, 65743, 67002, 68197, 69029, 70244, 71248, 72329, 73400, 74388, 75460, 76401, 77312, 78189, 78988, 80090, 81029, 81698, 82696, 83377, 84221, 85290, 86046, 86781, 87480, 88446, 89125, 90026, 90980, 91716, 92648, 93594, 94229, 95285, 96191, 97067, 97905, 98856, 99741, 100495, 101501, 102337, 103270, 104086, 104805, 105585, 106462, 107301, 108067, 108930, 109964, 110251, 110575, 110857, 111175, 111497, 111801, 112115, 112410, 112752, 113066, 113411, 113736, 114495, 115664, 116889, 118029, 119331, 120441, 121573, 122779],
          sizes: [1359, 1219, 1225, 1389, 1254, 1244, 948, 1379, 1349, 1225, 1178, 1075, 1405, 1411, 1035, 1281, 1336, 1340, 1370, 1169, 1194, 1297, 1232, 1167, 1275, 1346, 1326, 1350, 1244, 1379, 1286, 1165, 1359, 882, 1277, 1191, 1212, 1414, 1159, 1247, 1252, 1025, 1407, 1164, 1207, 1264, 1370, 1097, 983, 926, 988, 973, 1043, 851, 1259, 1195, 832, 1215, 1004, 1081, 1071, 988, 1072, 941, 911, 877, 799, 1102, 939, 669, 998, 681, 844, 1069, 756, 735, 699, 966, 679, 901, 954, 736, 932, 946, 635, 1056, 906, 876, 838, 951, 885, 754, 1006, 836, 933, 816, 719, 780, 877, 839, 766, 863, 1034, 287, 324, 282, 318, 322, 304, 314, 295, 342, 314, 345, 325, 759, 1169, 1225, 1140, 1302, 1110, 1132, 1206, 986],
          successes: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        };
        compressedData.data = byteArray;
        assert(typeof Module.LZ4 === "object", "LZ4 not present - was your app build with  -s LZ4=1  ?");
        Module.LZ4.loadPackage({
          metadata: metadata,
          compressedData: compressedData
        });
        Module["removeRunDependency"]("datafile_more-itertools.data")
      }
      Module["addRunDependency"]("datafile_more-itertools.data");
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
      filename: "/lib/python3.7/site-packages/more_itertools/__init__.py",
      start: 0,
      end: 87,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/more_itertools/recipes.py",
      start: 87,
      end: 15322,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/more_itertools/more.py",
      start: 15322,
      end: 98181,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/more_itertools/tests/__init__.py",
      start: 98181,
      end: 98181,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/more_itertools/tests/test_recipes.py",
      start: 98181,
      end: 117659,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/more_itertools/tests/test_more.py",
      start: 117659,
      end: 210021,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/more_itertools-7.2.0-py3.7.egg-info/top_level.txt",
      start: 210021,
      end: 210036,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/more_itertools-7.2.0-py3.7.egg-info/PKG-INFO",
      start: 210036,
      end: 252885,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/more_itertools-7.2.0-py3.7.egg-info/SOURCES.txt",
      start: 252885,
      end: 253428,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/more_itertools-7.2.0-py3.7.egg-info/dependency_links.txt",
      start: 253428,
      end: 253429,
      audio: 0
    }],
    remote_package_size: 127861,
    package_uuid: "9ee5d662-8727-483b-b891-a2630ecefa8d"
  })
})();