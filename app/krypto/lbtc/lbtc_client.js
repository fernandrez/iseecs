var request = require('request')
var crypto		= require('crypto');
var querystring	= require('querystring');
const config = require('../../config');
const logger		= require('../../logger');

var nonce = (new Date).getTime();


function LBCClient(key, secret, otp) {
	var self = this;

	var config = {
		url: 'https://localbitcoins.com/',
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
        get: [//'buy-bitcoins-online/ar/argentina/.json','sell-bitcoins-online/ar/argentina/.json',
            'buy-bitcoins-online/ar/argentina/.json','sell-bitcoins-online/ar/argentina/.json',
						'buy-bitcoins-online/ar/argentina/national-bank-transfer/.json','sell-bitcoins-online/ar/argentina/national-bank-transfer/.json',
						'buy-bitcoins-online/co/colombia/.json','sell-bitcoins-online/co/colombia/.json',
						'buy-bitcoins-online/co/colombia/national-bank-transfer/.json','sell-bitcoins-online/co/colombia/national-bank-transfer/.json',
            'buy-bitcoins-online/us/united-states/national-bank-transfer/.json','sell-bitcoins-online/us/united-states/national-bank-transfer/.json',
        ],
        post: []
      },
			private: {
        get: ['api/contact_message_attachment/','api/ad-get/','api/ads/','api/recent_messages/','api/dashboard/','api/dashboard/released/','api/contact_messages/'],
        post: ['api/ad/','api/ad-create/','api/ad-delete/','api/contact_message_post/']
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

		var headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Apiauth-Key': config.key,
			'Apiauth-Nonce': nonce,
			'Apiauth-Signature': signature,
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
		var postParameters	= querystring.stringify(params);
    postParameters = postParameters.replace(/\*/g,"%2A");
    postParameters = postParameters.replace(/\(/g,"%28");
    postParameters = postParameters.replace(/\)/g,"%29");
    path = '/' + path.replace(/\?/g,'');
		//console.log('post',postParameters);
		var message = nonce + config.key + path + postParameters;
		var auth_hash = crypto.createHmac("sha256", config.secret).update(message).digest('hex').toUpperCase();
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
 			   options.form = querystring.stringify(params); break;
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
    switch(method){
      case 'get':
          req = request.get(options, cbF)
        break;
        case 'post':
          req = request.post(options, cbF)
					//console.log(req.body);
        break;
    }
		return req;
	}

	self.api			= api;
	self.publicMethod	= publicMethod;
	self.privateMethod	= privateMethod;
}

module.exports = LBCClient;
