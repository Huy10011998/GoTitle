export class ServerError {
    constructor(srcData) {
        this.errorMessages = [];
        this.parseSrcData(srcData);
    }

    setSource(srcData) {
        this.parseSrcData(srcData);
    }

    parseSrcData(srcData) {
        if (!srcData) {
            return;
        }

        if (!srcData.statusCode && srcData.status) {
            this.statusCode = srcData.status;
        }
        // parse error messages
        if (srcData.data && srcData.data.errors) {
            if (srcData.data.errors instanceof Array) {
                for(let i=0; i<srcData.data.errors.length; i++) {
                    this.errorMessages.push(srcData.data.errors[i]);
                }
            } else {
                for (const property in srcData.data.errors) {
                    if (srcData.data.errors[property] instanceof Array) {
                        for(let i=0; i<srcData.data.errors[property].length; i++) {
                            this.errorMessages.push(srcData.data.errors[property][i]);
                        }
                    } else {
                        this.errorMessages.push(srcData.data.errors[property]);
                    }
                }
            }
        } else if(srcData.message) {
            this.errorMessages.push(srcData.message);
        }

    }

    toString() {
        let result = this.statusCode+': ';
        for(let i=0; i<this.errorMessages.length; i++) {
            result += this.errorMessages[i]+'| ';
        }
        return result;
    }
}