import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios"; // Make sure axios is installed (`npm install axios`)
import ReactMarkdown from "react-markdown"; // Import react-markdown

const RecipeCard = ({ onSubmit }) => {
  const [ingredients, setIngredients] = useState("");
  const [mealType, setMealType] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [complexity, setComplexity] = useState("");

  const handleSubmit = () => {
    const recipeData = {
      ingredients,
      mealType,
      cuisine,
      cookingTime,
      complexity,
    };
    onSubmit(recipeData);
  };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Recipe Generator</h2>

      <label>Ingredients</label>
      <input
        type="text"
        placeholder="e.g., sugar, butter"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
      />

      <label>Meal Type</label>
      <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
        <option value="">Select one</option>
        <option value="Breakfast">Breakfast</option>
        <option value="Lunch">Lunch</option>
        <option value="Dinner">Dinner</option>
        <option value="Snack">Snack</option>
      </select>

      <label>Cuisine Preference</label>
      <input
        type="text"
        placeholder="e.g., Italian, Mexican"
        value={cuisine}
        onChange={(e) => setCuisine(e.target.value)}
      />

      <label>Cooking Time</label>
      <select
        value={cookingTime}
        onChange={(e) => setCookingTime(e.target.value)}
      >
        <option value="">Select one</option>
        <option value="Less than 30 minutes">Less than 30 minutes</option>
        <option value="30-60 minutes">30-60 minutes</option>
        <option value="More than 1 hour">More than 1 hour</option>
      </select>

      <label>Complexity</label>
      <select
        value={complexity}
        onChange={(e) => setComplexity(e.target.value)}
      >
        <option value="">Select one</option>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
      </select>

      <button onClick={handleSubmit}>Generate Recipe</button>
    </motion.div>
  );
};

function App() {
  const [recipeData, setRecipeData] = useState(null);
  const [recipeText, setRecipeText] = useState("");
  const [recipeImage, setRecipeImage] = useState(""); // Store image URL
  const [showRecipe, setShowRecipe] = useState(false);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    closeEventStream();
  }, []);

  useEffect(() => {
    if (recipeData) {
      closeEventStream();
      initializeEventStream();
    }
  }, [recipeData]);

  const initializeEventStream = () => {
    const queryParams = new URLSearchParams(recipeData).toString();
    const url = `http://localhost:3001/recipeStream?${queryParams}`;
    eventSourceRef.current = new EventSource(url);

    eventSourceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.action === "close") {
        closeEventStream();
      } else if (data.action === "chunk") {
        setRecipeText((prev) => prev + data.chunk);
      }
    };

    eventSourceRef.current.onerror = () => {
      eventSourceRef.current.close();
    };
  };

  const closeEventStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const onSubmit = (data) => {
    setRecipeText("");
    setRecipeData(data);
    setShowRecipe(true);
  };

  return (
    <div className="app">
      <div className="flex-container">
        <RecipeCard onSubmit={onSubmit} />

        <AnimatePresence>
          {showRecipe && (
            <motion.div
              className="recipe-display"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="header">
                <h3>Generated Recipe</h3>
                <button onClick={() => setShowRecipe(false)}>×</button>
              </div>
              <div className="recipe-content">
                <ReactMarkdown>{recipeText}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
