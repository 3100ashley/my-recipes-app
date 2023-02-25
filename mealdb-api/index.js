const superagent = require('superagent') 
const config = require("./config.json")


const allRecipesByIngredient = async (ingredient) => {
    try{
        const mealsdbURL = `${config.url}filter.php?i=${ingredient}`
        const response = await superagent.get(mealsdbURL)
        return response.body.meals

    }catch(error){
        return error
    }
}

const specificRecipe = async (recipeId) => {
    try {
        const mealdbURL = `${config.url}lookup.php?i=${recipeId}`
        const response = await superagent.get(mealdbURL)

        return response.body.meals
    } catch (error) {
        return error
    }
}

module.exports = {
    allRecipesByIngredient,
    specificRecipe
}