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
      Module["FS_createPath"]("/lib/python3.7/site-packages", "jadnschema-0.1.dev12+g4830ccb-py3.7.egg-info", true, true);
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
      Module["FS_createPath"]("/lib/python3.7/site-packages/jadnschema/schema", "definitions", true, true);
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
          cachedOffset: 101198,
          cachedIndexes: [-1, -1],
          cachedChunks: [null, null],
          offsets: [0, 981, 2038, 3272, 4271, 5368, 6386, 7477, 8594, 9705, 10474, 11436, 12470, 13657, 14894, 16048, 17151, 18179, 19344, 20391, 21313, 22225, 23246, 24476, 25463, 26664, 27881, 29144, 30165, 31058, 31862, 32798, 34013, 35166, 35974, 36866, 37874, 39045, 40237, 41399, 42332, 43239, 44061, 45092, 46369, 47520, 48619, 49842, 50993, 52234, 53413, 54292, 55444, 56616, 57740, 58686, 59605, 60551, 61548, 62711, 63953, 65117, 66286, 67376, 68480, 69436, 70684, 71848, 72907, 74162, 75264, 76551, 77659, 78662, 79915, 80827, 81747, 82541, 83297, 84402, 85608, 86581, 87367, 88655, 89872, 91048, 92223, 93233, 94293, 95131, 96380, 97586, 98784, 99906, 101039],
          sizes: [981, 1057, 1234, 999, 1097, 1018, 1091, 1117, 1111, 769, 962, 1034, 1187, 1237, 1154, 1103, 1028, 1165, 1047, 922, 912, 1021, 1230, 987, 1201, 1217, 1263, 1021, 893, 804, 936, 1215, 1153, 808, 892, 1008, 1171, 1192, 1162, 933, 907, 822, 1031, 1277, 1151, 1099, 1223, 1151, 1241, 1179, 879, 1152, 1172, 1124, 946, 919, 946, 997, 1163, 1242, 1164, 1169, 1090, 1104, 956, 1248, 1164, 1059, 1255, 1102, 1287, 1108, 1003, 1253, 912, 920, 794, 756, 1105, 1206, 973, 786, 1288, 1217, 1176, 1175, 1010, 1060, 838, 1249, 1206, 1198, 1122, 1133, 159],
          successes: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
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
      filename: "/lib/python3.7/site-packages/jadnschema-0.1.dev12+g4830ccb-py3.7.egg-info/top_level.txt",
      start: 0,
      end: 11,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema-0.1.dev12+g4830ccb-py3.7.egg-info/entry_points.txt",
      start: 11,
      end: 63,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema-0.1.dev12+g4830ccb-py3.7.egg-info/PKG-INFO",
      start: 63,
      end: 698,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema-0.1.dev12+g4830ccb-py3.7.egg-info/SOURCES.txt",
      start: 698,
      end: 2998,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema-0.1.dev12+g4830ccb-py3.7.egg-info/dependency_links.txt",
      start: 2998,
      end: 2999,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema-0.1.dev12+g4830ccb-py3.7.egg-info/requires.txt",
      start: 2999,
      end: 3156,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/__init__.py",
      start: 3156,
      end: 3493,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/utils.py",
      start: 3493,
      end: 9959,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/jadn.py",
      start: 9959,
      end: 12693,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/exceptions.py",
      start: 12693,
      end: 13194,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/base.py",
      start: 13194,
      end: 14578,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/cli.py",
      start: 14578,
      end: 17310,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/__init__.py",
      start: 17310,
      end: 18162,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/__init__.py",
      start: 18162,
      end: 23822,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/enums.py",
      start: 23822,
      end: 24181,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/base.py",
      start: 24181,
      end: 30955,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/readers/__init__.py",
      start: 30955,
      end: 30968,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/__init__.py",
      start: 30968,
      end: 31226,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/json_schema.py",
      start: 31226,
      end: 51899,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/jadn.py",
      start: 51899,
      end: 53032,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/jadn_idl.py",
      start: 53032,
      end: 65004,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/markdown.py",
      start: 65004,
      end: 75827,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/html/__init__.py",
      start: 75827,
      end: 91892,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/html/theme.less",
      start: 91892,
      end: 93360,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/schema/writers/html/theme.css",
      start: 93360,
      end: 94818,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/message/__init__.py",
      start: 94818,
      end: 94914,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/message/message.py",
      start: 94914,
      end: 96790,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/message/serializations/__init__.py",
      start: 96790,
      end: 99287,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/convert/message/serializations/xml.py",
      start: 99287,
      end: 100752,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/__init__.py",
      start: 100752,
      end: 100992,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/schema.py",
      start: 100992,
      end: 126189,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/base.py",
      start: 126189,
      end: 133621,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/options.py",
      start: 133621,
      end: 144869,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/fields.py",
      start: 144869,
      end: 149728,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/__init__.py",
      start: 149728,
      end: 150181,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/network.py",
      start: 150181,
      end: 155153,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/rfc_3339.py",
      start: 155153,
      end: 157015,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/rfc_3987.py",
      start: 157015,
      end: 158343,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/constants.py",
      start: 158343,
      end: 158434,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/rfc_3986.py",
      start: 158434,
      end: 159749,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/jadn_idna.py",
      start: 159749,
      end: 161590,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/formats/general.py",
      start: 161590,
      end: 168521,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/definitions/record.py",
      start: 168521,
      end: 170074,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/definitions/__init__.py",
      start: 170074,
      end: 171254,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/definitions/arrayOf.py",
      start: 171254,
      end: 173489,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/definitions/base.py",
      start: 173489,
      end: 182961,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/definitions/map.py",
      start: 182961,
      end: 184452,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/definitions/enumerated.py",
      start: 184452,
      end: 185370,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/definitions/mapOf.py",
      start: 185370,
      end: 187049,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/definitions/choice.py",
      start: 187049,
      end: 188269,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/definitions/array.py",
      start: 188269,
      end: 189680,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/jadnschema/schema/definitions/custom.py",
      start: 189680,
      end: 192201,
      audio: 0
    }, {
      filename: "/bin/jadnschema",
      start: 192201,
      end: 192688,
      audio: 0
    }],
    remote_package_size: 105294,
    package_uuid: "79f83982-4255-44f4-89d5-6aab8562822f"
  })
})();