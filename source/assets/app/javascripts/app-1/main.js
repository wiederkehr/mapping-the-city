(function() {
/* SETUP
/////////////////////////////////////////////////////////////////*/
var yAxisWidth = 40,
    xAxisHeight = 20,
    margin = {top: 20, right: 20, bottom: 20 + xAxisHeight, left: 20 + yAxisWidth},
    width = 1168 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    years = [],
    dataset = [],
    earning_data,
    spending_data,
    earning_chart,
    spending_chart,
    start_date,
    end_date,
    zoomState = 'zoom-year';
    

var xScaleFocus = d3.time.scale().range([0, width]),
    yScaleFocus = d3.scale.linear().range([0, height/2]);
    yEarningScaleFocus = d3.scale.linear().range([height/2, 0]),
    ySpendingScaleFocus = d3.scale.linear().range([0, height/2]);

var vis = d3.select("#balance_chart")
  .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

vis.append("defs").append("clipPath")
  .attr("id", "clip")
.append("rect")
  .attr("width", width)
  .attr("height", height);

var focus = vis.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xAxis = d3.svg.axis().scale(xScaleFocus).orient("bottom"),
    yEarningAxis = d3.svg.axis().scale(yEarningScaleFocus).orient("left").tickSize(-width),
    ySpendingAxis = d3.svg.axis().scale(ySpendingScaleFocus).orient("left").tickSize(-width);

focus.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")");

focus.append("g")
  .attr("class", "y axis earning_axis");

focus.append("g")
  .attr("class", "y axis spending_axis")
  .attr("transform", "translate(0," + height /2 + ")");
  
/* LOAD DATA
/////////////////////////////////////////////////////////////////*/
queue()
  .defer(d3.csv, "/media/data/personal/gutschriften.csv")
  .defer(d3.csv, "/media/data/personal/lastschriften.csv")
  .await(function(error, _earning, _spending) { 
    if (error) console.error("Noooo!", error);
    earning_data = _earning;
    spending_data = _spending;
    onLoad();
  });
function onLoad(){
  refineData();
  drawVisualization(dataset);
}
function refineData(){
  earning_data = cleanValues(earning_data);
  spending_data = cleanValues(spending_data);
  buildDataset(earning_data.concat(spending_data));
}
function cleanValues(_data){
  _data.forEach(function(d) {
    var dateParts = d.Datum.split(".");
    d.date = new XDate(dateParts[2], (dateParts[1] - 1), dateParts[0]);
    d.earning = accounting.unformat(d.Gutschrift);
    d.spending = accounting.unformat(d.Lastschrift);
    d.description = toTitleCase(d.Avisierungstext);
    years.push(d.date.getFullYear());
  });
  return _data;
}
function buildDataset(_values){
  years = _.uniq(years);
  var earningMean = d3.mean(_values, function(d){ return d.earning; })
  var spendingMean = d3.mean(_values, function(d){ return d.spending; })
  var y = 0;
  years.forEach(function(){
    dataset = d3.time.days(new XDate(years[y], 0, 1), new XDate(years[y] + 1, 0, 1));
    y++;
  })
  var i = -1;
  dataset.forEach(function(d) {
    d.date = d;
    d.earning = 0;
    d.spending = 0;
    d.description = "";
    d.id = ++i;
  });
  _.each(dataset, function(d1){
    _.each(_values, function(d2){
      if(d1.date.getTime() == d2.date.getTime()){
        d1.date = d2.date;
        d1.earning += d2.earning;
        d1.spending += d2.spending;
        d1.description = d1.description + ", " + d2.description;
      }
    })
  })
  start_date = d3.min(dataset, function(d){
    return d.date;
  });
  end_date = d3.max(dataset, function(d){
    return d.date;
  });
}
function drawVisualization(_dataset){
  balance = balanceChart().data(_dataset);
  balance(vis);
  addInteractivity();
}
function toTitleCase(str){
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
/* VISUALIZATION
/////////////////////////////////////////////////////////////////*/
function balanceChart(){
  var data = [];
  var chart = function(vis){
    var maxEarning = d3.max(data, function(d) { return d.earning; }),
    maxSpending = d3.max(data, function(d) { return d.spending; }),
    maxTotal = d3.max([maxSpending, maxEarning]);
    
    xScaleFocus.domain(d3.extent(data.map(function(d) { return d; })));
    yScaleFocus.domain([0, maxTotal]);
    yEarningScaleFocus.domain([0, maxTotal]);
    ySpendingScaleFocus.domain([0, maxTotal]);
    
    
    var dayWidth = xScaleFocus(d3.time.day.offset(start_date, 1)),
    redScale = d3.scale.quantize().domain([0, maxSpending]).range(colorbrewer.Reds[9].slice(3,7)),
    greenScale = d3.scale.quantize().domain([0, maxEarning]).range(colorbrewer.Greens[9].slice(3,7));
    
    focus.select('.x.axis').transition().call(xAxis);
    focus.select('.y.axis.earning_axis').transition().duration(750).call(yEarningAxis);
    focus.select('.y.axis.spending_axis').transition().duration(750).call(ySpendingAxis);
    
    var earning = focus.selectAll(".earning-bar")
      .data(data.filter(function(key) { return key.earning !== 0; }), function(d) { return d.id;})
    
    earning.enter().append("rect")
      .attr("class", "balance-bar earning-bar")
      .attr("clip-path", "url(#clip)")
      .attr("x", function(d) { return xScaleFocus(d.date) - dayWidth/2; })
      .attr("y", function(d) { return height/2 - yScaleFocus(d.earning); })
      .attr("width", dayWidth)
      .attr("height", function(d) { return yScaleFocus(d.earning); })
      .attr("data-amount", function(d) { return accounting.formatMoney(d.earning, { format: "%v" }); })
      .style("fill", function(d, i) { return greenScale(d.earning); });
    earning.transition().duration(750)
      .attr("x", function(d) { return xScaleFocus(d.date) - dayWidth/2; })
      .attr("y", function(d) { return height/2 - yScaleFocus(d.earning); })
      .attr("width", dayWidth)
      .attr("height", function(d) { return yScaleFocus(d.earning); })
      .style("fill", function(d, i) { return greenScale(d.earning); });
    earning.exit().transition().duration(750).style("opacity", 0).remove();
    
    var spending = focus.selectAll(".spending-bar")
      .data(data.filter(function(key) { return key.spending !== 0; }), function(d) { return d.id;})
      
    spending.enter().append("rect")
      .attr("class", "balance-bar spending-bar")
      .attr("clip-path", "url(#clip)")
      .attr("x", function(d) { return xScaleFocus(d.date) - dayWidth/2; })
      .attr("y", function(d) { return height/2; })
      .attr("width", dayWidth)
      .attr("height", function(d) { return yScaleFocus(d.spending); })
      .attr("data-amount", function(d) { return accounting.formatMoney(d.spending, { format: "%v" }); })
      .style("fill", function(d, i) { return redScale(d.spending); });
    spending.transition().duration(750)
      .attr("x", function(d) { return xScaleFocus(d.date) - dayWidth/2; })
      .attr("y", function(d) { return height/2; })
      .attr("width", dayWidth)
      .attr("height", function(d) { return yScaleFocus(d.spending); })
      .style("fill", function(d, i) { return redScale(d.spending); });
    spending.exit().transition().duration(750).style("opacity", 0).remove();
  }
  chart.data = function(value) {
    if(!arguments.length) return data;
    data = value;
    return chart;
  }
  return chart;
}

/* INTERACTIVITY
/////////////////////////////////////////////////////////////////*/
function addInteractivity(){
  $('#time-period button').click(changeTimePeriod);
  function changeTimePeriod(e){
    var id = $(e.target).attr("id");
    if(id != zoomState){
      $("#time-period button").removeClass("active");
      $(e.target).addClass("active");
      zoomState = id;
      switch(id){
        case "zoom-week":
          var period = d3.time.day.offset(start_date, 7);
        break;
        case "zoom-month":
          var period = d3.time.day.offset(start_date, 31);
        break;
        case "zoom-year":
          var period = d3.time.day.offset(start_date, 366);
        break;
      }
      var tData = dataset.filter(function(d){
        return period > d.date;
      })
      drawVisualization(tData);
    }
  }

  $('.earning-bar').qtip({
    content: {
      text: function(api) {
        return $(this).attr('data-amount');
      },
      title: {
        text: "Total earning"
      }
    },
    position: {
      my: 'bottom middle',
      at: 'top middle'
    },
    show: {
      delay: false,
      effect: false,
      solo: true
    },
    hide: {
      delay: 200,
      effect: 'fadeOut',
      fixed: true
    },
    style: {
      classes: 'details',
      tip: {
        corner: true,
        width: 16,
        height: 8,
        border: 1
      }
    }
  });
  $('.spending-bar').qtip({
    content: {
      text: function(api) {
        return $(this).attr('data-amount');
      },
      title: {
        text: "Total spending"
      }
    },
    position: {
      my: 'top middle',
      at: 'bottom middle'
    },
    show: {
      delay: false,
      effect: false,
      solo: true
    },
    hide: {
      delay: 200,
      effect: 'fadeOut',
      fixed: true
    },
    style: {
      classes: 'details',
      tip: {
        corner: true,
        width: 16,
        height: 8,
        border: 1
      }
    }
  });
}
/* END
/////////////////////////////////////////////////////////////////*/
})()