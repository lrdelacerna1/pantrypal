import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet';
import './Styling/home.css';
import './Styling/meals.css';
import './Styling/addmeals.css';
import mealsBackArrow from './Styling/graphics/meals_back-arrow.png';
import meals from './Styling/graphics/meals_.svg';
import groceryListIcon from './Styling/graphics/grocery-list-icon.png';
import mealSalad from './Styling/graphics/meals_salad.png';
import plus from './Styling/graphics/plus.png';
import logo from './Styling/graphics/logo.png';


const Meals = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = location.state || {};
    const [mealNames, setMealNames] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedMeals, setSelectedMeals] = useState([]);
    const [eventHandlers, setEventHandlers] = useState({}); // Define eventHandlers state
    const [errors, setErrors] = useState({});

    const [values, setValues] = useState({
      meal_name: user.meal_name,
      ingredients: [],
      ingredient_name: "",
      quantity: "",
      unit: ""
  
    });

    
  const [existingIngredients, setExistingIngredients] = useState([]);

    useEffect(() => {
      if (user && user.id_no) {
        axios.get(`http://localhost:8070/getmeals?id_no=${user.id_no}`)
          .then(response => {
            const uniqueMealNames = Array.from(new Set(response.data.map(meal => ({
              id: meal.meal_id,
              name: meal.meal_name
            }))));
            setMealNames(uniqueMealNames);
            
            // Console log meal IDs here
            console.log("Meal IDs:", uniqueMealNames.map(meal => meal.id));
            console.log("Meal Names:", uniqueMealNames.map(meal => meal.name));
    
            // Populate eventHandlers here
            const handlers = {};
            uniqueMealNames.forEach(meal => {
              handlers[meal.id] = {
                click: () => handleMealClick(meal.id),
                dblclick: () => handleMealDoubleClick(meal.id)
              };
            });
            setEventHandlers(handlers);
          })
          .catch(error => {
            console.error('Error fetching meal names:', error);
          });
      }
    }, [user]);
    
  
    const viewMealHandler = (mealId, mealName) => () => {
      // Navigate to the meal view page or handle the meal view action here
      console.log(`Viewing meal with ID IN HANDLER: ${mealId}`);
      handleMealClick(mealId, mealName);
    };
  
    const handleMealClick = (mealId,mealName) => {
      console.log(`Meal clicked: ${mealId}`);
      viewMeal(mealId, mealName);
    };
  
    const handleMealDoubleClick = (mealId) => {
      console.log(`Meal double-clicked: ${mealId}`);
      // Add your logic here to handle the double-click event for the meal
    };

  
  const handleEdit = () => {
    setIsEditing(true);
    document.getElementById('editbutton').style.display = 'none';
    document.getElementById('cancelbutton').style.display = 'block';
    document.getElementById('deletebutton').style.display = 'block';

    let newRadio = document.createElement('input');
    newRadio.setAttribute('type', 'checkbox');
    newRadio.className = "deleteSelect";

    let oldIcons = Array.from(document.getElementsByClassName("mealicon"));

    oldIcons.forEach(function (oldIcon) {
      oldIcon.parentNode.replaceChild(newRadio.cloneNode(true), oldIcon);
    });

    let meals = Array.from(document.getElementsByClassName("meal"));
    meals.forEach(function (meal) {
      meal.style.pointerEvents = 'none';
      meal.removeEventListener("click", eventHandlers[meal.mealid].click);
      meal.removeEventListener("dblclick", eventHandlers[meal.mealid].dblclick);
    });
  };

  
  const handleCancel = () => {
    setIsEditing(false);
    document.getElementById('editbutton').style.display = 'block';
    document.getElementById('cancelbutton').style.display = 'none';
    document.getElementById('deletebutton').style.display = 'none';

    let newImg = document.createElement('img');
    newImg.src = mealSalad;
    newImg.className = "mealicon";

    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function (checkbox) {
        checkbox.parentNode.replaceChild(newImg.cloneNode(true), checkbox);
    });

    // Re-add the event listeners
    let meals = Array.from(document.getElementsByClassName("meal"));
    meals.forEach(function (meal) {
        meal.addEventListener("click", eventHandlers[meal.mealid].click);
        meal.addEventListener("dblclick", eventHandlers[meal.mealid].dblclick);
    });
  };

  const handleCreateMeal = () => {
    navigate("/createmeal", { state: { user: user } });
}
  const handleHomeBack = () => {
    navigate("/home", { state: { user: user } });
  }

  const handleMealBack = () => {
    navigate("/meals", { state: { user: user } });
  }

  const handleDeleteMeal = () => {
    console.log("INSIDE DELETE:"
    );
    const mealsToDelete = [];
    const mealIdsToDelete = [];
    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    let checkedFlag = false;
  
    checkboxes.forEach(function (checkbox) {
      if (checkbox.checked) {
        checkedFlag = true;
        let parent = checkbox.closest('.meal');
        let mealName = parent.querySelector('.mealname').innerText;
        mealsToDelete.push(mealName);
  
        // Find the meal ID by matching the meal name
        const meal = mealNames.find(meal => meal.name === mealName);
        if (meal) {
          mealIdsToDelete.push(meal.id);
        }
      }
    });
  
    if (!checkedFlag) {
      alert("Select a meal to delete first!");
      return;
    }
    
    console.log("INSIDE DELETE:", mealIdsToDelete);
  
    // First, delete the meals
    axios.delete('http://localhost:8070/deletemeals', {
      data: {
        id_no: user.id_no,
        meals: mealsToDelete
      }
    })
    .then(response => {
      console.log('Delete meals response:', response);
      
      // After deleting meals, delete the ingredients
      axios.delete('http://localhost:8070/deleteIngredients', {
        data: {
          meal_id: mealIdsToDelete
        }
      })
      .then(response => {
        console.log('Delete ingredients response:', response);
  
        // Update the mealNames state to remove deleted meals
        setMealNames(prevMeals => prevMeals.filter(meal => !mealsToDelete.includes(meal.name)));
  
        // Clear selected meals and reset editing state
        setSelectedMeals([]);
        setIsEditing(false);
  
        // Reload the page to reflect changes
        window.location.reload();
      })
      .catch(error => {
        console.error('Error deleting ingredients:', error);
      });
  
    })
    .catch(error => {
      console.error('Error deleting meals:', error);
    });
  }

