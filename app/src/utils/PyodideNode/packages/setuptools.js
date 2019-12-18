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
    var PACKAGE_NAME = "setuptools.data";
    var REMOTE_PACKAGE_BASE = "setuptools.data";
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
      Module["FS_createPath"]("/lib/python3.7/site-packages", "pkg_resources", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/pkg_resources", "_vendor", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/pkg_resources/_vendor", "packaging", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/pkg_resources", "extern", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages", "setuptools-40.0.0-py3.7.egg-info", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages", "setuptools", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/setuptools", "_vendor", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/setuptools/_vendor", "packaging", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/setuptools", "command", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/setuptools", "extern", true, true);
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
          cachedOffset: 1021031,
          cachedIndexes: [-1, -1],
          cachedChunks: [null, null],
          offsets: [0, 1361, 2673, 4136, 5368, 6626, 7961, 9103, 10121, 11327, 12538, 13813, 15081, 16181, 17481, 18624, 19891, 21190, 22374, 23298, 24648, 26053, 27429, 28592, 29520, 30555, 31782, 32981, 34105, 35247, 36452, 37688, 38787, 40025, 41323, 42551, 43720, 44999, 46225, 47420, 48674, 49689, 50997, 52197, 53318, 54453, 55602, 56823, 58211, 59462, 60859, 62323, 63826, 64992, 66334, 67575, 68906, 70220, 71508, 72821, 73787, 74924, 76021, 77624, 78733, 79830, 80822, 81596, 82427, 83125, 83626, 84367, 85505, 86380, 87486, 88499, 89822, 91378, 92990, 94364, 95757, 97126, 98362, 99561, 100600, 101499, 102318, 103508, 104615, 105691, 106845, 107952, 108907, 110005, 111088, 112349, 113616, 114891, 116082, 117289, 118496, 119791, 120929, 122149, 123038, 123770, 124631, 125743, 126969, 128203, 129360, 130477, 131713, 132953, 133765, 134711, 135307, 136028, 137155, 138164, 139390, 140502, 141430, 142535, 143631, 144963, 146053, 147241, 148247, 149647, 150782, 151659, 152961, 154208, 155225, 156327, 157537, 158750, 159824, 160786, 161740, 162922, 163906, 165054, 166175, 167248, 168416, 169709, 170663, 171771, 172706, 173907, 175146, 176376, 177569, 178808, 179913, 180929, 182232, 183388, 184578, 185739, 186992, 188282, 189563, 190600, 191986, 193252, 194618, 195982, 197414, 198626, 199920, 201179, 202476, 203682, 205052, 206068, 207122, 208381, 209208, 210470, 211473, 212839, 213763, 214654, 215744, 216679, 218057, 219193, 220306, 221522, 222758, 223643, 224617, 225557, 226788, 227769, 228673, 229750, 230890, 231811, 232967, 234133, 234981, 236182, 237396, 238642, 239642, 240842, 241940, 243181, 244100, 245387, 246416, 247414, 248736, 249943, 251017, 251861, 252968, 254216, 255001, 255560, 256495, 257858, 259154, 260470, 261783, 263040, 264386, 265534, 266832, 268007, 269278, 270334, 271809, 273110, 274200, 275299, 276498, 277687, 279104, 280618, 281849, 282886, 284028, 285148, 286378, 287445, 288588, 289593, 290822, 292138, 293290, 294589, 295956, 297023, 298463, 299750, 300813, 302012, 303226, 304465, 305557, 306690, 307796, 309016, 310133, 311131, 311936, 313675, 315496, 317355, 319002, 320823, 322527, 324398, 326058, 327859, 329639, 331511, 333391, 335154, 336815, 338551, 340203, 341956, 343773, 345523, 347372, 349110, 350963, 352836, 354624, 356460, 358095, 358996, 360002, 361251, 362026, 362558, 363823, 364940, 366730, 368572, 370440, 372089, 373908, 375610, 377473, 379132, 380936, 382716, 384592, 386468, 388217, 389909, 391630, 393278, 395040, 396873, 398661, 400493, 402239, 404084, 405957, 407734, 409572, 411316, 412190, 413213, 414460, 415258, 415806, 416993, 418178, 419367, 420670, 422487, 424373, 426186, 427843, 429567, 431442, 433308, 434838, 436674, 438513, 440416, 442245, 444052, 445617, 447279, 448917, 450788, 452595, 454407, 456222, 457993, 459806, 461591, 463434, 465180, 466641, 467219, 468359, 469705, 470196, 471135, 472511, 473723, 474895, 476182, 477379, 478765, 480120, 481306, 482422, 483502, 484875, 486040, 486983, 488239, 490036, 491809, 493579, 495424, 497250, 498985, 500770, 502646, 504282, 506048, 507834, 509536, 511328, 513044, 514839, 516390, 518165, 520006, 521854, 523620, 525347, 527139, 528903, 530702, 532582, 534194, 535425, 536515, 537346, 538992, 540447, 541286, 541748, 542587, 543991, 545126, 546404, 547465, 548791, 549949, 550903, 551760, 552913, 553877, 554880, 555945, 556801, 557870, 559024, 559850, 560601, 561449, 562341, 563233, 563912, 565195, 566404, 567556, 568935, 569875, 571026, 571976, 573428, 574721, 575993, 577183, 578480, 579909, 581067, 582458, 583848, 585103, 586378, 587653, 588872, 590062, 591397, 592672, 593716, 594927, 595963, 597137, 598275, 599347, 600626, 601970, 603403, 604658, 606461, 608257, 610043, 611865, 613706, 615404, 617180, 619007, 620762, 622440, 624285, 625927, 627650, 629373, 631174, 632720, 634531, 636292, 638140, 639911, 641661, 643380, 645161, 646980, 648762, 650123, 651413, 652313, 653382, 654987, 656450, 657210, 657662, 658424, 660041, 661376, 662510, 663679, 665085, 666343, 668166, 670031, 671846, 673472, 675198, 677072, 678929, 680461, 682300, 684144, 686050, 687885, 689689, 691260, 692944, 694585, 696423, 698228, 700024, 701837, 703595, 705413, 707192, 709026, 710644, 712122, 712907, 713976, 715470, 715898, 716781, 718253, 719468, 720549, 721626, 722458, 723366, 724047, 724501, 725161, 726267, 727180, 728280, 729284, 730578, 732094, 733733, 735189, 736642, 738137, 739193, 740497, 741513, 742422, 743349, 744475, 745580, 746653, 747705, 748825, 749880, 750956, 752051, 753222, 754202, 755388, 756687, 757849, 759010, 760191, 761402, 762665, 763630, 764402, 765373, 766444, 767687, 768867, 770048, 771103, 772398, 773653, 774184, 775195, 775985, 776444, 777634, 778637, 779878, 781014, 782070, 783221, 784268, 785650, 786625, 787710, 788813, 790136, 791364, 792233, 793574, 794791, 795847, 796836, 798027, 799205, 800404, 801465, 802343, 803459, 804504, 805556, 806603, 807749, 808927, 810153, 811247, 812270, 813325, 814470, 815679, 816852, 818061, 819205, 820390, 821460, 822834, 823972, 825139, 826338, 827465, 828776, 830018, 831078, 832435, 833684, 834947, 836264, 837613, 838933, 840100, 841272, 842690, 843824, 845251, 846351, 847313, 848612, 849476, 850778, 851817, 853082, 854176, 855023, 856068, 857100, 858473, 859590, 860689, 861961, 863185, 863937, 864894, 865779, 866959, 867907, 868997, 869837, 871014, 872039, 873130, 874321, 875298, 876349, 877622, 878801, 879759, 881053, 882131, 883348, 884266, 885659, 886635, 887493, 888867, 890069, 891404, 892438, 893653, 894918, 896069, 897333, 897901, 898893, 900104, 901330, 902675, 903774, 905122, 906493, 907808, 908947, 910088, 911209, 912350, 913467, 914698, 916007, 917094, 918251, 919354, 920522, 921686, 923037, 924012, 924886, 926189, 927217, 928393, 929692, 930971, 932057, 933393, 934690, 935794, 936956, 938287, 939461, 940568, 941978, 943306, 944705, 946026, 947276, 948615, 949832, 951093, 952237, 953509, 954758, 956054, 957005, 958089, 959286, 960573, 961907, 963197, 964484, 965737, 966807, 967903, 969107, 970338, 971481, 972524, 973659, 974955, 976153, 977373, 978646, 979833, 981157, 982213, 983232, 984430, 985431, 986526, 987715, 988965, 990073, 991223, 992332, 993636, 994847, 996150, 997114, 998251, 999544, 1000674, 1001832, 1002971, 1004237, 1005448, 1006749, 1008154, 1009373, 1010534, 1011614, 1012767, 1013953, 1015120, 1016463, 1017710, 1018923, 1020148],
          sizes: [1361, 1312, 1463, 1232, 1258, 1335, 1142, 1018, 1206, 1211, 1275, 1268, 1100, 1300, 1143, 1267, 1299, 1184, 924, 1350, 1405, 1376, 1163, 928, 1035, 1227, 1199, 1124, 1142, 1205, 1236, 1099, 1238, 1298, 1228, 1169, 1279, 1226, 1195, 1254, 1015, 1308, 1200, 1121, 1135, 1149, 1221, 1388, 1251, 1397, 1464, 1503, 1166, 1342, 1241, 1331, 1314, 1288, 1313, 966, 1137, 1097, 1603, 1109, 1097, 992, 774, 831, 698, 501, 741, 1138, 875, 1106, 1013, 1323, 1556, 1612, 1374, 1393, 1369, 1236, 1199, 1039, 899, 819, 1190, 1107, 1076, 1154, 1107, 955, 1098, 1083, 1261, 1267, 1275, 1191, 1207, 1207, 1295, 1138, 1220, 889, 732, 861, 1112, 1226, 1234, 1157, 1117, 1236, 1240, 812, 946, 596, 721, 1127, 1009, 1226, 1112, 928, 1105, 1096, 1332, 1090, 1188, 1006, 1400, 1135, 877, 1302, 1247, 1017, 1102, 1210, 1213, 1074, 962, 954, 1182, 984, 1148, 1121, 1073, 1168, 1293, 954, 1108, 935, 1201, 1239, 1230, 1193, 1239, 1105, 1016, 1303, 1156, 1190, 1161, 1253, 1290, 1281, 1037, 1386, 1266, 1366, 1364, 1432, 1212, 1294, 1259, 1297, 1206, 1370, 1016, 1054, 1259, 827, 1262, 1003, 1366, 924, 891, 1090, 935, 1378, 1136, 1113, 1216, 1236, 885, 974, 940, 1231, 981, 904, 1077, 1140, 921, 1156, 1166, 848, 1201, 1214, 1246, 1e3, 1200, 1098, 1241, 919, 1287, 1029, 998, 1322, 1207, 1074, 844, 1107, 1248, 785, 559, 935, 1363, 1296, 1316, 1313, 1257, 1346, 1148, 1298, 1175, 1271, 1056, 1475, 1301, 1090, 1099, 1199, 1189, 1417, 1514, 1231, 1037, 1142, 1120, 1230, 1067, 1143, 1005, 1229, 1316, 1152, 1299, 1367, 1067, 1440, 1287, 1063, 1199, 1214, 1239, 1092, 1133, 1106, 1220, 1117, 998, 805, 1739, 1821, 1859, 1647, 1821, 1704, 1871, 1660, 1801, 1780, 1872, 1880, 1763, 1661, 1736, 1652, 1753, 1817, 1750, 1849, 1738, 1853, 1873, 1788, 1836, 1635, 901, 1006, 1249, 775, 532, 1265, 1117, 1790, 1842, 1868, 1649, 1819, 1702, 1863, 1659, 1804, 1780, 1876, 1876, 1749, 1692, 1721, 1648, 1762, 1833, 1788, 1832, 1746, 1845, 1873, 1777, 1838, 1744, 874, 1023, 1247, 798, 548, 1187, 1185, 1189, 1303, 1817, 1886, 1813, 1657, 1724, 1875, 1866, 1530, 1836, 1839, 1903, 1829, 1807, 1565, 1662, 1638, 1871, 1807, 1812, 1815, 1771, 1813, 1785, 1843, 1746, 1461, 578, 1140, 1346, 491, 939, 1376, 1212, 1172, 1287, 1197, 1386, 1355, 1186, 1116, 1080, 1373, 1165, 943, 1256, 1797, 1773, 1770, 1845, 1826, 1735, 1785, 1876, 1636, 1766, 1786, 1702, 1792, 1716, 1795, 1551, 1775, 1841, 1848, 1766, 1727, 1792, 1764, 1799, 1880, 1612, 1231, 1090, 831, 1646, 1455, 839, 462, 839, 1404, 1135, 1278, 1061, 1326, 1158, 954, 857, 1153, 964, 1003, 1065, 856, 1069, 1154, 826, 751, 848, 892, 892, 679, 1283, 1209, 1152, 1379, 940, 1151, 950, 1452, 1293, 1272, 1190, 1297, 1429, 1158, 1391, 1390, 1255, 1275, 1275, 1219, 1190, 1335, 1275, 1044, 1211, 1036, 1174, 1138, 1072, 1279, 1344, 1433, 1255, 1803, 1796, 1786, 1822, 1841, 1698, 1776, 1827, 1755, 1678, 1845, 1642, 1723, 1723, 1801, 1546, 1811, 1761, 1848, 1771, 1750, 1719, 1781, 1819, 1782, 1361, 1290, 900, 1069, 1605, 1463, 760, 452, 762, 1617, 1335, 1134, 1169, 1406, 1258, 1823, 1865, 1815, 1626, 1726, 1874, 1857, 1532, 1839, 1844, 1906, 1835, 1804, 1571, 1684, 1641, 1838, 1805, 1796, 1813, 1758, 1818, 1779, 1834, 1618, 1478, 785, 1069, 1494, 428, 883, 1472, 1215, 1081, 1077, 832, 908, 681, 454, 660, 1106, 913, 1100, 1004, 1294, 1516, 1639, 1456, 1453, 1495, 1056, 1304, 1016, 909, 927, 1126, 1105, 1073, 1052, 1120, 1055, 1076, 1095, 1171, 980, 1186, 1299, 1162, 1161, 1181, 1211, 1263, 965, 772, 971, 1071, 1243, 1180, 1181, 1055, 1295, 1255, 531, 1011, 790, 459, 1190, 1003, 1241, 1136, 1056, 1151, 1047, 1382, 975, 1085, 1103, 1323, 1228, 869, 1341, 1217, 1056, 989, 1191, 1178, 1199, 1061, 878, 1116, 1045, 1052, 1047, 1146, 1178, 1226, 1094, 1023, 1055, 1145, 1209, 1173, 1209, 1144, 1185, 1070, 1374, 1138, 1167, 1199, 1127, 1311, 1242, 1060, 1357, 1249, 1263, 1317, 1349, 1320, 1167, 1172, 1418, 1134, 1427, 1100, 962, 1299, 864, 1302, 1039, 1265, 1094, 847, 1045, 1032, 1373, 1117, 1099, 1272, 1224, 752, 957, 885, 1180, 948, 1090, 840, 1177, 1025, 1091, 1191, 977, 1051, 1273, 1179, 958, 1294, 1078, 1217, 918, 1393, 976, 858, 1374, 1202, 1335, 1034, 1215, 1265, 1151, 1264, 568, 992, 1211, 1226, 1345, 1099, 1348, 1371, 1315, 1139, 1141, 1121, 1141, 1117, 1231, 1309, 1087, 1157, 1103, 1168, 1164, 1351, 975, 874, 1303, 1028, 1176, 1299, 1279, 1086, 1336, 1297, 1104, 1162, 1331, 1174, 1107, 1410, 1328, 1399, 1321, 1250, 1339, 1217, 1261, 1144, 1272, 1249, 1296, 951, 1084, 1197, 1287, 1334, 1290, 1287, 1253, 1070, 1096, 1204, 1231, 1143, 1043, 1135, 1296, 1198, 1220, 1273, 1187, 1324, 1056, 1019, 1198, 1001, 1095, 1189, 1250, 1108, 1150, 1109, 1304, 1211, 1303, 964, 1137, 1293, 1130, 1158, 1139, 1266, 1211, 1301, 1405, 1219, 1161, 1080, 1153, 1186, 1167, 1343, 1247, 1213, 1225, 883],
          successes: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        };
        compressedData.data = byteArray;
        assert(typeof Module.LZ4 === "object", "LZ4 not present - was your app build with  -s LZ4=1  ?");
        Module.LZ4.loadPackage({
          metadata: metadata,
          compressedData: compressedData
        });
        Module["removeRunDependency"]("datafile_setuptools.data")
      }
      Module["addRunDependency"]("datafile_setuptools.data");
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
      filename: "/lib/python3.7/site-packages/easy_install.py",
      start: 0,
      end: 126,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/__init__.py",
      start: 126,
      end: 103939,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/py31compat.py",
      start: 103939,
      end: 104492,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/__init__.py",
      start: 104492,
      end: 104492,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/appdirs.py",
      start: 104492,
      end: 126866,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/six.py",
      start: 126866,
      end: 156964,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/pyparsing.py",
      start: 156964,
      end: 386831,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/packaging/__init__.py",
      start: 386831,
      end: 387344,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/packaging/utils.py",
      start: 387344,
      end: 387765,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/packaging/_compat.py",
      start: 387765,
      end: 388625,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/packaging/requirements.py",
      start: 388625,
      end: 392980,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/packaging/_structures.py",
      start: 392980,
      end: 394396,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/packaging/specifiers.py",
      start: 394396,
      end: 422421,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/packaging/markers.py",
      start: 422421,
      end: 430669,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/packaging/__about__.py",
      start: 430669,
      end: 431389,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/packaging/version.py",
      start: 431389,
      end: 442945,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/extern/__init__.py",
      start: 442945,
      end: 445443,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools-40.0.0-py3.7.egg-info/top_level.txt",
      start: 445443,
      end: 445481,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools-40.0.0-py3.7.egg-info/entry_points.txt",
      start: 445481,
      end: 448471,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools-40.0.0-py3.7.egg-info/PKG-INFO",
      start: 448471,
      end: 451696,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools-40.0.0-py3.7.egg-info/SOURCES.txt",
      start: 451696,
      end: 458300,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools-40.0.0-py3.7.egg-info/dependency_links.txt",
      start: 458300,
      end: 458539,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools-40.0.0-py3.7.egg-info/zip-safe",
      start: 458539,
      end: 458540,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools-40.0.0-py3.7.egg-info/requires.txt",
      start: 458540,
      end: 458615,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/__init__.py",
      start: 458615,
      end: 464329,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/unicode_utils.py",
      start: 464329,
      end: 465325,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/pep425tags.py",
      start: 465325,
      end: 476202,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/namespaces.py",
      start: 476202,
      end: 479401,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/lib2to3_ex.py",
      start: 479401,
      end: 481414,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/glibc.py",
      start: 481414,
      end: 484564,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/dist.py",
      start: 484564,
      end: 527177,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/script (dev).tmpl",
      start: 527177,
      end: 527395,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/archive_util.py",
      start: 527395,
      end: 533987,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/config.py",
      start: 533987,
      end: 552008,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/cli.exe",
      start: 552008,
      end: 617544,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/py33compat.py",
      start: 617544,
      end: 618739,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/launch.py",
      start: 618739,
      end: 619526,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/gui-32.exe",
      start: 619526,
      end: 685062,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/py36compat.py",
      start: 685062,
      end: 687953,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/site-patch.py",
      start: 687953,
      end: 690255,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/gui.exe",
      start: 690255,
      end: 755791,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/dep_util.py",
      start: 755791,
      end: 756726,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/monkey.py",
      start: 756726,
      end: 761930,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/depends.py",
      start: 761930,
      end: 767767,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/wheel.py",
      start: 767767,
      end: 775869,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/py31compat.py",
      start: 775869,
      end: 776689,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/build_meta.py",
      start: 776689,
      end: 782360,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/gui-64.exe",
      start: 782360,
      end: 857624,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/msvc.py",
      start: 857624,
      end: 898501,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/sandbox.py",
      start: 898501,
      end: 912777,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/ssl_support.py",
      start: 912777,
      end: 921269,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/script.tmpl",
      start: 921269,
      end: 921407,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/package_index.py",
      start: 921407,
      end: 961717,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/py27compat.py",
      start: 961717,
      end: 962253,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/cli-64.exe",
      start: 962253,
      end: 1037005,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/glob.py",
      start: 1037005,
      end: 1042212,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/extension.py",
      start: 1042212,
      end: 1043941,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/windows_support.py",
      start: 1043941,
      end: 1044659,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/version.py",
      start: 1044659,
      end: 1044803,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/cli-32.exe",
      start: 1044803,
      end: 1110339,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/__init__.py",
      start: 1110339,
      end: 1110339,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/six.py",
      start: 1110339,
      end: 1140437,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/pyparsing.py",
      start: 1140437,
      end: 1370304,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/__init__.py",
      start: 1370304,
      end: 1370817,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/utils.py",
      start: 1370817,
      end: 1371238,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/_compat.py",
      start: 1371238,
      end: 1372098,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/requirements.py",
      start: 1372098,
      end: 1376441,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/_structures.py",
      start: 1376441,
      end: 1377857,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/specifiers.py",
      start: 1377857,
      end: 1405882,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/markers.py",
      start: 1405882,
      end: 1414121,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/__about__.py",
      start: 1414121,
      end: 1414841,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/version.py",
      start: 1414841,
      end: 1426397,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/__init__.py",
      start: 1426397,
      end: 1426991,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/bdist_wininst.py",
      start: 1426991,
      end: 1427628,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/egg_info.py",
      start: 1427628,
      end: 1452428,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/easy_install.py",
      start: 1452428,
      end: 1539479,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/build_clib.py",
      start: 1539479,
      end: 1543963,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/install_scripts.py",
      start: 1543963,
      end: 1546402,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/dist_info.py",
      start: 1546402,
      end: 1547362,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/launcher manifest.xml",
      start: 1547362,
      end: 1547990,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/sdist.py",
      start: 1547990,
      end: 1554701,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/py36compat.py",
      start: 1554701,
      end: 1559687,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/install_lib.py",
      start: 1559687,
      end: 1563527,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/test.py",
      start: 1563527,
      end: 1572755,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/upload_docs.py",
      start: 1572755,
      end: 1580066,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/build_ext.py",
      start: 1580066,
      end: 1592963,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/saveopts.py",
      start: 1592963,
      end: 1593621,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/alias.py",
      start: 1593621,
      end: 1596047,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/build_py.py",
      start: 1596047,
      end: 1605643,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/install_egg_info.py",
      start: 1605643,
      end: 1607846,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/setopt.py",
      start: 1607846,
      end: 1612931,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/bdist_egg.py",
      start: 1612931,
      end: 1631118,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/develop.py",
      start: 1631118,
      end: 1639178,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/bdist_rpm.py",
      start: 1639178,
      end: 1640686,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/install.py",
      start: 1640686,
      end: 1645369,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/upload.py",
      start: 1645369,
      end: 1646541,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/rotate.py",
      start: 1646541,
      end: 1648705,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/register.py",
      start: 1648705,
      end: 1648975,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/extern/__init__.py",
      start: 1648975,
      end: 1651476,
      audio: 0
    }, {
      filename: "/bin/easy_install",
      start: 1651476,
      end: 1651931,
      audio: 0
    }, {
      filename: "/bin/easy_install-3.7",
      start: 1651931,
      end: 1652394,
      audio: 0
    }],
    remote_package_size: 1025127,
    package_uuid: "4ed9248d-4bf7-49ce-b1fa-9b403aa32538"
  })
})();