export class ObjectUtil {
    static list_to_tree({ list, key, parent_key, parent_value, child_var_name }: { list: any[]; key: string; parent_key: string; parent_value: string; child_var_name: string; }) {

        if (list.length <= 1) {
            return list;
        }
        var map: any = {};
        var roots: any[] = [];
        var i;
        for (i = 0; i < list.length; i += 1) {
            map[list[i][key]] = i;
            list[i][child_var_name] = [];
        }
        for (i = 0; i < list.length; i += 1) {
            if (list[i][parent_key] && list[i][parent_key] != parent_value) {
                if (list[map[list[i][parent_key]]] && list[map[list[i][parent_key]]][child_var_name]) {
                    list[map[list[i][parent_key]]][child_var_name].push(list[i]);
                }
            } else {
                roots.push(list[i]);
            }
        }
        return roots;
    }

    static tree_to_list({ obj, child_var_name, collections, indent_level = 0 }: { obj: any[]; child_var_name: string; collections: any[]; indent_level?: number; }) {
        for (let index = 0; index < obj.length; index++) {
            const element = obj[index];
            element.indent = indent_level;
            collections.push(element);
            if (element[child_var_name] && element[child_var_name].length > 0) {
                const _indent_level = indent_level + 1;
                this.tree_to_list({ obj: element[child_var_name], child_var_name, collections, indent_level: _indent_level });
            }
            delete element[child_var_name];

        }
    }

    static isNullOrUndefined(value: any) {
        return value === null || value === undefined;
    }
}