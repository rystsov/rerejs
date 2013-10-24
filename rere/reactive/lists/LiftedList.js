expose(LiftedList, function(){
    BaseList = root.reactive.lists.BaseList;
    List = root.reactive.List;

    SetLiftedPrototype();
});

var BaseList, List;

function LiftedList(source, f) {
    this.source = source;
    this.f = f;
    BaseList.apply(this);
}

function SetLiftedPrototype() {
    LiftedList.prototype = new BaseList();

    LiftedList.prototype.use = function(id) {
        BaseList.prototype.use.apply(this, [id]);
        if (this.usersCount === 1) {
            this.source.use(this.listId);
            this.unsubscribe = this.source.onEvent(List.handler({
                data: function(data) {
                    this.data = data.map(function(item){
                        return {key: item.key, value: this.f(item.value)};
                    }.bind(this));
                    this.raise(["data", this.data.slice()]);
                }.bind(this),
                add: function(item) {
                    item = {key: item.key, value: this.f(item.value)};
                    this.data.push(item);
                    this.raise(["add", item]);
                }.bind(this),
                remove: function(key){
                    this.data = this.data.filter(function(item){
                        return item.key != key;
                    });
                    this.raise(["remove", key]);
                }.bind(this)
            }))
        }
    };

    LiftedList.prototype.leave = function(id) {
        BaseList.prototype.leave.apply(this, [id]);
        if (this.usersCount === 0) {
            this.unsubscribe();
            this.unsubscribe = null;
            this.source.leave(this.listId);
        }
    };

    LiftedList.prototype.unwrap = function() {
        return this.source.unwrap().map(function(item){
            return this.f(item);
        }.bind(this));
    };
}