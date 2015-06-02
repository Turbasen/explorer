var topo =  L.tileLayer('http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo2&zoom={z}&x={x}&y={y}', {
    maxZoom: 16,
    attribution: '<a href="http://www.statkart.no/">Statens kartverk</a>'
});

var summer = L.tileLayer('http://mt3.turistforeningen.no/prod/trail_summer/{z}/{x}/{y}.png', {
    maxZoom: 16,
    attribution: '<a href="http://www.turistforeningen.no/">DNT</a>'
});

var winter = L.tileLayer('http://mt3.turistforeningen.no/prod/trail_winter/{z}/{x}/{y}.png', {
    maxZoom: 16,
    attribution: '<a href="http://www.turistforeningen.no/">DNT</a>'
});

var cabin = L.tileLayer('http://mt3.turistforeningen.no/prod/cabin/{z}/{x}/{y}.png', {
    maxZoom: 16,
    attribution: '<a href="http://www.turistforeningen.no/">DNT</a>'
});

var layers = {'Topo 2': topo};
var overlays = {
    'DNTs merkede stier': summer,
    'DNTs merkede vinterruter': winter,
    'DNTs turisthytter': cabin
};

var map = L.map('map', {
    layers: [layers['Topo 2']],
    scrollWheelZoom: false,
    center: [60.39749058941908, 5.329399108886719],
    zoom: 12
});

var markers = L.layerGroup().addTo(map);
var trails = L.layerGroup().addTo(map);

L.control.layers(layers, overlays, { position: 'topleft' }).addTo(map);

// Fetch markers from Nasjonal Turbase
var mapOnMoveend = function() {
  turbasen.getObjects(getFilterQuery(), true, function(err, first, data) {
    if (first) {
      markers.clearLayers();

      $('#count').html(0);
      $('#total').html(data.total);
    }

    var colors = {
      Enkel: '#5cb85c',
      Middels: '#337ab7',
      Krevende: '#d9534f',
      Ekspert: '#525252'
    };

    var icons = {
      Fottur: 'school',
      Skitur: 'skiing',
      Klatretur: 'pitch',
      Sykkeltur: 'bicycle',
      Padletur: 'swimming'
    };

    for (var i = 0; i < data.documents.length; i++) {
      var icon = {
        icon: icons[data.documents[i].tags[0]],
        color: colors[data.documents[i].gradering],
        size: "m"
      };

      var marker = L.marker(data.documents[i].geojson.coordinates[0].reverse(), {
        icon: L.MakiMarkers.icon(icon)
      });

      marker.data = data.documents[i];
      marker.on('click', markerOnClick);
      marker.addTo(markers);
    }

    $('#count').html(parseInt($('#count').html(), 10) + data.count);

  });
};
map.on('zoomend moveend', mapOnMoveend);

// Fetch marker details when clicked
var markerOnClick = function() {
  trails.clearLayers();

  turbasen.getObject(this.data._id, function(err, data) {
    L.geoJson(data.geojson).addTo(trails);

    $('#details pre').html(JSON.stringify(data, null, 2));
    sidebar.open('details');
  });
}

// Search / filter sidebar
$('.sidebar input').on('change', function() { map.fire('moveend'); });
var sidebar = L.control.sidebar('sidebar').addTo(map);
var getFilterQuery = function() {
  var query = {};

  query.bbox = map.getBounds().toBBoxString();

  if ($('input[name="difficulty"]:checked').length) {
    query.gradering = $('input[name="difficulty"]:checked').val();
  }

  if ($('input[name="type"]:checked').length) {
    query.tags = $('input[name="type"]:checked').val();
  }

  return query;
};

map.fire('moveend');
