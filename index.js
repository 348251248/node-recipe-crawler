const { getRecipe } = require('./src/api');
const { filterInvalidLink } = require('./src/getValidLink');
const { MAX_ERROR_COUNT } = require('./src/config');

var async = require('async'),
    _ = require('lodash'),
    colors = require('colors');

var main = () => {
    var filteredRecipes = [];
    var eachPageResult = [''];
    var i = 0;

    var errCount = 0;

    async.whilst(
        // break loop: when can not find more recipes and error count does not exceed max value.
        function () { return eachPageResult.length != 0 && errCount < MAX_ERROR_COUNT; },
        // Interator: get each page of api.
        function (callback) {
            // Change parameter here;
            getRecipe('pesto', 'lasagna', ++i)
                .then((response) => {
                    filterInvalidLink(response.data.results, (err, results) => {
                        filteredRecipes = [...filteredRecipes, ...results];
                        eachPageResult = response.data.results;
                        callback(null, filteredRecipes);
                    });
                }).catch((error) => {
                    //treat as null page, and add error count
                    errCount++;
                    callback(null, ['']);
                });
        },
        // When break get all result of filteredRecipes.
        function (err, results) {
            getMostIngredients(results);
        }
    );
}

var getMostIngredients = (arr) => {

    var res = _.maxBy(arr, (o) => o.numsOfIngredients);
    if (res) {
        //Tell me the name of the recipe, the URL, and the number of ingredients.
        console.log('\nHere is your desired recipe'.green);
        console.log(`Recipe name: ${res.title}`.green);
        console.log(`Recipe url: ${res.href}`.green);
        console.log(`Number of ingredients: ${res.numsOfIngredients}`.green);
    } else {
        console.log('Can not find desired recipe.'.red);
    }
}

main();