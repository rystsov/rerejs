define(function() {
    // http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
    return function(string) {
        var hash = 0;
        if (string.length == 0) return hash;
        for (var i = 0; i < string.length; i++) {
            var char = string.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
});
