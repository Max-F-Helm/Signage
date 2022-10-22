import type Frame from "./Frame";

export default interface Addendum extends Frame {
    title: string,
    type: string,
    data: Uint8Array
}
