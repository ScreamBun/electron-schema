// Array utility functions

export const mergeByProperty = (arr1, arr2, prop) => {
  const rtn = [...(arr1 || [])];

  arr2.forEach(arr2obj => {
    const obj = rtn.find(arr1obj => arr1obj[prop] === arr2obj[prop]);
    if (obj) {
      Array.prototype.push.apply(obj, arr2obj);
    } else {
      rtn.push(arr2obj);
    }
  });
  return rtn;
};

export const updateArray = (arr1 = {}, arr2 = {}) => {
  const rtn = { ...arr1 };
  Object.keys(arr2).forEach(key => {
    rtn[key] = arr2[key];
  });
  return rtn;
};
