import type {Identity} from "@/processing/identity-processor";

export default interface Author extends Identity{
    signCount: number,
    signature: Uint8Array
}
