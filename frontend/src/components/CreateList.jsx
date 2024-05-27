import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import axios from "axios";
import "./Styling/choosemeals.css";
import NavBar from "./NavBar";

const CreateList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state || {};
  const [meals, setMeals] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState([]);

  useEffect(() => {
    if (user?.id_no) {
      axios
        .get(`http://localhost:8070/getmeals?id_no=${user.id_no}`)
        .then((response) => {
          console.log("Fetched meals:", response.data);
          setMeals(response.data);
        })
        .catch((error) => {
          console.error("Error fetching meals:", error);
        });
    }
  }, [user?.id_no]);

  const toggleMeal = (meal) => {
    const existingMeal = selectedMeals.find(
      (selectedMeal) => selectedMeal.meal_id === meal.meal_id
    );
    if (existingMeal) {
      setSelectedMeals(
        selectedMeals.filter(
          (selectedMeal) => selectedMeal.meal_id !== meal.meal_id
        )
      );
    } else {
      setSelectedMeals([...selectedMeals, { ...meal, quantity: 1 }]);
    }
    console.log("Selected meals:", selectedMeals);
  };

  // const updateQuantity = (meal_id, quantity) => {
  //   setSelectedMeals((prevSelectedMeals) =>
  //     prevSelectedMeals.map((meal) =>
  //       meal.meal_id === meal_id
  //         ? { ...meal, quantity: parseInt(quantity, 10) }
  //         : meal
  //     )
  //   );
  //   // console.log("Updated selected meals:", selectedMeals);
  // };
  const updateQuantity = (meal_id, quantity) => {
    setSelectedMeals((prevSelectedMeals) =>
      prevSelectedMeals.map((meal) =>
        meal.meal_id === meal_id
          ? { ...meal, quantity: parseInt(quantity, 10) }
          : meal
      )
    );
    console.log("Updated selected meals:", selectedMeals); // Add this line
  };

  const handleSubmit = () => {
    const includedMeals = [];
    const includedMealsQuantities = [];
    let selectedFlag = 0;

    selectedMeals.forEach((meal) => {
      if (meal.quantity > 0) {
        selectedFlag = 1;
        includedMeals.push(meal.meal_id);
        let mealQuantity = meal.quantity.toString();
        if (mealQuantity === "") {
          includedMealsQuantities.push("0");
        } else {
          includedMealsQuantities.push(mealQuantity);
        }
      }
    });

    if (!selectedFlag) {
      alert("Select A Meal First!");
    } else {
      console.log("Included Meals:", includedMeals);
      console.log("Included Meals Quantities:", includedMealsQuantities);
      navigate("/grocerylist", {
        state: { id_no: user?.id_no, selectedMeals },
      });
    }
  };

  const handleSelected = (event) => {
    const mealDiv = event.target.closest(".meal");
    if (mealDiv) {
      const mealId = mealDiv.getAttribute("data-mealid");
      const mealName = mealDiv.querySelector(".mealname").textContent;
      const meal = { meal_id: mealId, meal_name: mealName };

      mealDiv.classList.toggle("selected");
      if (mealDiv.classList.contains("selected")) {
        toggleMeal(meal);
      } else {
        toggleMeal(meal);
      }
    }
  };

  return (
    <div className="container">
      <Helmet>
        <meta charSet="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>PantryPal - Create A List</title>
        <link rel="icon" href="graphics/logo.png" type="image/x-icon" />
      </Helmet>

      <NavBar />

      <div id="maincontainer">
        <div className="label">
          <div className="mealslabel">Choose your meals</div>
          <button id="viewlist" onClick={handleSubmit}>
            View Grocery List
          </button>
        </div>
        <div onClick={handleSelected}>
          {meals.map((meal) => (
            <div key={meal.meal_id} className="meal" data-mealid={meal.meal_id}>
              {/* <input
                  type="number"
                  min="1"
                  className="mealquantity"
                  value={
                    selectedMeals.find((m) => m.meal_id === meal.meal_id)
                      ?.quantity || ""
                  }
                  onChange={(e) => updateQuantity(meal.meal_id, e.target.value)}
                /> */}
              <input
                key={
                  selectedMeals.find((m) => m.meal_id === meal.meal_id)
                    ?.quantity || ""
                }
                type="number"
                min="1"
                className="mealquantity"
                value={
                  selectedMeals.find((m) => m.meal_id === meal.meal_id)
                    ?.quantity || ""
                }
                onChange={(e) => updateQuantity(meal.meal_id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />

              <div className="mealname">{meal.meal_name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateList;
