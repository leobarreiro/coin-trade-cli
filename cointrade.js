var bodyParser = require('body-parser');
var request = require('request');

cointradeCLI = new function() {

	this.params = {exchange: '', excList: [], market: '', mktList: [], candle: '', candList: []};

	var ctCLI = this;

	this.cbPostFields = function(req, res, next) {
		if (req.method === 'POST') {
			if (req.body.exc) {
				ctCLI.params.exchange = req.body.exchange;
			}
			if (req.body.mkt) {
				ctCLI.params.market = req.body.market;	
			}
			if (req.body.cndl) {
				ctCLI.params.candle = req.body.candle;	
			}
		} 
		else {
			// var pathName = req.originalUrl;
			// if (pathName.startsWith("/track")) {
			// 	if (pathName.startsWith('/')) {
			// 		pathName = pathName.substring(1);
			// 	}
			// 	var reqParts = pathName.split('/');
			// 	// console.log(reqParts);
			// 	if (reqParts.length > 1) {
			// 		ctCLI.params.exchange = reqParts[1];
			// 	}
			// 	if (reqParts.length > 2) {
			// 		ctCLI.params.market = reqParts[2];
			// 	}
			// 	if (reqParts.length > 3) {
			// 		ctCLI.params.candle = reqParts[3];
			// 	}
			// }
		}
		next();
	};

	this.handleError = function(err, req, res, next) {
		// set locals, only providing error in development
		res.locals.message = err.message;
		res.locals.error = req.app.get('env') === 'development' ? err : {};
		// render the error page
		res.status(err.status || 500);
		res.render('error', {status: err.status, msg: JSON.stringify(err.message)});
	};

	this.error404 = function(req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	};

}
