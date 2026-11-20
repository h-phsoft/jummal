var aChars = ["ا", "ب", "ج", "د", "ه", "و", "ز", "ح", "ط", "ي", "ك", "ل", "م", "ن", "س", "ع", "ف", "ص", "ق", "ر", "ش", "ت", "ث", "خ", "ذ", "ض", "ظ", "غ"];
var jCharacters = [
  {"ChNo": 1, "Char": "ا", "ChName": "ا", "FCs": 40, "LCs": 17, "FLCs": 5, "FVs": 1218, "LVs": 960, "FLVs": 183, "Count": 52655, "UVs": 112, "EVs": 6124},
  {"ChNo": 2, "Char": "ب", "ChName": "ب", "FCs": 2, "LCs": 5, "FLCs": 0, "FVs": 63, "LVs": 162, "FLVs": 2, "Count": 11491, "UVs": 1629, "EVs": 4607},
  {"ChNo": 3, "Char": "ج", "ChName": "ج", "FCs": 0, "LCs": 0, "FLCs": 0, "FVs": 14, "LVs": 9, "FLVs": 0, "Count": 3317, "UVs": 3949, "EVs": 2287},
  {"ChNo": 4, "Char": "د", "ChName": "د", "FCs": 0, "LCs": 4, "FLCs": 0, "FVs": 3, "LVs": 198, "FLVs": 0, "Count": 5991, "UVs": 2914, "EVs": 3322},
  {"ChNo": 5, "Char": "ه", "ChName": "ه", "FCs": 2, "LCs": 8, "FLCs": 0, "FVs": 87, "LVs": 171, "FLVs": 2, "Count": 17194, "UVs": 1101, "EVs": 5135},
  {"ChNo": 6, "Char": "و", "ChName": "و", "FCs": 17, "LCs": 0, "FLCs": 0, "FVs": 2232, "LVs": 0, "FLVs": 0, "Count": 25676, "UVs": 560, "EVs": 5676},
  {"ChNo": 7, "Char": "ز", "ChName": "ز", "FCs": 0, "LCs": 0, "FLCs": 0, "FVs": 3, "LVs": 10, "FLVs": 0, "Count": 1599, "UVs": 5019, "EVs": 1217},
  {"ChNo": 8, "Char": "ح", "ChName": "ح", "FCs": 7, "LCs": 0, "FLCs": 0, "FVs": 31, "LVs": 1, "FLVs": 0, "Count": 4140, "UVs": 3523, "EVs": 2713},
  {"ChNo": 9, "Char": "ط", "ChName": "ط", "FCs": 4, "LCs": 1, "FLCs": 0, "FVs": 7, "LVs": 12, "FLVs": 0, "Count": 1273, "UVs": 5173, "EVs": 1063},
  {"ChNo": 10, "Char": "ي", "ChName": "ي", "FCs": 14, "LCs": 5, "FLCs": 0, "FVs": 343, "LVs": 267, "FLVs": 4, "Count": 25746, "UVs": 447, "EVs": 5789},
  {"ChNo": 11, "Char": "ك", "ChName": "ك", "FCs": 1, "LCs": 0, "FLCs": 0, "FVs": 119, "LVs": 8, "FLVs": 0, "Count": 10497, "UVs": 1839, "EVs": 4397},
  {"ChNo": 12, "Char": "ل", "ChName": "ل", "FCs": 4, "LCs": 1, "FLCs": 0, "FVs": 266, "LVs": 67, "FLVs": 3, "Count": 38102, "UVs": 285, "EVs": 5951},
  {"ChNo": 13, "Char": "م", "ChName": "م", "FCs": 0, "LCs": 17, "FLCs": 0, "FVs": 155, "LVs": 665, "FLVs": 21, "Count": 26735, "UVs": 504, "EVs": 5732},
  {"ChNo": 14, "Char": "ن", "ChName": "ن", "FCs": 1, "LCs": 42, "FLCs": 1, "FVs": 26, "LVs": 3124, "FLVs": 10, "Count": 27268, "UVs": 485, "EVs": 5751},
  {"ChNo": 15, "Char": "س", "ChName": "س", "FCs": 7, "LCs": 1, "FLCs": 0, "FVs": 55, "LVs": 11, "FLVs": 0, "Count": 6010, "UVs": 2813, "EVs": 3423},
  {"ChNo": 16, "Char": "ع", "ChName": "ع", "FCs": 2, "LCs": 0, "FLCs": 0, "FVs": 44, "LVs": 13, "FLVs": 0, "Count": 9405, "UVs": 1846, "EVs": 4390},
  {"ChNo": 17, "Char": "ف", "ChName": "ف", "FCs": 0, "LCs": 1, "FLCs": 0, "FVs": 698, "LVs": 3, "FLVs": 0, "Count": 8747, "UVs": 2072, "EVs": 4164},
  {"ChNo": 18, "Char": "ص", "ChName": "ص", "FCs": 1, "LCs": 0, "FLCs": 0, "FVs": 6, "LVs": 10, "FLVs": 0, "Count": 2074, "UVs": 4629, "EVs": 1607},
  {"ChNo": 19, "Char": "ق", "ChName": "ق", "FCs": 8, "LCs": 0, "FLCs": 0, "FVs": 538, "LVs": 41, "FLVs": 1, "Count": 7034, "UVs": 2485, "EVs": 3751},
  {"ChNo": 20, "Char": "ر", "ChName": "ر", "FCs": 0, "LCs": 10, "FLCs": 0, "FVs": 47, "LVs": 450, "FLVs": 4, "Count": 12403, "UVs": 1269, "EVs": 4967},
  {"ChNo": 21, "Char": "ش", "ChName": "ش", "FCs": 0, "LCs": 0, "FLCs": 0, "FVs": 4, "LVs": 2, "FLVs": 0, "Count": 2124, "UVs": 4631, "EVs": 1605},
  {"ChNo": 22, "Char": "ت", "ChName": "ت", "FCs": 4, "LCs": 0, "FLCs": 0, "FVs": 63, "LVs": 34, "FLVs": 0, "Count": 10520, "UVs": 1905, "EVs": 4331},
  {"ChNo": 23, "Char": "ث", "ChName": "ث", "FCs": 0, "LCs": 1, "FLCs": 0, "FVs": 109, "LVs": 2, "FLVs": 0, "Count": 1414, "UVs": 5141, "EVs": 1095},
  {"ChNo": 24, "Char": "خ", "ChName": "خ", "FCs": 0, "LCs": 0, "FLCs": 0, "FVs": 31, "LVs": 0, "FLVs": 0, "Count": 2497, "UVs": 4385, "EVs": 1851},
  {"ChNo": 25, "Char": "ذ", "ChName": "ذ", "FCs": 0, "LCs": 0, "FLCs": 0, "FVs": 65, "LVs": 2, "FLVs": 0, "Count": 4932, "UVs": 3096, "EVs": 3140},
  {"ChNo": 26, "Char": "ض", "ChName": "ض", "FCs": 0, "LCs": 0, "FLCs": 0, "FVs": 6, "LVs": 1, "FLVs": 0, "Count": 1686, "UVs": 4940, "EVs": 1296},
  {"ChNo": 27, "Char": "ظ", "ChName": "ظ", "FCs": 0, "LCs": 1, "FLCs": 0, "FVs": 1, "LVs": 13, "FLVs": 0, "Count": 853, "UVs": 5491, "EVs": 745},
  {"ChNo": 28, "Char": "غ", "ChName": "غ", "FCs": 0, "LCs": 0, "FLCs": 0, "FVs": 2, "LVs": 0, "FLVs": 0, "Count": 1220, "UVs": 5214, "EVs": 1022}
];
var jTCharacters = [
  {"ChNo": 0, "Char": "", "ChName": "", "FCs": 114, "LCs": 114, "FLCs": 6, "FVs": 6236, "LVs": 6236, "FLVs": 230, "Count": 322603, "UVs": 77457, "EVs": 97151}
];
