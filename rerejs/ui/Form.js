define([], function(){
    return function(rere) {

        return (function() {
            rere.ui.Element.ctor.apply(this);

            this._ui_is_form = true;

            this.view = function(element){
                return rere.ui.Element.renderContainer(element, document.createElement("form"));
            };
        });

    };
});