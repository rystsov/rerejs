expose(null, function() {
    root.uid = function() {
        return id++;
    };

    root.do = function(f, context) {
        return new root.core.cells.DependentCell(f, context);
    };

    root.empty = function() {
        throw new root.core.cells.EmptyError();
    };

    root.unwrapObject = root.core.unwrapObject;

    root.Cell = root.core.cells.Cell;

    root.List = root.core.lists.List;

    root.render = root.ui.renderer.render;

    root.tx = function(f) {
        return function() {
            root.core.event_broker.call(null, f, []);
        };
    };
});

var id = 0;