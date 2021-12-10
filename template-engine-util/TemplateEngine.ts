import * as handlebars from "handlebars";
export class TemplateEngine {
    static render(template_string: string, data: any): string {
        try {
            const result = handlebars.compile(template_string)(data);
            return result;
        } catch (error) {
            console.error(error);
        }

        return "";

    }
}