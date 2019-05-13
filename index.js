var msgpack = require('notepack.io');
var Emitter = require('component-emitter');

/**
 * Packet types (see https://github.com/socketio/socket.io-protocol)
 */

exports.CONNECT = 0;
exports.DISCONNECT = 1;
exports.EVENT = 2;
exports.ACK = 3;
exports.ERROR = 4;
exports.BINARY_EVENT = 5;
exports.BINARY_ACK = 6;

var errorPacket = {
  type: exports.ERROR,
  data: 'parser error'
};

function Encoder () {}

Encoder.prototype.encode = function (packet, callback) {
  switch (packet.type) {
    case exports.CONNECT:
    case exports.DISCONNECT:
    case exports.ERROR:
      return callback([ JSON.stringify(packet) ]);
    default:
      return callback([ msgpack.encode([packet.type, packet.data]) ]);
  }
};

function Decoder () {}

Emitter(Decoder.prototype);

Decoder.prototype.add = function (obj) {
  if (typeof obj === 'string') {
    this.parseJSON(obj);
  } else {
    this.parseBinary(obj);
  }
};

Decoder.prototype.parseJSON = function (obj) {
  var decoded;
  try {
    decoded = JSON.parse(obj);
  } catch (e) {
    decoded = errorPacket;
  }
  this.emit('decoded', decoded);
};

Decoder.prototype.parseBinary = function (obj) {
  var decoded;
  try {
    var p = msgpack.decode(obj);
    decoded = { nsp: "/", type: p[0], data: p[1] };
  } catch (e) {
    decoded = errorPacket;
  }
  this.emit('decoded', decoded);
};

Decoder.prototype.destroy = function () {};

exports.Encoder = Encoder;
exports.Decoder = Decoder;
