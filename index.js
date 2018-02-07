var OPS = require('bitcoin-ops')

function encodingLength (i) {
  return i < OPS.OP_PUSHDATA1 ? 1
  : i <= 0xff ? 2
  : i <= 0xffff ? 3
  : 5
}

function encode (number, buffer, offset) {
  if (!buffer) buffer = Buffer.alloc(encodingLength(number))
  if (!Buffer.isBuffer(buffer)) throw new TypeError('buffer must be a Buffer instance')
  if (!offset) offset = 0

  var size = encodingLength(number)

  // ~6 bit
  if (size === 1) {
    buffer.writeUInt8(number, offset)

  // 8 bit
  } else if (size === 2) {
    buffer.writeUInt8(OPS.OP_PUSHDATA1, offset)
    buffer.writeUInt8(number, offset + 1)

  // 16 bit
  } else if (size === 3) {
    buffer.writeUInt8(OPS.OP_PUSHDATA2, offset)
    buffer.writeUInt16LE(number, offset + 1)

  // 32 bit
  } else {
    buffer.writeUInt8(OPS.OP_PUSHDATA4, offset)
    buffer.writeUInt32LE(number, offset + 1)
  }

  encode.bytes = size
  return buffer
}

function decode (buffer, offset) {
  var opcode = buffer.readUInt8(offset)
  var number

  // ~6 bit
  if (opcode < OPS.OP_PUSHDATA1) {
    number = opcode
    decode.bytes = 1

  // 8 bit
  } else if (opcode === OPS.OP_PUSHDATA1) {
    number = buffer.readUInt8(offset + 1)
    decode.bytes = 2

  // 16 bit
  } else if (opcode === OPS.OP_PUSHDATA2) {
    number = buffer.readUInt16LE(offset + 1)
    decode.bytes = 3

  // 32 bit
  } else {
    if (opcode !== OPS.OP_PUSHDATA4) throw new Error('Unexpected opcode')

    number = buffer.readUInt32LE(offset + 1)
    decode.bytes = 5
  }

  return number
}

module.exports = {
  encodingLength: encodingLength,
  encode: encode,
  decode: decode
}
