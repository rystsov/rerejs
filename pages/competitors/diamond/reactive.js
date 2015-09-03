// Generated by CoffeeScript 1.6.3
var bind, diamonds, repeatDiamondShape;

bind = rx.bind;

rxt.importTags();

diamonds = rx.cell(1);

repeatDiamondShape = function(seed, n) {
  var s1, s2;
  if (n === 0) {
    return seed;
  } else {
    s1 = bind(function() {
      return seed.get() + 1;
    });
    s2 = bind(function() {
      return seed.get() + 1;
    });
    return repeatDiamondShape(bind(function() {
      return s1.get() + s2.get();
    }), n - 1);
  }
};

$(function() {
  var diamondsInput;
  return $('.coffee').prepend(div([
    label({
      "for": "diamonds"
    }, ["Enter number of diamonds:"]), diamondsInput = input({
      type: "text",
      value: "1"
    }), button({
      click: function() {
        var value;
        value = parseInt(diamondsInput.val());
        return diamonds.set(value);
      }
    }, "Calc updates")
  ]), span(bind(function() {
    var handler, source, target, updates;
    if (diamonds.get() > 0) {
      source = rx.cell(1);
      target = repeatDiamondShape(source, diamonds.get());
      updates = 0;
      handler = target.onSet.sub(function() {
        return updates += 1;
      });
      updates = 0;
      source.set(2);
      target.onSet.unsub(handler);
      return "Expected one update, but got " + updates;
    } else {
      return "Should be an integer above 0";
    }
  })));
});