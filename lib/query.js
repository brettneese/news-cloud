
// User Submitted Variables
var project_id = 'opentransit-org';
var client_id = '969766284145-977b7gnshuv7g97jmosvpha0jgncvb33.apps.googleusercontent.com';

var config = {
    'client_id': client_id,
    'scope': 'https://www.googleapis.com/auth/bigquery'
};


function runQuery() {
    var d = new Date();
    var sqldate = getQueryVariable('date') || d.sqlDate();
    var sourceTable = 'gdelt-bq:gdeltv2.events'

    if(sqldate < 20050220){ 
        sourceTable = 'gdelt-bq:full.events'
    }

    var request = gapi.client.bigquery.jobs.query({
        'projectId': project_id,
        'timeoutMs': '30000',
        'query': 'SELECT Actor1Name as text, NumMentions as size, SOURCEURL as href FROM [' + sourceTable +  '] WHERE Actor1Name != "" AND SQLDATE = ' + sqldate + ' ORDER BY NumMentions DESC LIMIT 250;'
    });

    request.execute(function(response) {  
        var data = parseResponse(response.result).data;
        console.log(data);
        
        // http://stackoverflow.com/questions/1248081/get-the-browser-viewport-dimensions-with-javascript
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - 20;
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 20;
        d3.wordcloud()
            .size([w, h])
            .scale('log')
            .fill(d3.scale.ordinal().range(["#884400", "#448800", "#888800", "#444400"]))
            .words(data)
            .selector('#result_box')
            .font('Oswald')
            .start();
        $('#query_button').fadeOut();
    });

    $('#query_button').fadeOut();        
    $('#client_initiated').fadeOut();
}


function auth() {
    gapi.auth.authorize(config, function() {
        gapi.client.load('bigquery', 'v2');
        $('#client_initiated').html('BigQuery client initiated');
        $('#auth_button').fadeOut();
        $('#query_button').fadeIn();
    });
}