const viewMeal = (mealID, mealName) => {
  document.getElementById('mealviewcontainer').style.display = 'flex';
  document.getElementById('maincontainer').style.display = 'none';

  document.getElementById('viewmealname').textContent = mealName; 

  document.getElementById("editmealbutton").addEventListener("click", () => editMealDetails(mealID));

  // Fetch ingredients for the meal
  axios.get(`http://localhost:8070/getIngredients?meal_id=${mealID}`)
    .then(response => {
      console.log(`Viewing meal with ID VIEWMEAL: ${mealID}, Name: ${mealName}`);
      if (response.data && response.data.length > 0) {
        // Assuming the response data structure contains ingredient_name, quantity, unit, and ingred_id
        const ingredients = response.data;
        // Output the ingred_id for each ingredient
        ingredients.forEach(ingredient => {
          const { ingredient_name, quantity, unit, ingred_id } = ingredient;
          let newRow = document.createElement('div');
          newRow.className = 'row';
          newRow.ingId = ingred_id;
          let newNum = document.createElement('div');
          newNum.className = 'blank';
          newNum.textContent = '';
          let newIng = document.createElement('div');
          newIng.className = 'column2';
          newIng.textContent = ingredient_name;
          let newQ = document.createElement('div');
          newQ.className = 'column3';
          newQ.textContent = quantity;
          let newUnit = document.createElement('div');
          newUnit.className = 'column4';
          newUnit.textContent = unit;
        
          newRow.appendChild(newNum);
          newRow.appendChild(newIng);
          newRow.appendChild(newQ);
          newRow.appendChild(newUnit);
        
          document.getElementById('mealviewcontainer').appendChild(newRow);
        });
      } else {
        console.log('No ingredients found for meal_id:', mealID);
      }
    })
    .catch(error => {
      console.error('Error fetching ingredients:', error);
    });
}

const handleCancelEdit = () => {
  window.location.reload();
}

