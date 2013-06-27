define([], function(){
return function(rere) {

return {
	setProperty: addDefault({
	    checked: function(view, value) {
	        return {
	            set: function(v) { 
	                view.checked = v; 
	            },
	            unset: function() { 
	                view.checked = false; 
	            }
	        };
	    }
	}),
    renderSingle: function(element, view) {
        var jq = rere.ui.jq;
        var Variable = rere.reactive.Variable;
        var FragmentElement = rere.ui.elements.FragmentElement;

        for (var name in element.data.attributes) {
            if (name=="css") continue;
            
            rere.ui.Element.setProperty(view, name, element.data.attributes[name])
        }
        
        for (var name in element.data.events) {
            view.addEventListener(name, function() {
                element.data.events[name](self, view);
            }, false);
        }

        if ("css" in element.data.attributes) {
            for (var property in element.data.attributes["css"]) {
                (function(property, value){
                    if (typeof value==="object" && value["rere/reactive/Channel"]) {
                        value.onEvent(Variable.handler({
                            set: function(e) { jq.css(view, property, e); },
                            unset: function() { jq.css(view, property, null); }
                        }))
                    } else {
                        jq.css(view, property, value);
                    };
                })(property, element.data.attributes["css"][property]);
            };
        };

        return new FragmentElement(view);
    },
    renderContainer: function(element, view) {
        var renderer = rere.ui.elements.renderer;
        var Container = rere.ui.elements.Container;

        var fragment = rere.ui.Element.renderSingle(element, view);
        var bindto = fragment.bindto;
        fragment.bindto = function(head) {
            bindto.apply(fragment, [head]);
            renderer.render(element.data.content).bindto(new Container(view));
        };
        return fragment;
    }
};

function addDefault(special) {
	function defaultMap(view, name, value) {
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
        if (typeof value==="object" && value["rere/reactive/Channel"]) {
            value.onEvent(rere.reactive.Variable.handler({
                set: template.set,
                unset: template.unset
            }));
        } else {
            template.set(value);
        }
    }
    return function(view, name, value) {
        var setter = name in special ? special[name](view, value) : defaultMap(view, name, value);
        
        wrapRv(value, setter);
    };
}

};
});
