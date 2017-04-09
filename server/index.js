/**
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */

var bigQuery = require('@google-cloud/bigquery')(
  {
    projectId: 'digita-city',
    keyFilename: './keyfile.json'
  }
);

// http://stackoverflow.com/questions/5129624/convert-js-date-time-to-mysql-datetime
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d;
}

Date.prototype.sqlDate = function() {
    return this.getUTCFullYear() + twoDigits(1 + this.getUTCMonth()) + twoDigits(this.getUTCDate());
};

Date.prototype.sqlDateHyphenated = function() {
    return this.getUTCFullYear() + '-' + twoDigits(1 + this.getUTCMonth()) + '-' + twoDigits(this.getUTCDate());
};


exports.queryBigQuery = function queryBigQuery (req, res) {
    res.header('Content-Type','application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    //respond to CORS preflight requests
    if (req.method == 'OPTIONS') {
        res.status(204).send('');
    }

    var d = new Date()

    if(req.query.sqlDate){
      d.setDate(req.query.sqlDate);
    }

    if(req.body.sqlDate){
      d.setDate(req.body.sqlDate)
    }
    
    // start looking at the partition from the day before
    let start = new Date(d);
    start.setDate(d.getDate() - 1);

    let sourceTable = 'gdelt-bq:gdeltv2.events';
    if(d.sqlDate < 20050220){ 
        sourceTable = 'gdelt-bq:full.events';
    }
  
    const query = 'SELECT Actor1Name as text, NumMentions as size, SOURCEURL as href FROM [' + sourceTable +  '_partitioned] WHERE Actor1Name != "" AND SQLDATE = ' +  d.sqlDate()  + ' AND _PARTITIONTIME BETWEEN TIMESTAMP(\'' + start.sqlDateHyphenated() + '\') AND TIMESTAMP(\'' + d.sqlDateHyphenated() + '\') ORDER BY NumMentions DESC LIMIT 250;'
    
    bigQuery.query(query, function(err, rows) {
      if (err) {
        res.status(500).send(err);
      } else if (!err) {
        res.status(200).send(rows);
      } else {
        res.status(500).send('unknown error');
      }
    });

};