const saveEditMeal = () =>{
  window.location.reload();
}
const handleMealChange = (event, mealId) => {
  const { value } = event.target;

  console.log("Meal name:", value, mealId); // Logging the meal name

  setValues((prev) => ({
    ...prev,
    meal_name: value
  }));


  // Update the meal name on the server
  axios.post(`http://localhost:8070/updateMealName`, {
    meal_id: mealId,
    meal_name: value,
    id_no: user.id_no
  })
  .then(response => {
    console.log('Meal name updated successfully:', response.data);
  })
  .catch(error => {
    alert("Duplicate meal. Please use a different meal name.");
  });
};

const handleIngredientChange = (ingred_id, index, event) => {
  console.log("ingredId CHANGE:", ingred_id);
  console.log("index:", index, event.target);
  const { name, value } = event.target;

  // Check for duplicate ingredient names
  setValues(prevValues => {
    console.log("INGRED NAME:", prevValues);

    const isDuplicateIngredientName = existingIngredients.some((ingredient, i) => i !== index && ingredient.ingredient_name === value);
    if (isDuplicateIngredientName) {
      alert("Duplicate ingredients. Please use a different ingredient name.");
      return prevValues; // Don't update the state if there's a duplicate
    }

    // Update the ingredient on the server
    axios.post(`http://localhost:8070/updateIngredient`, {
      ingred_id: ingred_id,
      ingredient_name: value,
      quantity: existingIngredients[index].quantity,
      unit: existingIngredients[index].unit
    })
    .then(response => {
      console.log('Ingredient updated successfully:', response.data);
    })
    .catch(error => {
      console.error("Error updating ingredient:", error);
    });

    // Update existingIngredients state
    setExistingIngredients(prevIngredients => {
      const newIngredients = [...prevIngredients];
      newIngredients[index] = { ...newIngredients[index], [name]: value };
      return newIngredients;
    });

    // Update the meal values state
    return {
      ...prevValues,
      [name]: value
    };
  });
};



const editMealDetails = (mealId) => {
  let newName = document.createElement('input');
  newName.addEventListener('change', (event) => handleMealChange(event, mealId));
  newName.setAttribute('type', 'text');
  newName.id = 'viewmealname';
  
  
  let label = document.getElementById('viewmeallabel');
  label.replaceChild(newName, label.querySelector('#viewmealname'));
  console.log("before FOR LOOP");
  let container = document.getElementById('mealviewcontainer');
  document.getElementById('editmealbutton').style.display = 'none';
  document.getElementById('canceleditmealbutton').style.display = 'block';
  document.getElementById('saveeditedmealbutton').style.display = 'block';
  document.getElementById('addingredient').style.display = 'block';

  document.getElementById("saveeditedmealbutton").addEventListener("click", saveEditMeal);
  document.getElementById("canceleditmealbutton").addEventListener("click", handleCancelEdit);
  document.getElementById("addingredient").addEventListener("click", addRow);

  let rows = container.getElementsByClassName('row');
  for (let i = 1; i < rows.length; i++) {
      let row = rows[i];

      let newNum = document.createElement('div');
      newNum.className = 'column1';
      newNum.textContent = 'x';

      let iname = document.createElement('input');
      iname.setAttribute('type', 'text');
      let quantity = document.createElement('input');
      quantity.setAttribute('type', 'number');
      
      let unit = document.createElement('select');
      const options = [
          'Calories (kcal)', 'Grams (g)', 'Milligrams (mg)', 'Micrograms (µg)', 
          'Serving Size', 'Portion', 'Pieces', 'Cups', 'Ounces', 
          'Teaspoon (tsp)', 'Tablespoon (tbsp)', 'Cup', 'Pint', 'Quart', 'Gallon', 
          'Liter', 'Milliliter', 'Ounce (oz)', 'Pound (lb)', 'Bunch', 
          'Dozen', 'Bag', 'Box', 'Carbohydrate Exchange', 'Protein Exchange', 
          'Fat Exchange', 'Piece', 'Slice', 'Handful'
        ];
          
      options.forEach(optionText => {
          const option = document.createElement('option');
          option.value = optionText;
          option.textContent = optionText;
          if (optionText === unit.textContent) {
              option.selected = true;
          }
          unit.appendChild(option);
      });

  
      iname.className = 'column2';
      quantity.className = 'column3';
      unit.className = 'column4';
      unit.id = 'unit';

      console.log("AFTER FOR LOOP");
      iname.value = row.querySelector('.column2').textContent;
      quantity.value = row.querySelector('.column3').textContent;
      let selectedUnitText = row.querySelector('.column4').textContent;
      let selectedUnit = Array.from(unit.options).find(option => option.textContent === selectedUnitText);
      if (selectedUnit) {
          selectedUnit.selected = true;
          // Corrected line to log the value of the selected option
      } else {
        console.log("Selected unit not found.");
      }
      newNum.addEventListener("click", deleteIngredient);
      row.replaceChild(newNum, row.querySelector('.blank'));
      row.replaceChild(iname, row.querySelector('.column2'));
      row.replaceChild(quantity, row.querySelector('.column3'));
      row.replaceChild(unit, row.querySelector('.column4'));
      
      

  }
}

