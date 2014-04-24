import { equals } from "morlock/core/util";
module Stream from "morlock/core/stream";
module ElementTrackerStream from "morlock/streams/element-tracker-stream";

/**
 * Provides a familiar OO-style API for tracking element position.
 * @constructor
 * @param {Element} elem The element to track
 * @param {Object=} options The options passed to the position tracker.
 * @return {Object} The API with a `on` function to attach scrollEnd
 *   callbacks and an `observeElement` function to detect when elements
 *   enter and exist the viewport.
 */
function ElementVisibleController(elem, options) {
  if (!(this instanceof ElementVisibleController)) {
    return new ElementVisibleController(elem, options);
  }

  var trackerStream = ElementTrackerStream.create(elem, options);

  var enterStream = Stream.filter(equals('enter'), trackerStream);
  var exitStream = Stream.filter(equals('exit'), trackerStream);

  function onOffStream(args, f) {
    var name = 'both';
    var cb;

    if (args.length === 1) {
      cb = args[0];
    } else {
      name = args[0];
      cb = args[1];
    }

    var filteredStream;
    if (name === 'both') {
      filteredStream = trackerStream;
    } else if (name === 'enter') {
      filteredStream = enterStream;
    } else if (name === 'exit') {
      filteredStream = exitStream;
    }

    f(filteredStream, cb);
    
    var val = Stream.getValue(trackerStream);
    if ((f === Stream.onValue) && (val === name)) {
      Stream.emit(filteredStream, val);
    }
  }

  return {
    on: function on(/* name, cb */) {
      onOffStream(arguments, Stream.onValue);

      return this;
    },

    off: function(/* name, cb */) {
      onOffStream(arguments, Stream.offValue);

      return this;
    }
  };
}

export default = ElementVisibleController;
