// Editor Constants
import { zip } from '../../../../utils';

export const TypeKeys = ['name', 'type', 'options', 'comment', 'fields'];
export const StandardFieldKeys = ['id', 'name', 'type', 'options', 'comment'];
export const EnumeratedFieldKeys = ['id', 'value', 'comment'];

export const FieldObject = values => {
  if (values.length === StandardFieldKeys.length) {
    return zip(StandardFieldKeys, values);
  }
  if (values.length === EnumeratedFieldKeys.length) {
    return zip(EnumeratedFieldKeys, values);
  }
  throw new Error('Cannot create Field object, array shoud contain 3 or 5 values');
};

export const TypeObject = values => {
  let obj = {};
  if (values.length >=4 && values.length <=5) {
    obj = zip(StandardFieldKeys, TypeKeys);
  } else {
    throw new Error('Cannot create Type object, array shoud contain 3 or 5 values');
  }
  obj.fields = (obj.fields || []).map(f => FieldObject(f));
  return obj;
};
