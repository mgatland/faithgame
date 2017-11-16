//hacks to work without node
if (typeof require=="function") {
	var base64 = require('base64-js')
} else {
	base64 = window.base64js;
	var module = {}
}

module.exports = {
  encode: function (rle) {
    return base64Encode(binaryCompress(rle));
  },
  decode: function (base64string) {
    return binaryDecompress(base64Decode(base64string));
  }
};

if (!(typeof require=="function")) {
	window.compression = module.exports;
}

//////////////////// binary encoding code and test

function testEncoding() {
	console.log("Test encoding:");
	var test = [195, "0"];
	console.log(test);
	var test1 = binaryCompress(test)
	console.log(test1);
	var test2 = base64Encode(test1)
	console.log(test2);
	var test3 = base64Decode(test2)
	console.log(test3);
	var test4 = binaryDecompress(test3);
	console.log(test4);
	console.log("did it work? " + (test.join()===test4.join()))
	console.log("done");
}
//testEncoding();

//input: length-encoded array: [count, string, count, string]
//we assume the string is always "0", "1", "2" or "3"
//and length is at most 10,000 (the size of a frame)
//this means the color fits in 2 bits, and the length in 14 bits!
//result is 16 bits: [14 bit length | 2 bit color ]
//write it as [8 bit length] [ 6 bit length | 2 bit color]
function binaryCompress(rle) {
	var result = [];
	var bitMask = 0xff;
	var binary = new Uint8Array();
	for (var i = 0; i < rle.length; i+= 2) {
		var num1 = (rle[i] >> 6)
		var num2 = ((rle[i] % 64) << 2) + parseInt(rle[i+1])
		result.push(num1);
		result.push(num2);
	}
	return Uint8Array.from(result);
}

function binaryDecompress(binary) {
	var rle = [];
	var colorMask = 1 | 2;
	for (var i = 0; i < binary.length; i+= 2) {
		var length = binary[i] << 6;
		length += (binary[i+1]) >> 2;
		var color = binary[i+1] & colorMask;
		rle.push(length);
		rle.push(""+color);
	}
	return rle;
}

function base64Encode(binary) {
	//return Buffer.from(binary).toString("base64");
	return base64.fromByteArray(binary);
}

function base64Decode(string) {
	//var buffer = Buffer.from(string, "base64");
	//return new Uint8Array(buffer);
	return base64.toByteArray(string);
}
