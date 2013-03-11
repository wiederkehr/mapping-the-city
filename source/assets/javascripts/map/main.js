(function() {
/* SETUP
/////////////////////////////////////////////////////////////////*/
var featureOpts = [
  {
    "featureType": "road.arterial",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.local",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "landscape.natural",
    "stylers": [
      { "visibility": "on" },
      { "saturation": -100 },
      { "lightness": -83 }
    ]
  },{
    "featureType": "landscape.man_made",
    "stylers": [
      { "saturation": -100 },
      { "lightness": -75 }
    ]
  },{
    "featureType": "transit.station.airport",
    "stylers": [
      { "saturation": -100 },
      { "lightness": -45 }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      { "weight": 0.5 },
      { "saturation": -100 },
      { "lightness": 100 }
    ]
  },{
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "stylers": [
      { "lightness": -60 }
    ]
  },{
    "featureType": "transit.line",
    "stylers": [
      { "saturation": -100 },
      { "lightness": -100 }
    ]
  },{
    "featureType": "administrative.province",
    "stylers": [
      { "weight": 0.5 }
    ]
  }
]

var map;
var zurich = new google.maps.LatLng(47.411594,8.463593);
var MAPTYPE_ID = 'gottham_style';
function initialize() {
  var mapOptions = {
    zoom: 12,
    center: zurich,
    mapTypeControl: false,
    mapTypeId: MAPTYPE_ID
  };
  var customMapType = new google.maps.StyledMapType(featureOpts);
  map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
  map.mapTypes.set(MAPTYPE_ID, customMapType);
}
initialize();

})()