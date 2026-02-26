import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function EditRecipe() {
  const [recipeData, setRecipeData] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`${API}/recipe/${id}`);
        const res = response.data;

        setRecipeData({
          title: res.title,
          ingredients: res.ingredients.join(","),
          instructions: res.instructions,
          time: res.time,
        });
      } catch (err) {
        console.log(err);
      }
    };

    getData();
  }, [id]);

  const onHandleChange = (e) => {
    let val =
      e.target.name === "ingredients"
        ? e.target.value.split(",")
        : e.target.name === "file"
        ? e.target.files[0]
        : e.target.value;

    setRecipeData((pre) => ({
      ...pre,
      [e.target.name]: val,
    }));
  };

  const onHandleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`${API}/recipe/${id}`, recipeData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: "bearer " + localStorage.getItem("token"),
        },
      });

      navigate("/myRecipe");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="container">
        <form className="form" onSubmit={onHandleSubmit}>
          <div className="form-control">
            <label>Title</label>
            <input
              type="text"
              className="input"
              name="title"
              onChange={onHandleChange}
              value={recipeData.title || ""}
            />
          </div>

          <div className="form-control">
            <label>Time</label>
            <input
              type="text"
              className="input"
              name="time"
              onChange={onHandleChange}
              value={recipeData.time || ""}
            />
          </div>

          <div className="form-control">
            <label>Ingredients</label>
            <textarea
              className="input-textarea"
              name="ingredients"
              rows="5"
              onChange={onHandleChange}
              value={recipeData.ingredients || ""}
            ></textarea>
          </div>

          <div className="form-control">
            <label>Instructions</label>
            <textarea
              className="input-textarea"
              name="instructions"
              rows="5"
              onChange={onHandleChange}
              value={recipeData.instructions || ""}
            ></textarea>
          </div>

          <div className="form-control">
            <label>Recipe Image</label>
            <input
              type="file"
              className="input"
              name="file"
              onChange={onHandleChange}
            />
          </div>

          <button type="submit">Edit Recipe</button>
        </form>
      </div>
    </>
  );
}