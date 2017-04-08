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

// http://stackoverflow.com/questions/5129624/convert-js-date-time-to-mysql-datetime

function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d;
}

Date.prototype.sqlDate = function() {
    return this.getUTCFullYear() + twoDigits(1 + this.getUTCMonth()) + twoDigits(this.getUTCDate());
};
