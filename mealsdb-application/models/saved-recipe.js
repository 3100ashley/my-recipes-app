const mongoose = require('mongoose');
const savedRecipeSchema = new mongoose.Schema({
    idMeal: String,
    strMeal: String,
    strMealThumb: String,

});
module.exports = mongoose.model('SavedRecipe', savedRecipeSchema);
