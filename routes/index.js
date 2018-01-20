var express = require('express');
var resources = require('../cointrade');
var https = require('https');

var router = express.Router();
var request = require('request');
var ctcli = cointradeCLI;

var apiUrl = 'https://api.javaleo.org';

var agentOptions;
var agent;

agentOptions = {
	host : 'api.javaleo.org',
	port : '443',
	path : '/',
	rejectUnauthorized : false
};

agent = new https.Agent(agentOptions);

router.use(ctcli.cbPostFields);

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

router.get('/', function(req, res, next) {
	request({url: apiUrl + '/exchange/list', method: 'GET', agent: agent}, 
			function(error, response, body) {
		if (!error && response.statusCode == 200) {
			excResp = JSON.parse(body);
			ctcli.params.excList = excResp.exchanges;
			res.render('index', ctcli.params);
		} else {
			console.log(error);
			res.render('error', {
				status : 500,
				msg : 'Erro ao recuperar as exchanges'
			});
		}
	});
});

router.get('/:exchange([a-zA-Z]{3,20})', function(req, res, next) {
	ctcli.params.exchange = req.params.exchange;
	var restUrl = apiUrl + '/market/list/' + ctcli.params.exchange;
	console.log('Testing console output.');
	request({url: restUrl, method: 'GET', agent: agent}, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			restRsp = JSON.parse(body);
			ctcli.params.mktList = restRsp.markets;
			res.json(restRsp.markets);
		} else {
			res.json({
				ok : false,
				msg : 'Erro ao recuperar os mercados'
			});
		}
	});

});

router.get(
	'/:exchange([a-zA-Z]{3,20})/:market([A-Z]{6})/:candle([A-Z]{3,4}[0-9]{2})$',
	function(req, res, next) {
		ctcli.params.exchange = req.params.exchange;
		ctcli.params.market = req.params.market;
		ctcli.params.candle = req.params.candle;
		var restUrl = apiUrl + '/candle/' + ctcli.params.exchange
				+ '/' + ctcli.params.market + '/'
				+ ctcli.params.candle;
		request({url: restUrl, method: 'GET', agent: agent}, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				restRsp = JSON.parse(body);
				res.json(restRsp);
			} else {
				res.json(response);
			}
		});
});

module.exports = router;
