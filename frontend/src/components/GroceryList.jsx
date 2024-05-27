import React from "react";
import { useLocation } from "react-router-dom";

const GroceryList = () => {
  const location = useLocation();
  const { id_no, selectedMeals } = location.state || {};

  console.log("Selected Meals:", selectedMeals); // Debugging line

  return (
    <div>
      <h1>Grocery List</h1>
      <p>User ID: {id_no}</p>
      <h2>Selected Meals:</h2>
      {selectedMeals && selectedMeals.length > 0 ? (
        <>
          <ul>
            {selectedMeals.map((meal, index) => (
              <li key={index}>
                {meal.meal_name} (ID: {meal.meal_id}) (Quantity: {meal.quantity}
                )
              </li>
            ))}
          </ul>
          <br></br>
          <h3>Ingredients</h3>
        </>
      ) : (
        <p>No meals selected.</p>
      )}
    </div>
  );
};

export default GroceryList;
