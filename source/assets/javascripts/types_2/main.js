(function() {
/* SETUP
/////////////////////////////////////////////////////////////////*/
var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 940 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom,
    diameter = 300,
    minSize = 20,
    maxSize = diameter/2,
    minRoom = 0,
    maxRoom = 26;

var polar, r, s, t, tPolar;

t = function(x, y) {
  return "translate(" + x + "," + y + ")";
};

polar = function(angle, radius) {
  var x, y;
  x = Math.cos(angle - Math.PI / 2) * radius;
  y = Math.sin(angle - Math.PI / 2) * radius;
  return {
    x: x,
    y: y
  };
};

r = function(angle) {
  return "rotate(" + (angle / Math.PI * 180) + ")";
};

s = function(scale) {
  return "scale(" + scale + ")";
};

var sizeScale = d3.scale.linear().range([minSize,maxSize]).domain([minRoom,maxRoom]);
var tree = d3.layout.tree().size([360, diameter / 2])

var pie = d3.layout.pie()
  .sort(function(a,b) { return a.name > b.name ? 1 : a.name < b.name ? -1 : 0 })
	.value(function(d) { return sizeScale(1); });

var arc = d3.svg.arc()
  .innerRadius(function(d) {
    return sizeScale(1);
  })
  .outerRadius(function(d) {
    return sizeScale(d.data.size+1);
  })

var svg = d3.select("#chart").append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("/data/locations.json", function(error, data) {
  var groups = svg.selectAll('.group')
    .data(data)
    .enter().append('g')
    .attr({
      'class': 'group',
      'transform': function(d, i) { 
        n = Math.floor(width/diameter);
        return "translate(" + (diameter/2 + i % n * diameter) + "," + (diameter/2 + Math.floor(i/n) * diameter) + ")"; 
        return "translate(" + i % n * diameter + "," + Math.floor(i/n) * diameter + ")";
      }
    })

  var pies = groups.selectAll(".pie")
    .data(function(d) {
      d.children.forEach(function(c) {
        c.r = sizeScale(d.size);
      });
      return pie(d.children);
    })
    .enter().append("g")
    .attr("d", arc)
    .attr("class", "pie")
    .attr("transform", function(d){
      return r(Math.PI/2);
    })
    .attr("transform", function(d) { 
      return d.name == "total" ? null : "rotate(" + (d.x - 150) + ")"; 
    });

    groups.append("circle")
      .style("stroke", function(d) { return d.name == "SPI" ? "white" : "none"; })
      .style("stroke-width", function(d) { return d.name == "SPI" ? 1.2 + "px" : "none"; })
      .style("fill", function(d) { return d.name == "SPI" ? "black" : null; })
      .attr("r", function(d) { 
        sizeScale.range([0,maxSize]);
        return sizeScale(d.amount);
      })
    
    groups.append("text")
    .attr("dy", "7px")
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("fill", "white")
    .attr("transform", function(d) { return "rotate(-210)"; })
    .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
    .text(function(d) { return d.name == "SPI" ? roundNumber(d.size, 2) : 0; });

    groups.append("text")
    .attr("class", "countryname")
    .attr("dy", "90px")
    .style("text-anchor", "middle")
    .style("fill", "black")
    .text(function(d) { return d.country; })
    .attr("transform", function(d) { return "rotate(-210)"; });
});
  d3.select(self.frameElement).style("height", diameter - 150 + "px");
/* END
/////////////////////////////////////////////////////////////////*/
})()