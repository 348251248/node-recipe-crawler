
var axios = require('axios');

const url = 'http://www.recipepuppy.com/api/';

// Fetch recipes from puppy Api.
var getRecipe = (ingredient, query, page) => {
    let i = encodeURIComponent(ingredient);
    let q = encodeURIComponent(query);
    let p = encodeURIComponent(page);
    return axios.get(url + `?i=${i}&q=${q}&p=${p}`);
};

module.exports = {
    getRecipe
};