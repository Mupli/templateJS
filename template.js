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

    invoke(name, data = {}, attr= {}) {
        const action = this._actions[name];

        if (action) {
            action(data, attr);
        } else {
            throw new Error("Not found action with name:" + name);
        }
    }

    bindClick(cssCls, actionName) {
        this._executeAction("click", cssCls, actionName);
    }

    bindMouseOver(cssCls, actionName) {
        this._executeAction("mouseover", cssCls, actionName);
    }

    bindMouseOut(cssCls, actionName) {
        this._executeAction("mouseout", cssCls, actionName);
    }

    bindMouseLeave(cssCls, actionName) {
        this._executeAction("mouseleave", cssCls, actionName);
    }

    bindChange(cssCls, actionName) {
        this._executeAction("change", cssCls, actionName);
    }

    _executeAction(eventName, cssCls, actionName) {
        const me = this;
        $(document).on(eventName, cssCls, function (e) {
            const action = me._actions[actionName];
            if (action) {
                const component = $(this);
                let data = {
                    ...component.data(),
                    [component.attr("name")]: component.val(),
                };
                // data.source = this;
                // data.ev = e;

                action(data, {
                    ev: e,
                    ...me._getAttr(component),
                    source: this,
                });
            } else {
                throw new Error("Not found action with name:" + actionName);
            }
        });
    }

    bindForm(cssCls, actionName) {
        var me = this;

        const fn = (fd, attr) => {
            const formComponent = $("form"+cssCls)
            const component = $(cssCls + " *[type='submit']");
            // const data = me._getFormData(component.serializeArray());
            // const data = me._getFormData(fd);

            var data = {};
            fd.forEach(function (value, key) {
                value = _convertToValue(value);

                if (key.indexOf(".") > 0) {
                    const sp = key.split(".");
                    let tmpData = data;

                    for (let index = 0; index < sp.length - 1; index++) {
                        const keyPart = sp[index];
                        if (!tmpData[keyPart]) {
                            tmpData[keyPart] = {};
                        }
                        tmpData = tmpData[keyPart];
                    }

                    tmpData[sp[sp.length - 1]] = value;
                } else {
                    data[key] = value;
                }
            });

            const action = me._actions[actionName];

            if (action) {
                action(data, {
                    ev: attr.ev,
                    source: attr.source,
                    action: formComponent.attr("action"),
                    ...formComponent.data(),
                    ...this._getAttr(formComponent),
                    formData: fd,
                });
            } else {
                throw new Error("Not found action with name:" + name);
            }
        };

        let targetCls = "form" + cssCls;
        // if (cssCls.indexOf("#")>= 0) {
        //     targetCls = cssCls
        // }
        $(document).on("submit", targetCls, function (event) {
            console.log("submit");
            event.preventDefault();
            const fd = new FormData(this);
            if ($(cssCls).valid) {
                const c = $(cssCls).valid();
                if (c) {
                    fn(fd , {ev: event, source: this});
                }
            } else {
                fn(fd, {ev: event, source: this});
            }
        });
    }

    _getAttr(component) {
        let attributes = {};
        $.each(component[0].attributes, function (index, attr) {
            attributes[attr.name] = attr.value;
        });

        return attributes;
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

function isNumeric(value) {
    return /^\d+$/.test(value);
}
function _convertToValue(value) {
    if (value == "true") return true;
    if (value == "false") return false;
    if (isNumeric(value)) return Number(value);
    if (typeof value === 'string' || value instanceof String) {
        if (!value.match(/\S/g)) return null;
    }
    return value;
}
