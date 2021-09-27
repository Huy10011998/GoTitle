import changeCaseObject from 'change-case-object';

export const ConvertCase = {
    toCamelCase: data => {
        "use strict";
        return changeCaseObject.camelCase(data);
    },
    toSnakeCase: data => {
        "use strict";
        return changeCaseObject.snakeCase(data);
    },
    toParamCase: data => {
        "use strict";
        return changeCaseObject.paramCase(data);
    }
};