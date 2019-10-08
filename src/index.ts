import { objEmpty } from "@crossfoam/utils";

const get = (key: string, defaultValue?: any): Promise<any> => {

  return browser.storage.local.get(key)
    .then( (data: object) => {
      if (data && data !== null && data !== undefined && !objEmpty(data)) {
        if (key in data) {
          return data[key];
        }
        return data;
      } else if (defaultValue) {
        return set(key, defaultValue);
      } else {
        return null;
      }
    });

};

const set = (key: string, value: any): Promise<any> => {
  return browser.storage.local.set({[key]: value})
    .then(() => {
      if (key in value) {
        return value[key];
      }
      return value;
    });
};

const remove = (key: string): Promise<any> => {
  return browser.storage.local.remove(key);
};

export {get, remove, set};
