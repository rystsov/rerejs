define(
    ["rere/reactive/Variable", "rere/reactive/ReduceTree", "rere/reactive/ChannelWithMemory", "rere/reactive/rv"], 
    function(Variable, ReduceTree, ChannelWithMemory, rv) {
    function ObservableList(data) {
        var self = this;
        this.id = 0;
        this.handlers = [];
        this["rere/reactive/ObservableList"] = true;
        this.list = new ChannelWithMemory();

        this.getData = function() {
            return this.data;
        };
        this.setData = function(data) {
            this.data = data.map(function(item){
                return {
                    key: self.id++,
                    value: item
                }
            });
            for (var i in this.handlers) {
                this.handlers[i]([
                    "data", 
                    this.data.map(function(x){return x})
                ]);
            }
            this.list.set(this.data)
        };
        this.setData(data);


        this.remove = function(key) {
            var data = [];
            for (var i=0;i<this.data.length;i++){
                if (this.data[i].key==key) continue;
                data.push(this.data[i]);
            }
            this.data = data;
            for (var i in this.handlers) {
                this.handlers[i](["remove", key]);
            }
            this.list.set(this.data)
        };
        this.add = function(f) {
            var e = null;
            if (typeof(f) == "function") {
                var key = self.id++;
                e = {key: key, value: f(key)};
            } else {
                e = f;
            }
            this.data.push(e);
            for (var i in this.handlers) {
                this.handlers[i](["add", e]);
            }
            this.list.set(this.data)
        };

        this.lift = function(f) {
            var nova = new ObservableList([]);
            this.subscribe(function(e){
                if (e[0]=="data") {
                    nova.setData(e[1].map(f));
                } else if (e[0]=="add") {
                    nova.add({key:e[1].key, value:f(e[1].value)});
                } else if (e[0]=="remove") {
                    nova.remove(e[1]);
                } else {
                    throw new Error();
                }
            });
            return nova;
        };

        this.subscribe = function(f) {
            this.handlers.push(f);
            f([
                "data", 
                this.data.map(function(x){return x})
            ])
        };

        this.reduceCA = function(f) {
            var head = new Variable();
            var result = rv.rv.unwrap(head);
            var tree = null;
            this.subscribe(function(e){
                if (e[0]==="data") {
                    head.unset();
                    tree = new ReduceTree(f);
                    for (var i in e[1]) {
                        tree.add(e[1][i].key, e[1][i].value);
                    }
                    head.set(tree.head);
                } else if (e[0]==="add") {
                    tree.add(e[1].key, e[1].value);
                } else if (e[0]==="remove") {
                    tree.remove(e[1]);
                } else throw new Error();
            });

            return result;
        }
    };

    return ObservableList;
});