expose(DomContainer);

function DomContainer(container) {
    this.bindto = function(element) {
        throw new Error();
    };
    this.place = function(html) {
        if (container.childNodes.length==0) {
            container.appendChild(html);
        } else {
            container.insertBefore(html, container.childNodes.item(0));
        }
    };
}