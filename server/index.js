/**
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */

var bigQuery = require('@google-cloud/bigquery')(
  // {
  //   projectId: 'digita-city',
  //   keyFilename: './keyfile.json'
  // }
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
    if(req.body.date){
      d = new Date(req.body.date);
      console.log(req.body.date)
      console.log(typeof(req.body.date))  
    } else if(req.query.date){
      d = new Date(req.query.date);
    }
    
    // start looking at the partition from the day before
    let start = new Date(d);
    start.setDate(d.getDate() - 1);

    let sourceTable = 'gdelt-bq:gdeltv2.events';
    
    if(d.sqlDate() < 20050220){ 
        sourceTable = 'gdelt-bq:full.events';
    }
  
    const query = 'SELECT Actor1Name as text, NumSources as size, SOURCEURL as href FROM [' + sourceTable +  '_partitioned] WHERE Actor1Name != "" AND SQLDATE = ' +  d.sqlDate()  + ' AND _PARTITIONTIME BETWEEN TIMESTAMP(\'' + start.sqlDateHyphenated() + '\') AND TIMESTAMP(\'' + d.sqlDateHyphenated() + '\') ORDER BY NumSources DESC LIMIT 250;'
    
    console.log(query);

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

// var express = require('express')
// var app = express()

// app.get('/', this.queryBigQuery)
// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!')
// })