const addRow = () => {
  let newRow = document.createElement('div');
  newRow.className = 'row';
  let newNum = document.createElement('div');
  newNum.className = 'column1';
  newNum.textContent = 'x';
  let check = document.createElement('div');
  check.className = 'column11';
  check.textContent = '/';
  let iname = document.createElement('input');
  iname.setAttribute('type', 'text');
  let quantity = document.createElement('input');
  quantity.setAttribute('type', 'number');
  
  let unit = document.createElement('select');
  const options = [
      'Calories (kcal)', 'Grams (g)', 'Milligrams (mg)', 'Micrograms (µg)', 
      'Serving Size', 'Portion', 'Pieces', 'Cups', 'Ounces', 
      'Teaspoon (tsp)', 'Tablespoon (tbsp)', 'Cup', 'Pint', 'Quart', 'Gallon', 
      'Liter', 'Milliliter', 'Ounce (oz)', 'Pound (lb)', 'Bunch', 
      'Dozen', 'Bag', 'Box', 'Carbohydrate Exchange', 'Protein Exchange', 
      'Fat Exchange', 'Piece', 'Slice', 'Handful'
    ];
      
  options.forEach(optionText => {
      const option = document.createElement('option');
      option.value = optionText;
      option.textContent = optionText;
      if (optionText === unit.textContent) {
          option.selected = true;
      }
      unit.appendChild(option);
  });
  iname.className = 'column2';
  quantity.className = 'column3';
  unit.className = 'column4';
  unit.id = 'unit'

  newRow.appendChild(newNum);
  newRow.appendChild(check);
  newRow.appendChild(iname);
  newRow.appendChild(quantity);
  newRow.appendChild(unit);
  document.getElementById('mealviewcontainer').appendChild(newRow);
  
  console.log("INSIDE ADD:", newRow.iname,  newRow.quantity,  newRow.unit);
  newNum.addEventListener("click", deleteIngredient);
  check.addEventListener("click", function(){
    console.log("INSIDE ADD INGRED:", iname.value, quantity.valueOf, unit.valueOf);
    const { ingredient_name, quantity, unit } = values; // Replace `values` with the appropriate value
    if (ingredient_name && quantity && unit) {
      const newIngredient = {
        ingredient_name,
        quantity,
        unit,
        meal_id: user.meal_id // Replace `user.meal_id` with the appropriate value
      };
  
      axios.post('http://localhost:8070/insertIngredient', newIngredient)
        .then(response => {
          if (response.data.error) {
            alert("Duplicate exists");
            return;  // Set error state if duplicate exists
          } else {
            console.log('Ingredient added successfully:', response.data);
            // Update the state to include the new ingredient in existingIngredients
            setExistingIngredients(prevIngredients => [...prevIngredients, response.data]); // Replace `setExistingIngredients` with the appropriate function
            // Clear input values
            setValues(prevValues => ({
              ...prevValues,
              ingredient_name: "",
              quantity: "",
              unit: ""
            })); // Replace `setValues` with the appropriate function
            setErrors({}); // Clear previous errors
          }
          check.remove(); // Move this line inside the axios then block
        })
        .catch(error => {
          console.error('Error adding ingredient:', error);
          setErrors({ ingredient: 'Duplicate exists. Please try again.' }); // Replace `setErrors` with the appropriate function
        });
    } else {
      setErrors({ ingredient: "All fields are required" }); // Replace `setErrors` with the appropriate function
    }
  });
  newRow.ingId = ''; //NEEDS: newly generated IngredientID
}

