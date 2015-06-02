var turbasen = turbasen || {};

turbasen.url = 'http://proxy.turbasen.privat/turer';

turbasen.getObjects = function(query, first, cb) {
  var data = {
    status: 'Offentlig',
    fields: 'navn,geojson,tags,gradering',
    limit: 50
  };

  // Get filter query
  query.skip = query.skip || 0;
  $.extend(data, query);

  $.ajax({
      dataType: "json",
      url: turbasen.url,
      data: data

  }).done(function(json) {
    query_next = JSON.parse(JSON.stringify(query));
    query_next.skip += 50;

    if (query_next.skip < json.total) {
      turbasen.getObjects(query_next, false, cb);
    }

    cb(null, first, json);
  }).fail(function(error) {
    cb(error);
  });;
};

turbasen.getObject = function(id, cb) {
  $.ajax({
      dataType: "json",
      url: turbasen.url + '/' + id

  }).done(function(json) {
    cb(null, json);
  }).fail(function(error) {
    cb(error);
  });;
};
