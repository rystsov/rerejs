define(["rere/adt/maybe", "rere/ui/elements/FragmentElement"], function(maybe, FragmentElement) {
    var id = 0;

    return (function(element) {
        var myid = "rere_ui_view_radiobutton_" + (id++);
        var radio = $(
            "<input id=\"MYID\" type=\"radio\" name=\"MYID\" />".replace(
                "MYID", 
                myid
        ));
        var span = $("<span class=\"uiRereRadio\" />");
        span.append(radio);
        span.append($(
            "<label for=\"MYID\">TEXT</label>".
                replace("MYID", myid).
                replace("TEXT", element.data.label)
        ));
        element.isset.subscribe(function(value){
            if (value.hasvalue(true)) {
                radio.prop("checked", true);
            } else {
                radio.prop("checked", false);
            }
        })
        radio.change(function(){
            element.isset.raise(new maybe.Some(true));
        });
        return new FragmentElement(span);
    });
});
