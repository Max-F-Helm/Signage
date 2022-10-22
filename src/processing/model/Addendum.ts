import type Frame from "./Frame";

export default interface Addendum extends Frame {
    type: string,
    data: Uint8Array
}
