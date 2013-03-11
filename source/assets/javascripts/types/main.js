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

var sizeScale = d3.scale.linear().range([minSize,maxSize]).domain([minRoom,maxRoom]);
var tree = d3.layout.tree().size([360, diameter / 2])

var leaf = function(length, widthRatio, balance) {
  var width;
  if (widthRatio == null) {
    widthRatio = 2;
  }
  if (balance == null) {
    balance = 0.5;
  }
  width = length / widthRatio;
  return "M0,0Q" + (length * balance) + "," + width + " " + length + ",0L" + length + ",0Q" + (length * balance) + "," + (-width) + " 0,0Z";
};

var arc = d3.svg.arc()
  .innerRadius(0)
  .outerRadius(function(d) {
    return Math.sqrt(sizeScale(d.amount));
  })
  .startAngle(0)
  .endAngle(Math.PI * 2)

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

  var node = groups.selectAll(".node")
    .data(function(d) {
      return tree.nodes(d);
    })
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) { 
      return d.name == "total" ? null : "rotate(" + (d.x - 150) + ")"; 
    });

  node.sort( function(d) { 
    return d.name == "total" ? 1 : -1; 
  });

  node.append("path")
    .attr("d", function(d) { return d.name == "total" ? arc(d) : leaf(sizeScale(d.amount), 2, 0.2);})
    .attr("title", function(d){ return d.name})
    .style("stroke-width", function(d) { return d.name == "total" ? 2 + "px" : "none"; })
    .style("fill", function(d) { 
      var color;
      switch(d.name){
        case "total":
          color = "#fff";
        break;
        case "rooms_1":
          color = d.amount == 0 ? "#fff" : "#F8EA92";
        break;
        case "rooms_2":
          color = d.amount == 0 ? "#fff" : "#F0D367";
        break;
        case "rooms_3":
          color = d.amount == 0 ? "#fff" : "#DA8033";
        break;
        case "rooms_4":
          color = d.amount == 0 ? "#fff" : "#B3261B";
        break;
        case "rooms_5":
          color = d.amount == 0 ? "#fff" : "#8D191F";
        break;
        default:
          "black"
        break;
      }
      return color;
    })
    .style("stroke", function(d) { 
      var color;
      switch(d.name){
        case "total":
          color = "#fff";
        break;
        case "rooms_1":
          color = "#F8EA92";
        break;
        case "rooms_2":
          color = "#F0D367";
        break;
        case "rooms_3":
          color = "#DA8033";
        break;
        case "rooms_4":
          color = "#B3261B";
        break;
        case "rooms_5":
          color = "#8D191F";
        break;
        default:
          "black"
        break;
      }
      return color;
    })
    
  node.append("text")
    .attr("dy", "4")
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("fill", "black")
    .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
    .text(function(d) { return d.name == "total" ? d.amount : 0; });
    
  node.append("text")
    .attr("class", "countryname")
    .attr("dy", "-50")
    .style("text-anchor", "middle")
    .style("fill", "black")
    .text(function(d) { return d.municipality; });
});
  d3.select(self.frameElement).style("height", diameter - 150 + "px");
/* END
/////////////////////////////////////////////////////////////////*/
})()