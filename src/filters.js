var linebreaks = function($sce, $filter) {
  return function(data) {
    if(!data) {
      return data;
    }

    var parts = data.split('\n');

    return $sce.trustAsHtml('<p>' + parts.join('</p><p>') + '</p>');
  };
};

linebreaks.$inject = ['$sce', '$filter'];


module.exports.linebreaks = linebreaks;
