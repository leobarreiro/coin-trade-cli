var express = require('express');
var resources = require('../cointrade');

var router = express.Router();
var request = require('request'); 
var ctcli = cointradeCLI;


router.use(ctcli.cbPostFields);

router.get('/', function(req, res, next) {
	request('http://javaleo.org:7071/exchange/list', function(error, response, body) {
		if (!error && response.statusCode == 200) {
			excResp = JSON.parse(body);
			ctcli.params.excList = excResp.exchanges;
			res.render('index', ctcli.params);
		} else {
			console.log(error);
			res.render('error', {status: 500, msg: 'Erro ao recuperar as exchanges'});
		}
	});
});

router.get('/:exchange([a-zA-Z]{3,20})', function(req, res, next) {
	ctcli.params.exchange = req.params.exchange;
	var restUrl = 'http://javaleo.org:7071/markets/' + ctcli.params.exchange;
	request(restUrl, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			restRsp = JSON.parse(body);
			ctcli.params.mktList = restRsp.markets;
			res.json(restRsp.markets);
		} else {
			res.json({ok: false, msg: 'Erro ao recuperar os mercados'});
		}
	});

});

router.get('/:exchange([a-zA-Z]{3,20})/:market([A-Z]{6})/:candle([A-Z]{3,4}[0-9]{2})$', function(req, res, next) {
	ctcli.params.exchange 	= req.params.exchange;
	ctcli.params.market 	= req.params.market;
	ctcli.params.candle 	= req.params.candle;
	var restUrl = 'http://javaleo.org:7071/candles/' + ctcli.params.exchange + '/' + ctcli.params.market + '/' + ctcli.params.candle;
	request(restUrl, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			restRsp = JSON.parse(body);
			res.json(restRsp.candles);
		} else {
			res.json(response);
		}
	});

});

module.exports = router;
