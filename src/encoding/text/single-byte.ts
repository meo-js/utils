/**
 * @module
 *
 * @internal
 */

import { Endian, asUint8Array } from "../../typed-array.js";
import { throwInvalidChar } from "../error.js";
import * as decodeFallback from "./decode-fallback.js";
import * as encodeFallback from "./encode-fallback.js";
import { Encoding } from "./enum.js";
import type {
    SingleByteDecodeOptions,
    SingleByteEncodeOptions,
} from "./options.js";
import { replacementCharRegex } from "./replacement-char.js";

export function _decode(
    maxCode: number,
    encoding: Encoding,
    bytes: BufferSource,
    opts?: SingleByteDecodeOptions,
): string {
    const fatal = opts?.fatal ?? false;
    const fallback = opts?.fallback ?? decodeFallback.replace;

    if (bytes.byteLength === 0) {
        return "";
    }

    const data = asUint8Array(bytes);
    let str = "";

    let i = 0;
    for (const code of data) {
        if (code > maxCode) {
            if (fatal) {
                throwInvalidChar(code, i);
            } else {
                str += fallback(data, i, Endian.Little, encoding);
            }
        } else {
            str += String.fromCharCode(code);
        }
        i++;
    }

    return str;
}

export function _encode(
    maxCode: number,
    encoding: Encoding,
    text: string,
    opts?: SingleByteEncodeOptions,
): Uint8Array {
    const fatal = opts?.fatal ?? false;
    const fallback = opts?.fallback ?? encodeFallback.replace;

    const buffer = new Uint8Array(text.length);

    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code > maxCode) {
            if (fatal) {
                throwInvalidChar(code, i);
            } else {
                buffer[i] = fallback(text, i, Endian.Little, encoding);
            }
        } else {
            buffer[i] = code;
        }
    }

    return buffer;
}

export function _verify(maxCode: number, bytes: BufferSource): boolean {
    const data = asUint8Array(bytes);

    for (const byte of data) {
        if (byte > maxCode) {
            return false;
        }
    }

    return true;
}

export function _isWellFormed(
    maxCode: number,
    text: string,
    allowReplacementChar: boolean = true,
): boolean {
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code > maxCode) {
            return false;
        }
    }

    return allowReplacementChar ? true : !replacementCharRegex.test(text);
}
