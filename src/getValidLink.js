
var
    http = require('http'),
    parse = require('url').parse,
    async = require('async');

const { TIMEOUT_VALUE } = require('./config');

const url = 'http://www.recipepuppy.com/api/';

var filterInvalidLink = (targetList, callback) => {
    // Test links in array in async way, which can save time.
    async.map(targetList, (item, _callback) => {
        requestUrl(item, _callback);
    }, (err, results) => {
        results = handleResult(err, results);
        callback(err, results);
    });
};

var requestUrl = (item, callback) => {
    var info = parse(item.href),
        path = info.pathname + (info.search || ''),
        options = {
            host: info.hostname,
            port: info.port || 80,
            path: path,
            method: 'GET'
        },
        req = null,
        request_timeout = null

    //Set timeout handler of request
    request_timeout = setTimeout(function () {
        request_timeout = null;
        req.abort();
        callback(new Error('Request timeout'), item);
    }, TIMEOUT_VALUE);

    req = http.request(options, function (res) {
        clearTimeout(request_timeout)
        res.on('data', function () {
            // TODO: operate data
        }).on('end', function () {
            //If success, set status OK
            item['status'] = 'OK';
            console.log(`fetching successfully: ${item.href}`);
            callback(null, item);
        }).on('error', function (err) {
            //If error occurs, set status ERR
            console.log(`fetching failed: ${item.href}`);
            item['status'] = 'ERR';
            callback(null, item)
        });
    }).on('error', function (err) {
        // Fix Socket hang up when req.abort() is called
        if (request_timeout) {
            clearTimeout(request_timeout);
            console.log(`fetching failed: ${item.href}`);
            item['status'] = 'ERR';
            callback(null, item);
        }
    });
    req.end();
}

// Add number of ingredients
// Filter accessible link result
var handleResult = (err, results) => {
    return results.map((item) => {
        item['numsOfIngredients'] = item['ingredients'].split(',').length;
        return item;
    }).filter((item) => {
        return item.status === 'OK';
    });
}

module.exports = {
    filterInvalidLink
};