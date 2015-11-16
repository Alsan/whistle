var Transform = require('pipestream').Transform;
var util = require('util');
var iconv = require('iconv-lite');
var STATUS_CODES = http.STATUS_CODES || {};

function FileWriterTransform(writer, source, isRaw, isReq) {
	if (!(this instanceof FileWriterTransform)) {
		  return new FileWriterTransform(options);
	  }
	var self = this;
	Transform.call(self);
	self._writer = writer;
	source.on('error', function() {
		writer.end();
	});
	isRaw && writer.write(getRawData(source, isReq));
}

function getRawData(source, isReq) {
	var firstLine = isReq ? [source.method, source.url, 'HTTP/' + (source.httpVersion || '1.1')].join(' ')
			: ['HTTP/1.1', source.statusCode, source.statusMessage || STATUS_CODES[source.statusCode] || ''].join(' ');
	var headers = Object.keys(source.headers).map(function(key) {
			var val = source.headers[key];
			if (!Array.isArray(val)) {
				return key + ': ' + (val == null ? '' : val);
			}
			
			return val.map(function(item) {
				return key + ': ' + (item == null ? '' : item); 
			}).join('\r\n');
	}).join('\r\n');
	
	return firstLine + '\r\n' + headers + '\r\n\r\n';
}

util.inherits(FileWriterTransform, Transform);

FileWriterTransform.prototype._transform = function(chunk, encoding, callback) {
	if (chunk) {
		this._writer.write(chunk);
	} else {
		this._writer.end();
	}
	
	callback(null, chunk);
};

module.exports = FileWriterTransform;