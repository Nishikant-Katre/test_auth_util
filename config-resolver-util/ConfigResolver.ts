import { readdirSync, readFileSync } from "fs";
import { resolve as resolvePath } from "path";
export class ConfigResolver {
    private static _instance: ConfigResolver;

    static get Instance() {
        if (!this._instance) {
            this._instance = new ConfigResolver();
        }
        return this._instance;
    }
    readContent(path: string): any {
        try {
            return readFileSync(resolvePath(path), "utf8");
        } catch (error) {
            throw error;
        }
    }

    readAsJSON(path: string): any {
        try {
            return JSON.parse(this.readContent(path));
        } catch (error) {
            throw error;
        }
    }

    readDirectories(path: string): string[] {
        try {
            return readdirSync(resolvePath(path))
        } catch (error) {
            throw error;
        }
    }
}