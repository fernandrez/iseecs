var request = require('request')
var crypto		= require('crypto');
var querystring	= require('querystring');
const config = require('../../config');
const logger		= require('../../logger');

var nonce = (new Date).getTime();


function PXFLClient(key, secret, otp) {
	var self = this;

	var config = {
		url: 'https://paxful.com/',
		key: key,
		secret: secret,
		otp: otp,
		timeoutMS: 5000
	};

	/**
	 * This method makes a public or private API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object
	 */
	function api(method, params, callback) {
		var methods = {
			public: {
        get: [
        ],
        post: []
      },
			private: {
        get: [

				],
        post: ['api/offer/all', 'api/wallet/balance', 'api/offer/list', 'api/trade/list']
      }
		};

    const methodArray = method.split('/');
    const shortMethod = methodArray[0]+'/'+methodArray[1]+'/';
    if(methods.public.get.indexOf(shortMethod) !== -1 || methods.public.get.indexOf(method) !== -1) {
			return publicMethod(method, 'get', params, callback);
		}
    else if(methods.public.post.indexOf(shortMethod) !== -1 || methods.public.post.indexOf(method) !== -1) {
			return publicMethod(method, 'post', params, callback);
		}
		else if(methods.private.get.indexOf(shortMethod) !== -1 || methods.private.get.indexOf(method) !== -1) {
			return privateMethod(method, 'get', params, callback);
		}
		else if(methods.private.post.indexOf(shortMethod) !== -1 || methods.private.post.indexOf(method) !== -1) {
			return privateMethod(method, 'post', params, callback);
		}
		else {
			throw new Error(method + ' is not a valid API method.');
		}
	}

	/**
	 * This method makes a public API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object
	 */
	function publicMethod(method, verb, params, callback) {
		params = params || {};

		var url		= config.url + method;

		return rawRequest(url, verb, {}, params, callback);
	}

	/**
	 * This method makes a private API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object
	 */
	function privateMethod(method, verb, params, callback) {
		params = params || {};

		const url		= config.url + method;
    const nonce = 5000 * (new Date).getTime();
    //console.log(method, nonce);
		const signature = getMessageSignature(method, params, nonce);
		params.apiseal = signature;
		var headers = {
			'Content-Type': 'text/plain',
			'Accept': 'application/json',
      'Referer': 'iseeci.com'
		};
		return rawRequest(url, verb, headers, params, callback);
	}

	/**
	 * This method returns a signature for a request as a Base64-encoded string
	 * @param  {String}  path    The relative URL path for the request
	 * @param  {Object}  request The POST body
	 * @param  {Integer} nonce   A unique, incrementing integer
	 * @return {String}          The request signature
	 */
	function getMessageSignature(path, params, nonce) {
		params.apikey = config.key;
		params.nonce = nonce;
		var postParameters	= querystring.stringify(params);
    postParameters = postParameters.replace(/\*/g,"%2A");
    postParameters = postParameters.replace(/\(/g,"%28");
    postParameters = postParameters.replace(/\)/g,"%29");
    path = '/' + path.replace(/\?/g,'');
		logger.info('post', postParameters);
		var message = postParameters;
		var auth_hash = crypto.createHmac("sha256", config.secret).update(message).digest('hex');
		logger.info('auth_hash', auth_hash);
		return auth_hash;
	}

	/**
	 * This method sends the actual HTTP request
	 * @param  {String}   url      The URL to make the request
	 * @param  {Object}   headers  Request headers
	 * @param  {Object}   params   POST body
	 * @param  {Function} callback A callback function to call when the request is complete
	 * @return {Object}            The request object
	 */
	function rawRequest(url, method, headers, params, callback) {

		var options = {
			url: url,
			headers: headers,
		};

    switch(method){
      case 'get':
        if(params && querystring.stringify(params) != '')
 			   options.url += '?'+querystring.stringify(params); break;
       case 'post':
 			   options.body = querystring.stringify(params); break;
			   //options.url += '?'+querystring.stringify(params); break;
    }

    let cbF = function(error, response, body) {

			if(typeof callback === 'function') {
				var data;
				if(error) {
					callback.call(self, new Error('Error in server response: ' + JSON.stringify(error)), null);
					return;
				}

				try {
					if(response.headers['content-type'] == 'image/png' ||
						response.headers['content-type'] == 'image/jpg' ||
						response.headers['content-type'] == 'image/jpeg'){
						logger.info("headers ", response.headers);
						logger.info("Image: ", body);
						data = body;
					} else {
						data = JSON.parse(body);
					}
				}
				catch(e) {
					callback.call(self, new Error('Could not understand response from server: ' + body), null);
					return;
				}

				if(data.error && data.error.length) {
					callback.call(self, data.error, null);
				}
				else {
					callback.call(self, null, data);
				}
			}
		}

		var req;
		if(url.indexOf('attachment') != -1){
			options.encoding = null;
		}
		logger.info("Options", options);
    switch(method){
      case 'get':
          req = request.get(options, cbF)
        break;
      case 'post':
          req = request.post(options, cbF)
        break;
    }
		return req;
	}

	self.api			= api;
	self.publicMethod	= publicMethod;
	self.privateMethod	= privateMethod;
}

module.exports = PXFLClient;
