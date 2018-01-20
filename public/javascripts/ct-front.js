
$(document).ready(function() {

	var seriesPlot = [];
	var excPlot = null;
	
	var formatFiatCurrency = function(num) {
		return num.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
	}
	
	var formatDecimal = function(num) {
		return num.toLocaleString('pt-BR', {style: 'decimal', minimumIntegerDigits: 1, maximumFractionDigits: 2});
	}
	
	var showSummary = function(mktName, curName, mktCap, mktCur, variation, lowestAsk, highestBid, spread) {
		$('#summaryId').css('display', 'block').css('visibility', 'visible');
		$('#sumMktNameId').html("Market " + mktName);
		$('#sumMktCapId').html(formatFiatCurrency(mktCap));
		$('#sumCurCapId').html(formatDecimal(mktCur) + ' ' + curName);
		$('#sumVarId').html(formatDecimal(variation) + '%');
		if (variation > 0) {
			$('#sumVarId').css('color', 'green');
		} else if (variation < 0) {
			$('#sumVarId').css('color', 'red');
		} else {
			$('#sumVarId').css('color', 'black');
		}
		$('#sumLowAskId').html(formatFiatCurrency(lowestAsk));
		$('#sumHighBidId').html(formatFiatCurrency(highestBid));
		$('#sumSpreadId').html(formatDecimal(spread) + '%');
		if (spread > 1.5) {
			$('#sumSpreadId').css('color', 'red');
		} else {
			$('#sumSpreadId').css('color', 'gray');
		}
		return;
	}
	
	var hideSummary = function() {
		$('#summaryId').css('display', 'none');
		return;
	}
	
	var requestCandles = function() {
		var exchange = $('#excId').val();
		var market = $('#mktId').val();
		var candle = $('#cndlId').val();
		
		seriesPlot = [];
		
		if (exchange.length == 0 || market.length == 0 || candle.length == 0) {
			return;
		}

		$.getJSON("/" + exchange + '/' + market + '/' + candle, 
			function(data) {
				var i = 1;
				var min = 0;
				var max = 0;
				var cds = data.candles;
				var start = (candle === 'MIN10') ? (cds.length - 	120) : (cds.length - 30);
				
				for (var i=start; i < cds.length; i++) {
					if (min > cds[i].lowest) {
						min = cds[i].lowest;
					}
					if (max < cds[i].highest) {
						max = cds[i].highest;
					}
					seriesPlot.push([cds[i].collectedTime, cds[i].opening, cds[i].highest, cds[i].lowest, cds[i].closure]);
				}

				if (excPlot) {
					hideSummary();
					excPlot.destroy();
				}

				$.jqplot.sprintf.thousandsSeparator = '.';
				
				excPlot = $.jqplot('chartId', [seriesPlot], 
				{
					title: exchange + ' - ' + market + ' (' + candle + ')', 
					axesDefaults: {
						tickOptions: {
							textColor: '#000000', 
							fontSize: '8pt' 
						} 
					}, 
					axes: {
						xaxis: {
							renderer:$.jqplot.DateAxisRenderer, 
			                rendererOptions:{
			                    tickRenderer:$.jqplot.CanvasAxisTickRenderer
			                },
							tickOptions: {
								formatter: $.jqplot.DefaultTickFormater, 
								mark: 'cross', 
								textAngle: -30, 
								formatString: '%Hh%M' 
							} 
						},
						yaxis: {
			                rendererOptions:{
			                    tickRenderer:$.jqplot.CanvasAxisTickRenderer
			                }, 
							tickOptions:{ 
								prefix: '$ ', 
								angle: -30, 
								formatString: "%'i"
							}, 
						}
					}, 
					seriesDefaults: {
						renderer:$.jqplot.OHLCRenderer, 
						rendererOptions:{ 
							smooth: true, 
							candleStick:true, 
							upBodyColor: '#006600', 
							downBodyColor: '#ff0000', 
							fillUpBody: true, 
							lineWidth: 1.2, 
							color: '#000000'
						} 
					}, 
					highlighter: {
						show: true,
						yvalues: 4, 
						bringSeriesToFront: true, 
						formatString:'<table class="jqplot-highlighter"><tr><td>time:</td><td>%s</td></tr><tr><td>open:</td><td>%s</td></tr><tr><td>high:</td><td>%s</td></tr><tr><td>low:</td><td>%s</td></tr><tr><td>close:</td><td>%s</td></tr></table>'
					}, 
					cursor: {
					      show: true,
					      tooltipLocation:'sw'
					    }
		    	});
				
				// mktName, mktCap, mktCur, variation, lowestAsk, highestBid, spread
				showSummary(data.market.name, data.market.changeCoin.name.symbol, data.lastTicker.marketCap, data.lastTicker.currencyVolume, data.lastTicker.percentChange, data.lastTicker.lowestAsk, data.lastTicker.highestBid, data.lastTicker.spread);

			}
		);
		return;
	}

	$('#excId').change(function() {
		var exchange = $(this).val();
		if (exchange.length > 0) {
			$.getJSON("/" + exchange, 
				function(data){
					$('#mktId').children().remove().end().append('<option value="">Mercado...</option>');
					$.each(data, function(index, value) {
						$('#mktId').append('<option value="' + value.name + '">' + value.name + '</option>');
					});
					$('#mktId').prop("disabled", false);
				}
			);
		} else {
			$('#mktId').children().remove().end().append('<option value="">Mercado...</option>');
			$('#mktId').prop("disabled", true);
			$('#cndlId').val("");
			$('#cndlId').prop("disabled", true);
		}
	});

	$('#mktId').change(function() {
		// $('#cndlId').val("");
		var exchange = $('#excId').val();
		var market = $(this).val();
		if (exchange.length == 0 || market.length == 0) {
			$('#cndlId').prop("disabled", true);
		} else {
			$('#cndlId').prop("disabled", false);
			if ($('#cndlId').val().length > 0) {
				requestCandles();
			}
		}
	});

	$('#cndlId').change(function() {requestCandles();});

	$(document).ajaxError(function( event, jqxhr, settings, thrownError ) {
    	// alert('error: ' + JSON.stringify(settings));
	});
	
	$(document).ajaxStart(function(){
	    $("#loadingId").css("visibility", "visible");
	});

	$(document).ajaxComplete(function(){
	    $("#loadingId").css("visibility", "hidden");
	});

	var updateMode = setInterval(function(){ requestCandles(); }, 60000);
	
});

