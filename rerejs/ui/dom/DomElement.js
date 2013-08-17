expose(DomElement);

var id = 0;

function DomElement(element) {
    var jq = root.ui.jq;
    var DomContainer = root.ui.dom.DomContainer;
    var Dom = root.ui.dom.Dom;

    this.elementId = "rere/ui/dom/element/" + (id++);

    this.bindto = function(preceding) {
        if ("preceding" in this) throw new Error();
        this.preceding = preceding;
        this.view = element.view();
        preceding.place(this.view);
        if (root.utils.hashLen(element.cells)>0) {
            root.ui.GC.trackCellsBlock({
                id: this.elementId,
                cells: element.cells
            });
        }

        if (element.children instanceof Array) {
            if (element.children.length!=0) {
                Dom.wrap(element.children).bindto(new DomContainer(this.view));
            }
        } else {
            throw new Error();
        }

        if ("control:draw" in element.events) {
            element.events["control:draw"](element, this.view);
        }
    };
    this.place = function(follower) {
        if (!("preceding" in this)) throw new Error();
        jq.after(this.view, follower);
    };
    this.remove = function() {
        if (!("preceding" in this)) throw new Error();
        jq.remove(this.view);
        element.dispose();
        root.ui.GC.forgetCellsBlock({
            id: this.elementId
        });
        this.place = function(follower) { this.preceding.place(follower); };
        this.remove = function() { throw new Error(); }
    };
}