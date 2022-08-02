export class TemplateApp {
    _templates = {};
    _actions = {};

    view(name, cssTarget, template) {
        this._templates[name] = {
            cssTarget,
            template,
        };
    }

    render(name, data) {
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
}
