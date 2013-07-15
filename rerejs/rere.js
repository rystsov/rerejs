define(
["rere/adt/adt", "rere/reactive/reactive", "rere/ui/ui"], 
function(adt, reactive, ui) {

var rere = {
    utils: {
        vectorAdd: function(a,b) {
            if (a.length!= b.length) throw new Error();
            var c = [];
            for (var i in a) {
                c.push(a[i]+b[i]);
            }
            return c;
        }
    }
}

rere.future = function(path) {
	var parts = path.split("/")
	return function() {
		var obj = rere;
		for (var i=0;i<parts.length;i++) {
			obj = obj[parts[i]];
		}
		return obj;
	}
};
rere.collect = function(ctors, names) {
	if (names.length!=ctors.length) throw new Error();
	var obj = {};
	for (var i=0;i<names.length;i++) {
		obj[names[i]] = ctors[i](rere);
	}
	return obj;
};
rere.adt = adt(rere);
rere.reactive = reactive(rere);
rere.ui = ui(rere);
return rere;

});
