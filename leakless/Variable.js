// isActive
// activate
//   implicit called by onEvent

var Variable = exports;

var maybe = require("./maybe");

var id = 0;

Variable.ctor = function() {
    this._is_rvariable = true;
    this.id = id++;
    this._value = new maybe.None();

    this._dependants = [];
    this._dependants_id = 0;
    this._dependanties = [];
    this.isActive = true;
    this.isUsed = false;
    this.isGarbage = false;

    this.activate = function() { throw new Error(); }

    this.name = function() {
        if (arguments.length==0) {
            if (this._name) {
                return this.id + "(" + this._name + ")";
            }
            return this.id;
        }
        this._name = arguments[0];
        return this;
    };
    this.value = function() {
        return this._value;
    };
    this.subscribe = function(f) {
        return this.onEvent([], function(e){
            if (e[0]==="set") {
                f(e[1]);
            }
        });
    };
    this.onEvent = function(dependants, f, unsubscribe) {
        if (!this.isActive) this.activate();

        var self = this;
        unsubscribe = unsubscribe || function(f) {
            f();
        };
        var id = this._dependants_id++;
        this._dependants.push({key: id, dependants: dependants, f:f, unsubscribe: unsubscribe});
        if (this._value.isempty()) {
            f(["unset"]);
        } else {
            f(["set", this._value.value()]);
        }
        return function() {
            self._dependants = self._dependants.filter(function(dependant) {
                return dependant.key!=id;
            });
        };
    };
    this.set = function(value) {
        if (!this.isActive) throw new Error();
        this._value = new maybe.Some(value)
        Variable.ctor.raise(this, ["set", value])
    };
    this.unset = function() {
        if (!this.isActive) throw new Error();
        this._value = new maybe.None();
        Variable.ctor.raise(this, ["unset"])
    };

    if (arguments.length>0) {
        this.set(arguments[0])
    }
}

Variable.ctor.raise = function(self, e) {
    for (var i in self._dependants) {
        var f = self._dependants[i].f;
        f(e);
    }
}

Variable.ctor.prototype.unwrap = function(alt) {
    if (arguments.length==0 && this.value().isempty()) throw new Error();
    return this.value().isempty() ? alt : this.value().value();
};

Variable.ctor.prototype.lift = function(f) {
    var self = this;
    
    var channel = new Variable.ctor()
    var forget = function(unsubscribe) {
        channel.isActive = false;
        channel._dependanties = [];
        unsubscribe();
    };
    channel.isActive = false;
    channel.activate = function() {
        if (this.isActive) throw new Error();
        channel.isActive = true;
        channel._dependanties = [self];
        self.onEvent([channel], function(e){
            Variable.ctor.replay(channel, e, f);
        }, forget);
    };
    channel.activate();
    
    return channel;
};

Variable.ctor.prototype.bind = function(f) {
    var self = this;

    var result = new Variable.ctor();
    var dispose = function() {};
    var forget = function(unsubscribe) {
        dispose();
        result.isActive = false;
        result._dependanties = [];
        unsubscribe();
    };
    result.isActive = false;
    result.activate = function() {
        if (this.isActive) throw new Error();
        result.isActive = true;
        result._dependanties = [self];
        self.onEvent([result], Variable.ctor.handler({
            set: function(e) {
                dispose();
                var leader = f(e);
                result._dependanties = [self, leader];
                dispose = leader.onEvent([result], Variable.ctor.handler(result));
            },
            unset: function(){
                dispose();
                result._dependanties = [self];
                dispose = function() {};
                result.unset();
            }
        }), forget);
    };
    result.activate();
    return result;
};

Variable.ctor.replay = function (self, e, f) {
    if (e[0]==="set") {
        self.set(f(e[1]));
    } else if (e[0]==="unset") {
        self.unset()
    } else {
        throw new Error();
    }
}

Variable.ctor.handler = function(handler) {
    return function(e) {
        if (e[0]==="set") {
            handler.set(e[1]);
        } else if (e[0]==="unset") {
            handler.unset();
        } else {
            throw new Error("Unknown event: " + e[0]);
        }
    };
};

/*

*/