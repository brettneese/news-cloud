/**
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */

var bigQuery = require('@google-cloud/bigquery')({
  projectId: 'digita-city',
  keyFilename: './keyfile.json'
});

// http://stackoverflow.com/questions/5129624/convert-js-date-time-to-mysql-datetime
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d;
}

Date.prototype.sqlDate = function() {
    return this.getUTCFullYear() + twoDigits(1 + this.getUTCMonth()) + twoDigits(this.getUTCDate());
};

exports.helloWorld = function helloWorld (req, res) {
  if (req.body.message === undefined) {
    // This is an error case, as "message" is required
    res.status(400).send('No message defined!');
  } else {
    // Everything is ok
    console.log(req.body.message);
    res.status(200).end();
  }
};

exports.query = function query(req, res) {

  const d = new Date();
  const sqldate = req.query.sqldate || d.sqlDate();

  let sourceTable = 'gdelt-bq:gdeltv2.events';
  if(sqldate < 20050220){ 
      sourceTable = 'gdelt-bq:full.events';
  }

  const query = 'SELECT Actor1Name as text, NumMentions as size, SOURCEURL as href FROM [' + sourceTable +  '] WHERE Actor1Name != "" AND SQLDATE = ' + sqldate + ' ORDER BY NumMentions DESC LIMIT 250;'

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