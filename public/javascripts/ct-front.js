
$(document).ready(function() {

	var seriesPlot = [];
	var excPlot = null;

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

	$('#mktId').change( function() {
		$('#cndlId').val("");
		var exchange = $('#excId').val();
		var market = $(this).val();
		if (exchange.length == 0 || market.length == 0) {
			$('#cndlId').prop("disabled", true);
		} else {
			$('#cndlId').prop("disabled", false);
		}
	});

	$('#cndlId').change(function() {
		var exchange = $('#excId').val();
		var market = $('#mktId').val();
		var candle = $(this).val();
		$('#chartId').empty();
		seriesPlot = [];

		if (exchange.length > 0 && market.length > 0 && candle.length > 0) {
			$.getJSON("/" + exchange + '/' + market + '/' + candle, 
				function(data) {
					var i = 1;
					var min = 0;
					var max = 0;
					for (var i=80; i < data.length; i++) {
						if (min > data[i].lowest) {
							min = data[i].lowest;
						}
						if (max < data[i].highest) {
							max = data[i].highest;
						}
						seriesPlot.push([data[i].collectedTime, data[i].opening, data[i].highest, data[i].lowest, data[i].closure]);
					}

					if (excPlot) {
						excPlot.destroy();
					}

					excPlot = $.jqplot('chartId', [seriesPlot], 
					{
						title: exchange + ' - ' + market + ' (' + candle + ')', 
						axesDefaults: {
						},
						axes: {
							xaxis: {
								renderer:$.jqplot.DateAxisRenderer, 
								tickOptions: {
									angle: -30
								}, 
								numberTicks: 20
							},
								yaxis: {
								tickOptions:{ prefix: '$', angle: -30 }, 
							}
						}, 
				        cursor: {
        				    zoom: true,
            				looseZoom: true
        				}, 
						seriesDefaults: {
							rendererOptions: {
								smooth: true
							}
						},
						series: [{renderer:$.jqplot.OHLCRenderer, rendererOptions:{ candleStick:true }}],
						cursor:{
							showTooltip: true
						},
						highlighter: {
							show: true,
							showMarker:false,
							tooltipAxes: 'xy',
							yvalues: 4,
							formatString:'<table class="jqplot-highlighter"><tr><td>date:</td><td>%s</td></tr><tr><td>open:</td><td>%s</td></tr><tr><td>hi:</td><td>%s</td></tr><tr><td>low:</td><td>%s</td></tr><tr><td>close:</td><td>%s</td></tr></table>'
						}
			    	});

				}
			);
		}
	});	

	$(document).ajaxError(function( event, jqxhr, settings, thrownError ) {
    	// alert('error: ' + JSON.stringify(settings));
	});

});

