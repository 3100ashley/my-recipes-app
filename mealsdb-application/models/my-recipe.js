const mongoose = require('mongoose');
const myRecipeSchema = new mongoose.Schema({
    mealName: {
        type: String,
        required: true
    },
    mealArea: String,
    mealImage: String,
    mealYoutube: String,
    mealInstructions: String,
    mealIngredients: [String]
});
module.exports = mongoose.model('MyRecipe', myRecipeSchema);
