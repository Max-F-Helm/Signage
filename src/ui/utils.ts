export function basePath(): string {
    const baseUrlStr = import.meta.env.BASE_URL;
    const baseUrl = new URL(baseUrlStr, location.href);
    const path = baseUrl.pathname;

    if(path.endsWith("/"))
        return path.substring(0, path.length - 1);
    return path;
}
