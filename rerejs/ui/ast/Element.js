expose(Element);

var id = 0;

function Element(tag) {
    var jq = root.ui.jq;
    var Cell = root.reactive.Cell;

    this.type = Element;
    this.tag = tag;
    this.attributes = {};
    this.events = {};
    this.children = [];
    this.elementId = "rere/ui/ast/element/" + (id++);

    this.attributeSetters = defaultAttributeSetters();

    this.disposes = [];
    this.cells = {};
    this.dispose = function() {
        this.disposes.forEach(function(x) { x(); });
        for (var i in this.cells) {
            if (!this.cells.hasOwnProperty(i)) continue;
            this.cells[i].removeUser(this.elementId);
        }

        this.dispose = function() { throw new Error(); }
    };
    this.view = function() {
        var view = document.createElement(tag);

        for (var name in this.attributes) {
            if (!this.attributes.hasOwnProperty(name)) continue;
            if (name=="css") continue;
            this.setAttribute(view, name, this.attributes[name])
        }

        for (var name in this.events) {
            if (!this.events.hasOwnProperty(name)) continue;
            (function(name){
                if (name == "control:draw") return;
                if (name == "key:enter") {
                    view.addEventListener("keypress", function(event) {
                        if (event.keyCode == 13) {
                            this.events[name](this, view, event);
                        }
                    }.bind(this), false);
                } else {
                    view.addEventListener(name, function(event) {
                        this.events[name](this, view, event);
                    }.bind(this), false);
                }
            }.bind(this))(name);
        }
        if ("css" in this.attributes) {
            for (var property in this.attributes["css"]) {
                if (!this.attributes["css"].hasOwnProperty(property)) continue;
                (function(property, value){
                    if (typeof value==="object" && value.type == Cell) {
                        this.cells[value.id] = value;
                        this.disposes.push(function(){
                            value.onEvent(Cell.handler({
                                set: function(e) { jq.css(view, property, e); },
                                unset: function() { jq.css(view, property, null); }
                            }))
                        });
                    } else {
                        jq.css(view, property, value);
                    }
                }.bind(this))(property, this.attributes["css"][property]);
            }
        }

        for (var i in this.cells) {
            if (!this.cells.hasOwnProperty(i)) continue;
            this.cells[i].addUser(this.elementId);
        }

        this.view = function() {
            throw new Error();
        };

        return view;
    };
    this.setAttribute = function(view, name, value) {
        var self = this;
        if (name in this.attributeSetters) {
            wrapRv(value, this.attributeSetters[name](view));
        } else {
            wrapRv(value, defaultMap(view, name));
        }

        function defaultMap(view, name) {
            return {
                set: function(v) { view.setAttribute(name, v); },
                unset: function() {
                    if (view.hasAttribute(name)) {
                        view.removeAttribute(name);
                    }
                }
            }
        }

        function wrapRv(value, template) {
            if (typeof value==="object" && value.type == Cell) {
                self.cells[value.id] = value;
                self.disposes.push(value.onEvent([], Cell.handler({
                    set: template.set,
                    unset: template.unset
                })));
            } else {
                template.set(value);
            }
        }
    };
}

function defaultAttributeSetters() {
    return {
        checked: function(view) {
            return {
                set: function(v) {
                    view.checked = v;
                },
                unset: function() {
                    view.checked = false;
                }
            };
        },
        value: function(view) {
            return {
                set: function(v) {
                    if (view.value!=v) view.value = v;
                },
                unset: function() {
                    if (view.value!="") view.value = "";
                }
            };
        },
        disabled: function(view) {
            return {
                set: function(v) {
                    if (v) {
                        view.setAttribute("disabled", "")
                    } else {
                        if (view.hasAttribute("disabled")) view.removeAttribute("disabled");
                    }
                },
                unset: function() {
                    view.removeAttribute("disabled");
                }
            };
        },
        "class": function(view) {
            var jq = root.ui.jq;
            return {
                set: function(v) {
                    jq.removeClass(view);
                    view.classList.add(v);
                },
                unset: function() {
                    jq.removeClass(view);
                }
            };
        }
    };
}