export interface InputTextDlgResult {
    /** if true the dialog was closed by a confirm-action; if false the dialog was canceled */
    ok: boolean,
    /** the entered text or "" if !ok */
    text: string
}

export interface InputFileDlgResult {
    /** if true the dialog was closed by a confirm-action; if false the dialog was canceled */
    ok: boolean,
    /** the selected file(s) or [] if !ok */
    files: File[]
}
