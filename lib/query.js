function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

function runQuery() {
    var d = new Date();
    var date = getQueryVariable('date');
    var body;

    if(date){
        body = {
            date: date
        }
    }

    $.getJSON('https://d1ibuyc8mtiruf.cloudfront.net', body) 
        .done(function( data ) {
            console.log(data)
            // http://stackoverflow.com/questions/1248081/get-the-browser-viewport-dimensions-with-javascript
            var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - 20;
            var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 20;
            d3.wordcloud()
                .size([w, h])
                .scale('log')
                .fill(d3.scale.ordinal().range(["#884400", "#448800", "#888800", "#444400"]))
                .words(data)
                .selector('#wordcloud')
                .font('Oswald')
                .start();
        
            $('#loading').fadeOut();        
    });

}

$( document ).ready(function() {
    runQuery();
});
