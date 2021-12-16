"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilityService = void 0;
class UtilityService {
    static DataCopier(target, source) {
        let response = {};
        response = Object.assign(Object.assign({}, response), target);
        let keys = Object.keys(target);
        if (keys[0] == "0") {
            response = {};
        }
        else {
            for (let key of keys) {
                if (target[key]) {
                    if (target[key].constructor === Array) {
                        response[key] = [];
                        console.log(key);
                        if (source[key] != undefined) {
                            for (let item of source[key]) {
                                let data = Object.assign({}, item);
                                response[key].push(data);
                            }
                        }
                    }
                    else if (typeof target[key] === 'object') {
                        response[key] = source[key];
                    }
                    else {
                        if (source[key] != undefined) {
                            response[key] = source[key];
                        }
                    }
                }
                else {
                    if (source[key] != undefined) {
                        response[key] = source[key];
                    }
                }
            }
        }
        return response;
    }
    static convertToObject(entity) {
        let object = {};
        let keys = Object.keys(entity);
        if (keys[0] == "0") {
            object = entity;
        }
        else {
            for (let key of keys) {
                if (entity[key]) {
                    if (entity[key].constructor === Array) {
                        object[key] = [];
                        for (let item of entity[key]) {
                            object[key].push(UtilityService.convertToObject(item));
                        }
                    }
                    else if (typeof entity[key] === 'object') {
                        object[key] = UtilityService.convertToObject(entity[key]);
                    }
                    else {
                        object[key] = entity[key];
                    }
                }
                else {
                    object[key] = entity[key];
                }
            }
        }
        return object;
    }
}
exports.UtilityService = UtilityService;
//# sourceMappingURL=utility-service.js.map