const deleteIngredient = (event) => {
  let target = event.target;
   //FOUNDHERE: ID of ingredient to be deleted
  //NEEDS: remove ingredient from database, before row is deleted
  // if (existingIngredients.length <= 1) {
  //   alert("Cannot delete the last remaining ingredient.");
  //   return;
  // }

  setExistingIngredients((prev) => {
    const newIngredients = prev.filter((_, i) => i !== index);

    // Make a DELETE request to the server
    axios.delete(`http://localhost:8070/deleteIngredient`, {
      data: { ingred_id: target.parentNode.ingId}
    })
      .then(response => {
        console.log('Ingredient deleted successfully:', response.data);
      })
      .catch(error => {
        console.error('Error deleting ingredient:', error);
      });

    return newIngredients;
  });
  target.parentNode.remove();
}

  return (
    <div>
      <Helmet>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>PantryPal - Home</title>
        <link rel="icon" href={logo} type="image/x-icon" />
        <link rel="stylesheet" href="meals.css" />
      </Helmet>
      <a href="welcome.html" className="PantryPalName">PantryPal.</a>
      {/* <button className="signout">Sign Out</button> */}
      <div onClick={handleHomeBack}>
        <img src={mealsBackArrow} className="backbutton" alt="Back" />
        <div className="backhomelabel">home</div>
      </div>
      <div id="maincontainer">
        <div className="label">
          <div className="mealslabel">Meals</div>
          <button id="deletebutton" onClick={handleDeleteMeal}>delete</button>
          <button id="editbutton" onClick={handleEdit}>edit</button>
          <button id="cancelbutton" onClick={handleCancel}>cancel</button>
        </div>
        <div className="addmeal" onClick={handleCreateMeal}>
            <img src={meals} alt="Add Meal" />
        </div>
        {/* Blank meal */}
          <Meal key="blank" id="blank" name="" viewMealHandler={() => {}} />
          {/* Render existing meals */}
          {mealNames.map(meal => (
            <Meal
            key={meal.id}
            id={meal.id}
            name={meal.name}
            viewMealHandler={viewMealHandler(meal.id, meal.name)}
            isEditing={isEditing} // Pass isEditing as a prop
          />
          ))}
      </div> {/* Closing tag for maincontainer div */}
      <div id="mealviewcontainer">
        <div id="viewmeallabel">
          <img src={groceryListIcon} alt="Grocery List Icon" />
          <div id="viewmealname">meal name</div>
        </div>
        <div className="row" id="header">
          <div className="column1"></div>
          <div className="column2">ingredient</div>
          <div className="column3">quantity</div>
          <div className="column4">unit</div>
        </div>
        <button id="editmealbutton">edit</button>
        <button id="canceleditmealbutton">cancel</button>
        <button id="saveeditedmealbutton">save</button>
        <div>
          <img src={mealsBackArrow} className="backbutton" id="backtochoosebutton" alt="Back to Choose" />
          <div id="backtochooselabel">meals</div>
        </div>
        <div id="addingredient">
          <img src={plus} id="newingredient" alt="New Ingredient" />
          <div id="newingredientlabel">new</div>
        </div>
      </div>
    </div>
  );
}

const Meal = ({ id, name, viewMealHandler, isEditing }) => {
  const handleClick = () => {
    if (!isEditing) {
      viewMealHandler(id, name);
    }
  };

  return (
    <div className="meal" onClick={handleClick}>
      {name && (
        <React.Fragment key={id}>
          <img src={mealSalad} className="mealicon" alt="Meal Icon" />
          <div className="mealname">{name}</div>
        </React.Fragment>
      )}
    </div>
  );
};

export default Meals;