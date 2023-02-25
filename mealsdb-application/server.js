/*
* retrieve recipe by ingredient 
* retrieve recipe by ID
* save recipe by ID
* get saved recipes
* delete saved recipe

* view created recipes
create recipe 
edit recipe 
* delete recipe 


*/
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mealsApi = require("mealdb-api");
const MongoClient = require("mongodb").MongoClient;
const MyRecipe = require("./models/my-recipe");
const SavedRecipe = require("./models/saved-recipe");

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
      id: meal.idMeal,
    };
  });
};

const _formatRecipe = (recipe) => {
  const objRecipe = recipe[0];
  const { idMeal, strMeal, strArea, strMealThumb, strYoutube, strInstructions } =
    objRecipe;

  const data = {
    idMeal,
    strMeal,
    strArea,
    strMealThumb,
    strYoutube,
    strInstructions,
  };

  const ingredientsArr = [];
  const measurementsArr = [];
  //create seperate arrays for ingredients and measurments
  for (const key in objRecipe) {
    if (key.includes("Ingredient") && objRecipe[key]) {
      ingredientsArr.push({ [key]: objRecipe[key] });
    } else if (key.includes("Measure") && objRecipe[key]) {
      measurementsArr.push({ [key]: objRecipe[key] });
    }
  }

  //connect the two arrays to match the ingredient to the measurment
  for (let i = 0; i < measurementsArr.length; i++) {
    let ingredientObj = ingredientsArr[i];
    for (const key in ingredientObj) {
      measurementsArr[i][key] = ingredientObj[key];
    }
  }

  for (let i = 0; i < measurementsArr.length; i++) {
    let fullIngredient = "";
    for (const key in measurementsArr[i]) {
      fullIngredient += `${measurementsArr[i][key]} `;
    }
    data["ingredient" + i] = fullIngredient;
  }

  return data;
};

app.get("/", (req, res) => {
  res.send("hello world");
});

/*------- MEALSDB API -------*/
//get all recipes by ingredient
//meals/?ingredient=
app.get("/meals", async (req, res) => {
  try {
    // ?ingredient
    const { ingredient } = req.query;
    const allMeals = await mealsApi.allRecipesByIngredient(ingredient);
    if (allMeals) {
      res.json(allMeals);
    } else {
      res
        .status(404)
        .json({ error: `Meals containing ${ingredient} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

//get recipe by id
app.get("/meals/:id", async (req, res) => {
  try {
    const { id: mealID } = req.params;
    const meal = await mealsApi.specificRecipe(mealID);

    if (!meal) {
      res.status(404).json({ error: "meal not found" });
    } else {
      res.json(_formatRecipe(meal));
    }
  } catch (e) {
    res.status(500).json({ error: "something went wrong" });
  }
});

//get saved meals
app.get("/saved-meals", async (req, res) => {
  try {
    const result = await SavedRecipe.find();
    res.json({ recipes: result });
  } catch (e) {
    res.status(500).json({ error: "something went wrong" });
  }
});

//save recipe from passed in id
app.post("/saved-meals", async (req, res) => {
  const { selectedRecipeID } = req.body;
  try {
    const recipe = await mealsApi.specificRecipe(selectedRecipeID);
    const savedRecipe = new SavedRecipe(_formatRecipe(recipe))
    await savedRecipe.save();
    res.status(201).json({ savedRecipe });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

//delete save recipe
app.delete("/saved-meals/:id", async (req, res) => {
  try {
    const mealId = req.params.id;
    const result = await SavedRecipe.deleteOne({ idMeal: mealId });
    res.json({ deletedCount: result.deletedCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/*------- Database -------*/

app.get("/my-meals", async (req, res) => {
  try {
    const result = await MyRecipe.find();
    res.json({ recipes: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/my-meals/:id", async (req, res) => {
  try {
    const mealId = req.params.id;
    const result = await MyRecipe.deleteOne({ _id: mealId });
    res.json({ deletedCount: result.deletedCount });
  } catch (e) {
    res.status(500).json({ error: "Something went wrong" });
  }
});
// Create a new MongoClient
const client = new MongoClient(CONNECTION);

const start = async () => {
  try {
    await mongoose.connect(CONNECTION);
    app.locals.db = client.db();
    app.listen(PORT, () => {
      console.log("App listening on port " + PORT);
    });
  } catch (err) {
    console.log(err.message);
  }
};

start();
