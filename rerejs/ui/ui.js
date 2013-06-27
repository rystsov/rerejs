define(
[
  "rere/ui/Element", 
  "rere/ui/HtmlInput", 
  "rere/ui/RadioInput",
  "rere/ui/Label",
  "rere/ui/Button", 
  "rere/ui/ComboBox", 
  "rere/ui/Div", 
  "rere/ui/Input", 
  "rere/ui/Span",
  "rere/ui/StickyButton",
  "rere/ui/Text",
  "rere/ui/jq",
  "rere/ui/renderer",
  "rere/ui/tk",
  "rere/ui/view/view",
  "rere/ui/elements/elements"], 
function() {
var args = arguments;
return function(rere) {

return rere.collect(args, [
  "Element", "HtmlInput", "RadioInput", "Label", "Button", "ComboBox", "Div", 
  "Input", "Span", "StickyButton", "Text", "jq", "renderer", "tk", "view", "elements"
]);

};
});
