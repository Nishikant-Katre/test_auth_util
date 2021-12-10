import { join as joinPath, resolve as resolvePath } from "path";
export class ConfigPathResolver {
    private static _instance: ConfigPathResolver;

    static get Instance() {
        if (!this._instance) {
            this._instance = new ConfigPathResolver();
        }
        return this._instance;
    }

    resolveResourcePath(path_to_add: string): string {
        const base_path = process.env.RESOURCE_PATH || "./resources";
        return resolvePath(joinPath(base_path, path_to_add));
    }

    resolvePath(path: string): string {
        return resolvePath(path);
    }
}