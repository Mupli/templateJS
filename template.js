export class TemplateApp {
    _templates = {};
    _actions = {};

    view(name, cssTarget, template) {
        this._templates[name] = {
            cssTarget,
            template,
        };
    }

    render(name, data = {}) {
        const t = this._templates[name];

        if (t) {
            let string;
            if (typeof t.template === "function") {
                string = t.template(data);
            } else {
                string = t.template;
                Object.keys(data).forEach((key) => {
                    string = string.replace(":" + key, data[key]);
                });
            }
            $(t.cssTarget).html(string);
        } else {
            throw new Error("Not registered temlate with name:" + name);
        }
    }

    action(name, func) {
        this._actions[name] = func;
    }

    invoke(name, data = {}) {
        const action = this._actions[name];

        if (action) {
            action(data);
        } else {
            throw new Error("Not found action with name:" + name);
        }
    }

    bindClick(cssCls, actionName) {
        this.click(cssCls, actionName);
    }
    /**
     * @deprecated
     * @param {*} cssCls
     * @param {*} actionName
     */
    click(cssCls, actionName) {
        var me = this;
        $(document).on("click", cssCls, function (e) {
            const action = me._actions[actionName];
            if (action) {
                action($(this).data());
            } else {
                throw new Error("Not found action with name:" + name);
            }
        });
    }

    bindForm(cssCls, actionName) {
        var me = this;

        const fn = () => {
            const data = me._getFormData($(cssCls).serializeArray());
            const action = me._actions[actionName];

            if (action) {
                action(data);
            } else {
                throw new Error("Not found action with name:" + name);
            }
        };

        $(document).on("click", cssCls + ' *[type="submit"]', (event) => {
            event.preventDefault();

            if ($(cssCls).validate) {
                const c = $(cssCls).valid();
                if (c) {
                    fn();
                }
            } else {
                fn();
            }
        });
    }

    _getFormData(unindexed_array) {
        var indexed_array = {};

        $.map(unindexed_array, function (n, i) {
            const parts = n["name"].split(".");
            if (parts.length > 1) {
                let p = indexed_array;

                for (let index = 0; index < parts.length - 1; index++) {
                    const part = parts[index];
                    if (!p[part]) {
                        p[part] = {};
                    }

                    p = p[part];
                }
                p[parts[parts.length - 1]] = n["value"];
            } else {
                indexed_array[n["name"]] = n["value"];
            }
        });
        return indexed_array;
    }
}

export const app = new TemplateApp();
