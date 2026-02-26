import React from "react";
import profileImg from "../assets/profile.png";
import food from "../assets/foodRecipe.png";
import { useLoaderData } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function RecipeDetails() {
  const recipe = useLoaderData();

  return (
    <>
      <div className="outer-container">
        <div className="profile">
          <img src={profileImg} width="50px" height="50px" alt="profile" />
          <h5>{recipe.email}</h5>
        </div>

        <h3 className="title">{recipe.title}</h3>

        <img
          src={`${API}/images/${recipe.coverImage}`}
          width="220px"
          height="200px"
          alt="recipe"
        />

        <div className="recipe-details">
          <div className="ingredients">
            <h4>Ingredients</h4>
            <ul>
              {recipe.ingredients.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="instructions">
            <h4>Instructions</h4>
            <span>{recipe.instructions}</span>
          </div>
        </div>
      </div>
    </>
  );
}