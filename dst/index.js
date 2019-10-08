"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@crossfoam/utils");
var get = function (key, defaultValue) {
    return browser.storage.local.get(key)
        .then(function (data) {
        if (data && data !== null && data !== undefined && !utils_1.objEmpty(data)) {
            if (key in data) {
                return data[key];
            }
            return data;
        }
        else if (defaultValue) {
            return set(key, defaultValue);
        }
        else {
            return null;
        }
    });
};
exports.get = get;
var set = function (key, value) {
    var _a;
    return browser.storage.local.set((_a = {}, _a[key] = value, _a))
        .then(function () {
        if (key in value) {
            return value[key];
        }
        return value;
    });
};
exports.set = set;
var remove = function (key) {
    return browser.storage.local.remove(key);
};
exports.remove = remove;
//# sourceMappingURL=index.js.map