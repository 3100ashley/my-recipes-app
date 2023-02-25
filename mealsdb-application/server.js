/*
retrieve recipe by ingredient 
retrieve recipe by ID
save recipe by ID
delete saved recipe

view created recipes
create recipe 
edit recipe 
delete recipe 


*/
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const mealsApi = require('mealdb-api');

const app = express();
mongoose.set("strictQuery", false);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const PORT = process.env.PORT || 3000;
const CONNECTION = process.env.CONNECTION;

const _formatMeals = (meals) => {
    return meals.map((meal) => {
        return {
            displayText: meal.strMeal,
            id: meal.idMeal
        }
    })
}

const _formatRecipe = (recipe) => {
    const objRecipe = recipe[0];
    const {strMeal, strArea, strYoutube, strInstructions} = objRecipe;

    const data = {
        strMeal,
        strArea,
        strArea,
        strYoutube,
        strInstructions
    }

    const ingredientsArr = []
    const measurementsArr = []
    //create seperate arrays for ingredients and measurments 
    for(const key in objRecipe){
        if(key.includes('Ingredient') && objRecipe[key]){
            ingredientsArr.push({[key]: objRecipe[key]})

        }else if(key.includes('Measure') && objRecipe[key]){
            measurementsArr.push({[key]: objRecipe[key]})
        }
    }
    
    //connect the two arrays to match the ingredient to the measurment
    for(let i = 0; i < measurementsArr.length; i++){
        let ingredientObj = ingredientsArr[i]
        for(const key in ingredientObj){
            measurementsArr[i][key] = ingredientObj[key]
        }
     
    }

    for(let i = 0; i < measurementsArr.length; i++){
        let fullIngredient="";
        for(const key in measurementsArr[i]){
            fullIngredient += `${measurementsArr[i][key]} `
        }
       data["ingredient" + i] = fullIngredient;
        
    }

    return data;

}

app.get("/", (req, res) => {
    res.send("hello world");
});

//get all recipes by ingredient
//meals/?ingredient=
app.get('/meals', async (req, res) => {
   
    try {
        // ?ingredient
        const { ingredient } = req.query;
        const allMeals = await mealsApi.allRecipesByIngredient(ingredient)
        if(allMeals){
            const data = {
                count: allMeals.length,
                results: _formatMeals(allMeals)
            }
            res.json(data);
            
        }else{
            res.status(404).json({ error: `Meals containing ${ingredient} not found` });
        }
        
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});


const start = async () => {
    try {
      await mongoose.connect(CONNECTION);
      app.listen(PORT, () => {
        console.log("App listening on port " + PORT);
      });
    } catch (err) {
      console.log(err.message);
    }
  };
  
  start();
  