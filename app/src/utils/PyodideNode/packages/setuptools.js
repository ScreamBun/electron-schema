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
      Module["FS_createPath"]("/lib/python3.7/site-packages", "pkg_resources", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/pkg_resources", "_vendor", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/pkg_resources/_vendor", "packaging", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages/pkg_resources", "extern", true, true);
      Module["FS_createPath"]("/lib/python3.7/site-packages", "setuptools-45.2.0-py3.7.egg-info", true, true);
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
          cachedOffset: 1052303,
          cachedIndexes: [-1, -1],
          cachedChunks: [null, null],
          offsets: [0, 1384, 2606, 4062, 5333, 6611, 7911, 9124, 10141, 11376, 12593, 13858, 15115, 16198, 17513, 18643, 19952, 21222, 22419, 23400, 24726, 26131, 27535, 28708, 29735, 30676, 31646, 32863, 34144, 35363, 36402, 37494, 38705, 39952, 41099, 42418, 43675, 44848, 46097, 47396, 48679, 49843, 51007, 52162, 53383, 54626, 55752, 56880, 57953, 59192, 60563, 61786, 63162, 64578, 66171, 67573, 68775, 70013, 71321, 72646, 74030, 75267, 76653, 77805, 78990, 80032, 81150, 82649, 83712, 84838, 85688, 86492, 87234, 87911, 88553, 89449, 90417, 91440, 92506, 93542, 94910, 96533, 98002, 99343, 100801, 102322, 103375, 104652, 105726, 106641, 107628, 108716, 109863, 110893, 111958, 113077, 114167, 115171, 116281, 117415, 118447, 119641, 120991, 122162, 123308, 124511, 125753, 127037, 128047, 128854, 129821, 130695, 131870, 133093, 134343, 135294, 136531, 137656, 138603, 139661, 140475, 140922, 141901, 143027, 144198, 145287, 146506, 147404, 148449, 149628, 150919, 151982, 153229, 154403, 155776, 156651, 157650, 158978, 160150, 161016, 162130, 163458, 164692, 165805, 166672, 167536, 168604, 169510, 170729, 171902, 172954, 174081, 175310, 176302, 177459, 178312, 179495, 180554, 181698, 182891, 184160, 185320, 186522, 187691, 188896, 190121, 191237, 192515, 193802, 195116, 196427, 197676, 198941, 200271, 201644, 203058, 204195, 205275, 206620, 207814, 209189, 210427, 211258, 212403, 213721, 214580, 215773, 216903, 218220, 218932, 219846, 221070, 222119, 223377, 224503, 225729, 226981, 228091, 229098, 230141, 231254, 232447, 233438, 234245, 235413, 236432, 237271, 238455, 239635, 240407, 241632, 242749, 243937, 245104, 246183, 247360, 248581, 249620, 250849, 251711, 252861, 254117, 255320, 256348, 257271, 258366, 259679, 260516, 261277, 262184, 263617, 264871, 266200, 267469, 268668, 269986, 271052, 272168, 273179, 274367, 275542, 276549, 277972, 279425, 280710, 281777, 282877, 284065, 285315, 286316, 287501, 288639, 289543, 290717, 291554, 292864, 294074, 295316, 296560, 297821, 299011, 300437, 301587, 302759, 304e3, 305319, 306625, 307892, 309193, 310307, 311506, 312610, 313722, 314946, 316142, 317144, 317894, 319199, 321021, 322914, 324715, 326404, 328124, 330005, 331855, 333399, 335245, 337088, 338988, 340827, 342644, 344248, 345895, 347495, 349369, 351132, 352920, 354799, 356586, 358402, 360177, 362054, 363654, 365097, 365694, 366854, 368144, 368638, 369579, 370960, 372262, 374084, 375968, 377780, 379435, 381149, 383026, 384887, 386419, 388250, 390093, 391989, 393823, 395624, 397186, 398841, 400486, 402336, 404138, 405952, 407772, 409543, 411361, 413139, 414983, 416725, 418177, 418767, 419907, 421279, 421770, 422703, 423900, 425059, 426886, 428741, 430612, 432210, 434025, 435752, 437630, 439253, 441087, 442892, 444778, 446609, 448407, 450022, 451763, 453470, 455262, 457068, 458867, 460650, 462483, 464307, 466129, 467919, 469700, 471324, 472060, 473102, 474522, 475126, 475881, 477085, 478403, 479628, 480747, 481912, 483260, 484588, 485788, 486945, 487945, 489096, 490462, 491685, 493074, 494026, 495220, 496422, 497922, 499674, 501495, 503332, 505154, 506989, 508686, 510470, 512230, 513996, 515713, 517525, 519156, 520899, 522626, 524411, 526017, 527846, 529623, 531417, 533181, 534910, 536602, 538352, 540156, 541956, 543231, 544624, 545341, 546736, 548266, 549630, 550223, 550621, 551516, 553320, 554237, 555407, 556443, 557680, 558334, 559101, 559959, 561181, 562201, 563292, 564273, 565304, 566231, 567006, 568290, 569009, 569853, 570707, 571559, 572390, 573299, 574137, 575250, 576582, 577776, 578895, 580302, 581230, 582412, 583349, 584806, 586012, 587210, 588395, 589724, 591060, 592238, 593594, 594962, 596253, 597503, 598780, 600015, 601281, 602623, 603887, 604973, 606152, 607166, 608304, 609486, 610652, 611918, 613302, 614706, 615864, 617610, 619373, 621154, 622969, 624788, 626540, 628320, 630169, 631829, 633634, 635385, 637170, 638895, 640590, 642361, 644003, 645677, 647516, 649347, 651067, 652788, 654616, 656394, 658155, 660013, 661752, 662653, 664076, 664657, 666347, 667760, 669037, 669455, 670076, 671190, 672962, 673969, 675020, 676344, 677622, 679252, 681073, 682940, 684609, 686423, 688131, 690024, 691718, 693510, 695300, 697173, 699052, 700810, 702506, 704232, 705898, 707639, 709477, 711264, 713109, 714871, 716713, 718587, 720360, 722211, 723853, 724861, 725835, 727032, 727819, 728356, 729745, 731218, 732306, 733402, 734243, 735108, 735796, 736471, 737123, 738094, 739058, 740108, 741188, 742283, 743680, 745083, 746237, 747369, 748377, 749487, 750358, 751427, 752546, 754099, 755472, 756930, 758384, 759552, 760827, 761978, 762984, 763969, 764888, 765993, 767019, 768141, 769261, 770471, 771297, 772465, 773531, 774504, 775736, 776914, 778023, 779205, 780424, 781733, 782871, 784011, 784710, 785595, 786302, 787394, 788617, 789850, 791018, 792168, 793334, 794592, 795386, 796334, 796944, 797661, 798780, 799785, 801014, 802122, 803062, 804177, 805275, 806613, 807701, 808884, 809903, 811296, 812437, 813304, 814604, 815847, 816872, 817970, 819185, 820413, 821493, 822469, 823422, 824620, 825616, 826761, 827881, 828952, 830122, 831412, 832363, 833476, 834418, 835622, 836863, 838103, 839303, 840533, 841647, 842670, 843978, 845138, 846328, 847494, 848733, 850029, 851311, 852352, 853746, 855012, 856379, 857742, 859172, 860368, 861652, 862900, 864200, 865424, 866794, 867813, 868789, 870054, 870914, 872162, 873195, 874523, 875542, 876380, 877474, 878394, 879751, 880873, 881991, 883290, 884233, 885315, 886693, 887868, 889023, 890182, 891428, 892583, 893349, 894305, 895208, 896392, 897359, 898398, 899298, 900500, 901504, 902633, 903831, 904757, 905912, 907145, 908403, 909355, 910567, 911666, 912870, 913662, 915037, 916077, 916818, 918186, 919411, 920758, 921737, 922960, 924242, 925393, 926707, 927281, 928267, 929318, 930504, 931775, 932953, 934348, 935693, 937020, 938150, 939368, 940484, 941506, 942635, 943874, 945091, 946427, 947481, 948640, 949723, 950850, 952006, 953201, 954170, 955172, 956452, 957583, 958832, 960070, 961337, 962522, 963911, 965142, 966198, 967445, 968718, 969873, 970953, 972399, 973847, 975204, 976538, 977893, 979263, 980538, 981677, 982816, 983963, 985249, 986572, 987453, 988567, 989836, 991184, 992427, 993594, 994897, 996232, 997295, 998260, 999453, 1000590, 1001810, 1002924, 1004007, 1005298, 1006648, 1007743, 1008970, 1010163, 1011477, 1012710, 1013728, 1014736, 1015952, 1016912, 1018241, 1019330, 1020512, 1021641, 1022778, 1023971, 1025278, 1026572, 1027710, 1028713, 1029969, 1031172, 1032319, 1033358, 1034612, 1035944, 1037120, 1038437, 1039856, 1041073, 1042203, 1043259, 1044441, 1045668, 1046744, 1048060, 1049321, 1050629, 1051920],
          sizes: [1384, 1222, 1456, 1271, 1278, 1300, 1213, 1017, 1235, 1217, 1265, 1257, 1083, 1315, 1130, 1309, 1270, 1197, 981, 1326, 1405, 1404, 1173, 1027, 941, 970, 1217, 1281, 1219, 1039, 1092, 1211, 1247, 1147, 1319, 1257, 1173, 1249, 1299, 1283, 1164, 1164, 1155, 1221, 1243, 1126, 1128, 1073, 1239, 1371, 1223, 1376, 1416, 1593, 1402, 1202, 1238, 1308, 1325, 1384, 1237, 1386, 1152, 1185, 1042, 1118, 1499, 1063, 1126, 850, 804, 742, 677, 642, 896, 968, 1023, 1066, 1036, 1368, 1623, 1469, 1341, 1458, 1521, 1053, 1277, 1074, 915, 987, 1088, 1147, 1030, 1065, 1119, 1090, 1004, 1110, 1134, 1032, 1194, 1350, 1171, 1146, 1203, 1242, 1284, 1010, 807, 967, 874, 1175, 1223, 1250, 951, 1237, 1125, 947, 1058, 814, 447, 979, 1126, 1171, 1089, 1219, 898, 1045, 1179, 1291, 1063, 1247, 1174, 1373, 875, 999, 1328, 1172, 866, 1114, 1328, 1234, 1113, 867, 864, 1068, 906, 1219, 1173, 1052, 1127, 1229, 992, 1157, 853, 1183, 1059, 1144, 1193, 1269, 1160, 1202, 1169, 1205, 1225, 1116, 1278, 1287, 1314, 1311, 1249, 1265, 1330, 1373, 1414, 1137, 1080, 1345, 1194, 1375, 1238, 831, 1145, 1318, 859, 1193, 1130, 1317, 712, 914, 1224, 1049, 1258, 1126, 1226, 1252, 1110, 1007, 1043, 1113, 1193, 991, 807, 1168, 1019, 839, 1184, 1180, 772, 1225, 1117, 1188, 1167, 1079, 1177, 1221, 1039, 1229, 862, 1150, 1256, 1203, 1028, 923, 1095, 1313, 837, 761, 907, 1433, 1254, 1329, 1269, 1199, 1318, 1066, 1116, 1011, 1188, 1175, 1007, 1423, 1453, 1285, 1067, 1100, 1188, 1250, 1001, 1185, 1138, 904, 1174, 837, 1310, 1210, 1242, 1244, 1261, 1190, 1426, 1150, 1172, 1241, 1319, 1306, 1267, 1301, 1114, 1199, 1104, 1112, 1224, 1196, 1002, 750, 1305, 1822, 1893, 1801, 1689, 1720, 1881, 1850, 1544, 1846, 1843, 1900, 1839, 1817, 1604, 1647, 1600, 1874, 1763, 1788, 1879, 1787, 1816, 1775, 1877, 1600, 1443, 597, 1160, 1290, 494, 941, 1381, 1302, 1822, 1884, 1812, 1655, 1714, 1877, 1861, 1532, 1831, 1843, 1896, 1834, 1801, 1562, 1655, 1645, 1850, 1802, 1814, 1820, 1771, 1818, 1778, 1844, 1742, 1452, 590, 1140, 1372, 491, 933, 1197, 1159, 1827, 1855, 1871, 1598, 1815, 1727, 1878, 1623, 1834, 1805, 1886, 1831, 1798, 1615, 1741, 1707, 1792, 1806, 1799, 1783, 1833, 1824, 1822, 1790, 1781, 1624, 736, 1042, 1420, 604, 755, 1204, 1318, 1225, 1119, 1165, 1348, 1328, 1200, 1157, 1e3, 1151, 1366, 1223, 1389, 952, 1194, 1202, 1500, 1752, 1821, 1837, 1822, 1835, 1697, 1784, 1760, 1766, 1717, 1812, 1631, 1743, 1727, 1785, 1606, 1829, 1777, 1794, 1764, 1729, 1692, 1750, 1804, 1800, 1275, 1393, 717, 1395, 1530, 1364, 593, 398, 895, 1804, 917, 1170, 1036, 1237, 654, 767, 858, 1222, 1020, 1091, 981, 1031, 927, 775, 1284, 719, 844, 854, 852, 831, 909, 838, 1113, 1332, 1194, 1119, 1407, 928, 1182, 937, 1457, 1206, 1198, 1185, 1329, 1336, 1178, 1356, 1368, 1291, 1250, 1277, 1235, 1266, 1342, 1264, 1086, 1179, 1014, 1138, 1182, 1166, 1266, 1384, 1404, 1158, 1746, 1763, 1781, 1815, 1819, 1752, 1780, 1849, 1660, 1805, 1751, 1785, 1725, 1695, 1771, 1642, 1674, 1839, 1831, 1720, 1721, 1828, 1778, 1761, 1858, 1739, 901, 1423, 581, 1690, 1413, 1277, 418, 621, 1114, 1772, 1007, 1051, 1324, 1278, 1630, 1821, 1867, 1669, 1814, 1708, 1893, 1694, 1792, 1790, 1873, 1879, 1758, 1696, 1726, 1666, 1741, 1838, 1787, 1845, 1762, 1842, 1874, 1773, 1851, 1642, 1008, 974, 1197, 787, 537, 1389, 1473, 1088, 1096, 841, 865, 688, 675, 652, 971, 964, 1050, 1080, 1095, 1397, 1403, 1154, 1132, 1008, 1110, 871, 1069, 1119, 1553, 1373, 1458, 1454, 1168, 1275, 1151, 1006, 985, 919, 1105, 1026, 1122, 1120, 1210, 826, 1168, 1066, 973, 1232, 1178, 1109, 1182, 1219, 1309, 1138, 1140, 699, 885, 707, 1092, 1223, 1233, 1168, 1150, 1166, 1258, 794, 948, 610, 717, 1119, 1005, 1229, 1108, 940, 1115, 1098, 1338, 1088, 1183, 1019, 1393, 1141, 867, 1300, 1243, 1025, 1098, 1215, 1228, 1080, 976, 953, 1198, 996, 1145, 1120, 1071, 1170, 1290, 951, 1113, 942, 1204, 1241, 1240, 1200, 1230, 1114, 1023, 1308, 1160, 1190, 1166, 1239, 1296, 1282, 1041, 1394, 1266, 1367, 1363, 1430, 1196, 1284, 1248, 1300, 1224, 1370, 1019, 976, 1265, 860, 1248, 1033, 1328, 1019, 838, 1094, 920, 1357, 1122, 1118, 1299, 943, 1082, 1378, 1175, 1155, 1159, 1246, 1155, 766, 956, 903, 1184, 967, 1039, 900, 1202, 1004, 1129, 1198, 926, 1155, 1233, 1258, 952, 1212, 1099, 1204, 792, 1375, 1040, 741, 1368, 1225, 1347, 979, 1223, 1282, 1151, 1314, 574, 986, 1051, 1186, 1271, 1178, 1395, 1345, 1327, 1130, 1218, 1116, 1022, 1129, 1239, 1217, 1336, 1054, 1159, 1083, 1127, 1156, 1195, 969, 1002, 1280, 1131, 1249, 1238, 1267, 1185, 1389, 1231, 1056, 1247, 1273, 1155, 1080, 1446, 1448, 1357, 1334, 1355, 1370, 1275, 1139, 1139, 1147, 1286, 1323, 881, 1114, 1269, 1348, 1243, 1167, 1303, 1335, 1063, 965, 1193, 1137, 1220, 1114, 1083, 1291, 1350, 1095, 1227, 1193, 1314, 1233, 1018, 1008, 1216, 960, 1329, 1089, 1182, 1129, 1137, 1193, 1307, 1294, 1138, 1003, 1256, 1203, 1147, 1039, 1254, 1332, 1176, 1317, 1419, 1217, 1130, 1056, 1182, 1227, 1076, 1316, 1261, 1308, 1291, 383],
          successes: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
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
      end: 108522,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/py2_warn.py",
      start: 108522,
      end: 109245,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/py31compat.py",
      start: 109245,
      end: 109803,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/__init__.py",
      start: 109803,
      end: 109803,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/appdirs.py",
      start: 109803,
      end: 134504,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/six.py",
      start: 134504,
      end: 164602,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/pyparsing.py",
      start: 164602,
      end: 396657,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/packaging/__init__.py",
      start: 396657,
      end: 397170,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/packaging/utils.py",
      start: 397170,
      end: 397591,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/packaging/_compat.py",
      start: 397591,
      end: 398451,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/packaging/requirements.py",
      start: 398451,
      end: 402806,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/packaging/_structures.py",
      start: 402806,
      end: 404222,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/packaging/specifiers.py",
      start: 404222,
      end: 432247,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/packaging/markers.py",
      start: 432247,
      end: 440495,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/packaging/__about__.py",
      start: 440495,
      end: 441215,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/_vendor/packaging/version.py",
      start: 441215,
      end: 452771,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/pkg_resources/extern/__init__.py",
      start: 452771,
      end: 455269,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools-45.2.0-py3.7.egg-info/top_level.txt",
      start: 455269,
      end: 455307,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools-45.2.0-py3.7.egg-info/entry_points.txt",
      start: 455307,
      end: 458513,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools-45.2.0-py3.7.egg-info/PKG-INFO",
      start: 458513,
      end: 462458,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools-45.2.0-py3.7.egg-info/SOURCES.txt",
      start: 462458,
      end: 468554,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools-45.2.0-py3.7.egg-info/dependency_links.txt",
      start: 468554,
      end: 468793,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools-45.2.0-py3.7.egg-info/zip-safe",
      start: 468793,
      end: 468794,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools-45.2.0-py3.7.egg-info/requires.txt",
      start: 468794,
      end: 469157,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/__init__.py",
      start: 469157,
      end: 476430,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/unicode_utils.py",
      start: 476430,
      end: 477426,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/namespaces.py",
      start: 477426,
      end: 480649,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/lib2to3_ex.py",
      start: 480649,
      end: 482662,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/dist.py",
      start: 482662,
      end: 532526,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/script (dev).tmpl",
      start: 532526,
      end: 532744,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/archive_util.py",
      start: 532744,
      end: 539370,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/installer.py",
      start: 539370,
      end: 544706,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/config.py",
      start: 544706,
      end: 565281,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/cli.exe",
      start: 565281,
      end: 630817,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/py33compat.py",
      start: 630817,
      end: 632147,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/launch.py",
      start: 632147,
      end: 632934,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/gui-32.exe",
      start: 632934,
      end: 698470,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/site-patch.py",
      start: 698470,
      end: 700816,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/py34compat.py",
      start: 700816,
      end: 701061,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/gui.exe",
      start: 701061,
      end: 766597,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/dep_util.py",
      start: 766597,
      end: 767546,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/monkey.py",
      start: 767546,
      end: 772810,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/depends.py",
      start: 772810,
      end: 778327,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/wheel.py",
      start: 778327,
      end: 786795,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_imp.py",
      start: 786795,
      end: 789183,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/py31compat.py",
      start: 789183,
      end: 790021,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/build_meta.py",
      start: 790021,
      end: 799981,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/gui-64.exe",
      start: 799981,
      end: 875245,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/msvc.py",
      start: 875245,
      end: 922052,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/errors.py",
      start: 922052,
      end: 922576,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_deprecation_warning.py",
      start: 922576,
      end: 922794,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/sandbox.py",
      start: 922794,
      end: 937078,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/ssl_support.py",
      start: 937078,
      end: 945621,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/script.tmpl",
      start: 945621,
      end: 945759,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/package_index.py",
      start: 945759,
      end: 986373,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/py27compat.py",
      start: 986373,
      end: 987877,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/cli-64.exe",
      start: 987877,
      end: 1062629,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/glob.py",
      start: 1062629,
      end: 1067713,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/extension.py",
      start: 1067713,
      end: 1069442,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/windows_support.py",
      start: 1069442,
      end: 1070156,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/version.py",
      start: 1070156,
      end: 1070300,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/cli-32.exe",
      start: 1070300,
      end: 1135836,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/__init__.py",
      start: 1135836,
      end: 1135836,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/six.py",
      start: 1135836,
      end: 1165934,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/ordered_set.py",
      start: 1165934,
      end: 1181064,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/pyparsing.py",
      start: 1181064,
      end: 1413119,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/__init__.py",
      start: 1413119,
      end: 1413681,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/tags.py",
      start: 1413681,
      end: 1426614,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/utils.py",
      start: 1426614,
      end: 1428134,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/_compat.py",
      start: 1428134,
      end: 1428999,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/requirements.py",
      start: 1428999,
      end: 1433741,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/_structures.py",
      start: 1433741,
      end: 1435157,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/specifiers.py",
      start: 1435157,
      end: 1462935,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/markers.py",
      start: 1462935,
      end: 1471203,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/__about__.py",
      start: 1471203,
      end: 1471947,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/_vendor/packaging/version.py",
      start: 1471947,
      end: 1483925,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/__init__.py",
      start: 1483925,
      end: 1484493,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/bdist_wininst.py",
      start: 1484493,
      end: 1485130,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/egg_info.py",
      start: 1485130,
      end: 1510678,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/easy_install.py",
      start: 1510678,
      end: 1598179,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/build_clib.py",
      start: 1598179,
      end: 1602594,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/install_scripts.py",
      start: 1602594,
      end: 1605113,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/dist_info.py",
      start: 1605113,
      end: 1606073,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/launcher manifest.xml",
      start: 1606073,
      end: 1606701,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/sdist.py",
      start: 1606701,
      end: 1614793,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/py36compat.py",
      start: 1614793,
      end: 1619787,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/install_lib.py",
      start: 1619787,
      end: 1623662,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/test.py",
      start: 1623662,
      end: 1633285,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/upload_docs.py",
      start: 1633285,
      end: 1640599,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/build_ext.py",
      start: 1640599,
      end: 1653647,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/saveopts.py",
      start: 1653647,
      end: 1654305,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/alias.py",
      start: 1654305,
      end: 1656731,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/build_py.py",
      start: 1656731,
      end: 1666327,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/install_egg_info.py",
      start: 1666327,
      end: 1668530,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/setopt.py",
      start: 1668530,
      end: 1673615,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/bdist_egg.py",
      start: 1673615,
      end: 1691800,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/develop.py",
      start: 1691800,
      end: 1699988,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/bdist_rpm.py",
      start: 1699988,
      end: 1701496,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/install.py",
      start: 1701496,
      end: 1706201,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/upload.py",
      start: 1706201,
      end: 1706663,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/rotate.py",
      start: 1706663,
      end: 1708827,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/command/register.py",
      start: 1708827,
      end: 1709295,
      audio: 0
    }, {
      filename: "/lib/python3.7/site-packages/setuptools/extern/__init__.py",
      start: 1709295,
      end: 1711809,
      audio: 0
    }, {
      filename: "/bin/easy_install",
      start: 1711809,
      end: 1712264,
      audio: 0
    }, {
      filename: "/bin/easy_install-3.7",
      start: 1712264,
      end: 1712727,
      audio: 0
    }],
    remote_package_size: 1056399,
    package_uuid: "1062772a-378c-4906-9a29-1d8c7dd74e6c"
  })
})();