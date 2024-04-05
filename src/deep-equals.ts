'use strict';

/*
copied from https://github.com/epoberezkin/fast-deep-equal
license: https://github.com/epoberezkin/fast-deep-equal/blob/master/LICENSE
modified
*/

export default function equal(a: any, b: any) {
    if (a === b) return true;

    if (a && b && typeof a == 'object' && typeof b == 'object') {
        if (a.constructor !== b.constructor) {
            // modification: Buffer and Uint8Array can be equal
            if(!(a instanceof Uint8Array) || !(b instanceof Uint8Array))
                return false
        }

        let length: number, i: number, elm: any;// modification: explicit types
        if (Array.isArray(a)) {
            length = a.length;
            if (length != b.length) return false;
            for (i = length; i-- !== 0;)
                if (!equal(a[i], b[i])) return false;
            return true;
        }


        if ((a instanceof Map) && (b instanceof Map)) {
            if (a.size !== b.size) return false;
            for (elm of a.entries())
                if (!b.has(elm[0])) return false;
            for (elm of a.entries())
                if (!equal(elm[1], b.get(elm[0]))) return false;
            return true;
        }

        if ((a instanceof Set) && (b instanceof Set)) {
            if (a.size !== b.size) return false;
            for (elm of a.entries())
                if (!b.has(elm[0])) return false;
            return true;
        }

        if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
            // modification: fix property names
            length = a.byteLength;
            if (length != b.byteLength) return false;

            const bytesA = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
            const bytesB = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
            for (i = length; i-- !== 0;)
                if (bytesA[i] !== bytesB[i]) return false;
            return true;
        }


        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

        const keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;

        for (i = length; i-- !== 0;)
            if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

        for (i = length; i-- !== 0;) {
            let key = keys[i];

            if (!equal(a[key], b[key])) return false;
        }

        return true;
    }

    // true if both NaN, false otherwise
    return a!==a && b!==b;
}
