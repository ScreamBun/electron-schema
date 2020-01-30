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
      Module["FS_createPath"]("/lib/python3.7/site-packages", "jadnschema-0.1.dev11+g245a886-py3.7.egg-info", true, true);
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
          cachedOffset: 99897,
          cachedIndexes: [-1, -1],
          cachedChunks: [null, null],
          offsets: [0, 973, 2143, 3366, 4344, 5475, 6482, 7577, 8723, 9753, 10574, 11534, 12594, 13772, 15032, 16177, 17259, 18282, 19468, 20485, 21395, 22334, 23369, 24597, 25581, 26781, 28025, 29260, 30282, 31211, 32020, 32982, 34184, 35358, 36159, 37001, 38005, 39184, 40347, 41518, 42346, 43275, 44322, 45380, 46576, 47790, 48867, 49996, 51094, 52345, 53471, 54393, 55541, 56717, 57865, 58815, 59741, 60638, 61612, 62727, 64003, 65170, 66234, 67425, 68543, 69643, 70806, 71953, 72936, 74150, 75255, 76413, 77490, 78541, 79784, 80846, 81883, 82941, 83913, 84951, 86146, 87327, 88365, 89507, 90626, 91876, 92775, 93671, 94426, 95308, 96473, 97567, 98604, 99602],
          sizes: [973, 1170, 1223, 978, 1131, 1007, 1095, 1146, 1030, 821, 960, 1060, 1178, 1260, 1145, 1082, 1023, 1186, 1017, 910, 939, 1035, 1228, 984, 1200, 1244, 1235, 1022, 929, 809, 962, 1202, 1174, 801, 842, 1004, 1179, 1163, 1171, 828, 929, 1047, 1058, 1196, 1214, 1077, 1129, 1098, 1251, 1126, 922, 1148, 1176, 1148, 950, 926, 897, 974, 1115, 1276, 1167, 1064, 1191, 1118, 1100, 1163, 1147, 983, 1214, 1105, 1158, 1077, 1051, 1243, 1062, 1037, 1058, 972, 1038, 1195, 1181, 1038, 1142, 1119, 1250, 899, 896, 755, 882, 1165, 1094, 1037, 998, 295],
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
      filename: "/lib/python3.7/site-packages/jadnschema-0.1.dev11+g245a886-py3.7.egg-info/top_level.txt",
      start: 0,
      end: 11,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema-0.1.dev11+g245a886-py3.7.egg-info/entry_points.txt",
      start: 11,
      end: 63,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema-0.1.dev11+g245a886-py3.7.egg-info/PKG-INFO",
      start: 63,
      end: 698,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema-0.1.dev11+g245a886-py3.7.egg-info/SOURCES.txt",
      start: 698,
      end: 2653,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema-0.1.dev11+g245a886-py3.7.egg-info/dependency_links.txt",
      start: 2653,
      end: 2654,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema-0.1.dev11+g245a886-py3.7.egg-info/requires.txt",
      start: 2654,
      end: 2811,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/__init__.py",
      start: 2811,
      end: 3148,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/utils.py",
      start: 3148,
      end: 9790,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/jadn.py",
      start: 9790,
      end: 12514,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/exceptions.py",
      start: 12514,
      end: 13046,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/base.py",
      start: 13046,
      end: 14684,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/cli.py",
      start: 14684,
      end: 17394,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/__init__.py",
      start: 17394,
      end: 18246,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/__init__.py",
      start: 18246,
      end: 23904,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/enums.py",
      start: 23904,
      end: 24263,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/base.py",
      start: 24263,
      end: 30926,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/readers/__init__.py",
      start: 30926,
      end: 30939,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/__init__.py",
      start: 30939,
      end: 31197,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/json_schema.py",
      start: 31197,
      end: 51925,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/jadn.py",
      start: 51925,
      end: 53013,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/jadn_idl.py",
      start: 53013,
      end: 64841,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/markdown.py",
      start: 64841,
      end: 75641,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/html/__init__.py",
      start: 75641,
      end: 91357,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/html/theme.less",
      start: 91357,
      end: 92825,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/html/theme.css",
      start: 92825,
      end: 94283,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/message/__init__.py",
      start: 94283,
      end: 94379,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/message/message.py",
      start: 94379,
      end: 96263,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/message/serializations/__init__.py",
      start: 96263,
      end: 98838,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/message/serializations/xml.py",
      start: 98838,
      end: 100311,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/__init__.py",
      start: 100311,
      end: 100551,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/exceptions.py",
      start: 100551,
      end: 101051,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/schema.py",
      start: 101051,
      end: 126523,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/base.py",
      start: 126523,
      end: 133943,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/options.py",
      start: 133943,
      end: 145645,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/fields.py",
      start: 145645,
      end: 150522,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/definitions.py",
      start: 150522,
      end: 172322,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/__init__.py",
      start: 172322,
      end: 172775,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/network.py",
      start: 172775,
      end: 177817,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/rfc_3339.py",
      start: 177817,
      end: 179457,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/rfc_3987.py",
      start: 179457,
      end: 180653,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/constants.py",
      start: 180653,
      end: 180744,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/rfc_3986.py",
      start: 180744,
      end: 181927,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/jadn_idna.py",
      start: 181927,
      end: 183773,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/general.py",
      start: 183773,
      end: 190396,
      audio: 0
    }, {
      filename: "/bin/jadnschema",
      start: 190396,
      end: 190883,
      audio: 0
    }],
    remote_package_size: 103993,
    package_uuid: "c28be64c-dd46-4bda-8b19-abdeaef69e84"
  })
})();