			Date.prototype.withoutTime = function () {
			    var d = new Date(this);
			    d.setHours(0, 0, 0, 0);
			    return d;
			}

			$('#timeSelector').click(function () {

				$('#skillMetrics').hide();

				$('#introduction').hide();

				$('#timeMetrics').show();

				$('#resetAll').show();

			});

			$('#skillSelector').click(function () {

				$('#timeMetrics').hide();

				$('#introduction').hide();

				$('#skillMetrics').show();

				$('#resetAll').show();

			});

			$('#introSelector').click(function () {

				$('#timeMetrics').hide();

				$('#skillMetrics').hide();

				$('#resetAll').hide();

				$('#introduction').show();

			});

			$('#introSelector').focus();

			$('#resetYear').click(function () {
					yearChart.filter(null);
					dc.redrawAll();
			});	

			$('#resetMonth').click(function () {
					monthChart.filter(null);
					dc.redrawAll();
			});	

			$('#resetDay').click(function () {
					dayChart.filter(null);
					dc.redrawAll();
			});	

			$('#resetHour').click(function () {
					hourChart.filter(null);
					dc.redrawAll();
			});	

			$('#resetWin').click(function () {
					winChart.filter(null);
					dc.redrawAll();
			});


			$('#resetHeat').click(function () {
					heatMapChart.filter(null);
					dc.redrawAll();
			});

			$('#resetAll').click(function () {
					dc.filterAll(); 
					dc.redrawAll();
			});	

			var winChart = dc.pieChart('#winChart'),
				yearChart = dc.rowChart("#yearChart"),
				monthChart = dc.rowChart("#monthChart"),
				dayChart = dc.rowChart("#dayChart"),
				hourChart = dc.barChart("#hourChart"),
				kdaChart = dc.lineChart("#kdaChart");
				heatMapChart = dc.heatMap("#heatMapChart");

			var month = [ "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dic"];
			var day = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

			d3.json("matches.json", function (data){
				
				data.forEach(function(data){
					data.start_time = new Date(data.start_time * 1000);
					if ((data.player_slot > 10 && !data.radiant_win) ||
						(data.player_slot < 10 && data.radiant_win))
						data.win = 1;
					else
						data.win = 0;
				});

				var ndx = crossfilter(data);
				var all = ndx.groupAll();

				var winDim = ndx.dimension(function(d){ return d.win;});
				var yearDim = ndx.dimension(function(d){ return d.start_time.getFullYear();});
				var monthDim = ndx.dimension(function(d){ return month[d.start_time.getMonth()];});
				var dayDim = ndx.dimension(function(d){ return day[d.start_time.getDay()];});
				var hourDim = ndx.dimension(function(d){ return d.start_time.getHours();});
				var kdaDim = ndx.dimension(function(d){ return d.start_time.withoutTime();});
				var heatDim = ndx.dimension(function(d){ return [d.start_time.getMonth(), d.start_time.getFullYear()];});

				var winGroup = winDim.group();				
				var yearGroup = yearDim.group();
				var monthGroup = monthDim.group();
				var dayGroup = dayDim.group();
				var hourGroup = hourDim.group();
				var kdaGroup = kdaDim.group().reduce(
			    
			        function (p, v) {
			            ++p.count;
			            div = v.deaths == 0 ? 1 : v.deaths;
			            p.sum += Math.round((v.kills + v.assists) / div);
			            p.avg = Math.round(p.sum / p.count);
			            return p;
			        },
			    
			        function (p, v) {
			            --p.count;
			            div = v.deaths == 0 ? 1 : v.deaths;
			            p.sum -= Math.round((v.kills + v.assists) / div);
						p.avg = p.count ? Math.round(p.sum / p.count) : 0;
						return p;		        
					},
			    
			        function () {
			            return {
			                count: 0,
			                sum: 0,
			                avg: 0
			            };
			        }
			    );
			    var heatGroup = heatDim.group();

				winChart 
        			.width(320)
        			.height(300)        			
        			.minAngleForLabel(0)
        			.dimension(winDim)
        			.externalRadiusPadding(45)        			
        			.ordinalColors(['#2ca02c', '#e41a1c'])
        			.group(winGroup)
        			.label(function(d) { });

				winChart.on('renderlet', function(chart) {
					chart.selectAll('text.pie-slice').text( function(d) {
						return dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
					})
				});

				monthChart
					.width(500)
					.height(400)
					.dimension(monthDim)
					.elasticX(true)
					.group(monthGroup)
					.ordinalColors(['#FF8066'])
					.ordering(function(d){
						switch(d.key){
							case 'Jan': 
    							return 0;
    							break;
    						case 'Feb': 
    							return 1;
    							break;
    						case 'Mar': 
    							return 2;
    							break;
    						case 'Apr': 
    							return 3;
    							break;
    						case 'May': 
    							return 4;
    							break;
    						case 'Jun': 
    							return 5;
    							break;
    						case 'Jul': 
    							return 6;  
    							break;
    						case 'Aug': 
    							return 7;
    							break;
    						case 'Sep': 
    							return 8;
    							break;
    						case 'Oct': 
    							return 9;
    							break;
    						case 'Nov': 
    							return 10;
    							break;
    						case 'Dic': 
    							return 12;
    							break;
						}
					});				

				dayChart
					.width(500)
					.height(400)
					.dimension(dayDim)
					.elasticX(true)
					.group(dayGroup)
					.ordinalColors(['#ff941c'])
					.ordering(function(d) {					
    					switch (d.key){
    						case 'Mon': 
    							return 0;
    							break;
    						case 'Tue': 
    							return 1;
    							break;
    						case 'Wed': 
    							return 2;
    							break;
    						case 'Thu': 
    							return 3;
    							break;
    						case 'Fri': 
    							return 4;
    							break;
    						case 'Sat': 
    							return 5;
    							break;
    						case 'Sun': 
    							return 6;    							
    					}
					});

				yearChart
					.width(500)
					.height(400)
					.dimension(yearDim)
					.elasticX(true)
					.group(yearGroup)
					.ordinalColors(['#9B89B3'])
					.ordering(function(d) {						
    					switch (d.key){
    						case 2012: 
    							return 0;
    							break;
    						case 2013: 
    							return 1;
    							break;
    						case 2014: 
    							return 2;
    							break;
    						case 2015: 
    							return 3;
    							break;
    						case 2016: 
    							return 4;
    							break;
    						case 2017: 
    							return 5;
    							break;
    						case 2018: 
    							return 6;
    							break;    							
							case 2019: 
    							return 6;
    							break;
    					}
					});


				hourChart
					.width(500)
					.height(400)	
					.dimension(hourDim)
					.elasticX(true)
					.elasticY(true)
					.renderHorizontalGridLines(true)
					.x(d3.scaleLinear().domain([0, 23]))	
					.group(hourGroup)
					.ordinalColors(['#4E8397']);

					hourChart.margins({ top: 0, left: 40, right: 40, bottom: 30 })
				
				kdaChart
					.width(850)					
					.dimension(kdaDim)
					.elasticX(true)
					.elasticY(true)
					.brushOn(false)
					.renderHorizontalGridLines(true)
					.x(d3.scaleTime().domain([new Date('2012-22-10'), new Date('2019-05-04')]))	
					.group(kdaGroup)
					.valueAccessor(function (d) {
            			return d.value.avg;
        			});

        		var initheat = true;

				heatMapChart
	    			.width(600).height(400)
					.dimension(heatDim)
				    .group(heatGroup)
				    .keyAccessor(function(d) {
					    return +d.key[0];
			  	    })
					.valueAccessor(function(d) {
					return +d.key[1];
					})
					.colorAccessor(function(d) {
					return +parseFloat(d.value).toFixed(2);
					})
					.colsLabel(function(d) {
					return month[d];
					})
					.colors(["#fedc56", "#FFBF00", "#F9A602", "#41b6c4", "#588bae", "#1d91c0", "#225ea8", "#253494", "#081d58"])
					.calculateColorDomain()
					.rowOrdering(d3.descending)
					.title(function(d) {
    					return d.value
  					})
					.on('preRedraw', function() {
    					heatMapChart.calculateColorDomain();
					})
					.on('renderlet.label', function(chart) {
						if (initheat) {
							initheat = false;
					        var text = chart.selectAll('g.box-group')
					       	.selectAll('text.annotate').data(d => [d]);
					        text.exit().remove();
					        // enter attributes => anything that won't change
					        var textEnter = text.enter()
					        .append('text')
					        .attr('class', 'annotate')
					        textEnter.selectAll('tspan')
					        .data(d => [d.value])
					        .enter().append('tspan')
					        .attr('text-anchor', 'middle')
					        .attr('dy', 10);
					        text = textEnter.merge(text);
					        // update attributes => position and text
					        text
					        .attr('y', function() {
					        var rect = d3.select(this.parentNode).select('rect');
					        return +rect.attr('y') + rect.attr('height')/2 - 5;
					        });
					        text.selectAll('tspan')
					        .attr('x', function() {
						        var rect = d3.select(this.parentNode.parentNode).select('rect');
						        return +rect.attr('x') + rect.attr('width')/2;
					      	})
					        .text(d => d);
				    	}
				    	else {
				    		$('.box-group').each(function () {
								var value = jQuery(this).children("title").text();
  								jQuery(this).children("text").children("tspan").text(value);
							});
				    	}
				  });

				heatMapChart.margins({ top: 0, left: 40, right: 40, bottom: 50 }) 

				dc.renderAll();
			});