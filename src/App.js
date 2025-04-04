import './App.css';
import React, {useState, useEffect} from "react";
import client from "./client";
import { v4 as uuidv4 } from 'uuid';
import {BrowserRouter as Router, Routes, Route, Link, Navigate as Redirect} from "react-router-dom";


function App() {

  const [selectedFoods, setSelectedFoods] = useState([]);

  const addFood = food => {
    setSelectedFoods(prevSelectedFoods => [...prevSelectedFoods, food]);
  };

  const removeFoodItem = itemIndex => {
    const filteredFoods = selectedFoods.filter((item, id) => itemIndex !== id);
    setSelectedFoods(filteredFoods);
  };
  
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={ 
                          <div className=' centered-container-main'> 
                            
                            <div>
                              <SearchFood onFoodClick={addFood} setSelectedFoods={setSelectedFoods} />       
                            </div> 
                          
                            <div>
                            <FoodTable foods={selectedFoods} onFoodClick={removeFoodItem}/> 
                            </div>
                          
                          </div>} 
         />
          <Route path="/addFood" element={ <AddFood /> } />
          <Route path="*" element={ <NotFound /> } />
        </Routes>
      </Router>
    </div>
  );
}


function FoodTable (props) {
  
  const { foods } = props;

  const foodRows = foods.map((food, id) => (
    <tr key={id} onClick={() => props.onFoodClick(id)}>
      <td>{food.desc}</td>
      <td className="right aligned">{food.kcal}</td>
      <td className="right aligned">{food.protein}</td>
      <td className="right aligned">{food.fat}</td>
      <td className="right aligned">{food.carb}</td>
    </tr>
  ));
 
  return (
    <div class="food-table-holder">
    <table className="ui selectable structured large table">
          <thead>
            <tr>
              <th colSpan="5">
                <h3>Selected foods</h3>
              </th>
            </tr>
            <tr>
              <th className="eight wide">Description</th>
              <th>Kcal</th>
              <th>Protein (g)</th>
              <th>Fat (g)</th>
              <th>Carbs (g)</th>
            </tr>
          </thead>
          <tbody>
            {foodRows}
          </tbody>
          <tfoot>
            <tr>
              <th>Total</th>
              <th className="right aligned" id="total-kcal">
                {sum(foods, "kcal")}
              </th>
              <th className="right aligned" id="total-protein_g">
                {sum(foods, "protein")}
              </th>
              <th className="right aligned" id="total-fat_g">
                {sum(foods, "fat")}
              </th>
              <th className="right aligned" id="total-carbohydrate_g">
                {sum(foods, "carb")}
              </th>
            </tr>
          </tfoot>
        </table>
        </div>
      );
};

function DeleteFood({ foodId, triggerSearch, setSelectedFoods }) {

  const onDelete=(e)=>{
    e.stopPropagation();
    try {
      client.deleteFood({id: foodId})
      .then(response => {
        console.log("Client response: ", response);
        if(response.status >= 200 && response.status < 300) {
          alert("Successfully deleted food!");
          triggerSearch();
          setSelectedFoods([]);
        }
        else {
          alert( "Failed to delete food! Try again.");
        }
      })
      .catch(err => console.log(err));
    } catch (err) {
      console.log(err);
    };
  };

  return( 
    <button onClick={onDelete} className="trash-icon-button">
      <i className="bi bi-trash"></i>
    </button>
  );

};

function EditFood({ food, triggerSearch, setSelectedFoods }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleUpdate = (updatedFood) => {
    client.updateFood(updatedFood)
      .then(response => {
        if(response.status >= 200 && response.status < 300) {
          setSelectedFoods([]);
          triggerSearch();
        } else {
          alert("Failed to update food! Try again.");
        }
      })
      .catch(err => console.log(err));
  };

  return (
    <>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsDialogOpen(true);
        }} 
        className="edit-icon-button"
      >
        <i className="bi-pencil"></i>
      </button>
      
      {isDialogOpen && (
        <EditFoodDialog 
          food={food} 
          onClose={() => setIsDialogOpen(false)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
};

function SearchFood(props) {
  const [foods, setFoods] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const MATCHING_ITEM_LIMIT = 25;

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value === "" || (value.length < 3)) { setFoods([]);  } 
    else 
    // Once value.length is > 3, a new call to the server will be made only per 3 additional chars (for performance reasons).
    if (value.length >= 3 && (value.length % 3 === 0)) {
      setSearchValue(value);
      client.search(value, (foods) => {
        setFoods(foods.slice(0, MATCHING_ITEM_LIMIT));
      });
    }
  };

  const foodRows = foods.map((food, id) => (
    <tr key={id} onClick={() => props.onFoodClick(food)}>
      <td>{food.desc}</td>
      <td className="right aligned">{food.kcal}</td>
      <td className="right aligned">{food.protein}</td>
      <td className="right aligned">{food.fat}</td>
      <td className="right aligned">{food.carb}</td>
      <td className="center aligned">
      <DeleteFood foodId={food.id} 
                  triggerSearch={() => handleSearchChange({
                    target: {value: searchValue}})}
                    setSelectedFoods={props.setSelectedFoods}   />
      <EditFood food={food} 
                triggerSearch={() => handleSearchChange({
                            target: {value: searchValue}})} 
                setSelectedFoods={props.setSelectedFoods} />
      </td>
    </tr>
  ));

  return (
    <div class="food-search-holder">
    <div id="food-search">
      <table className="ui selectable structured large table">
        <thead>
          <tr>
            <th colSpan="6">
              <div className="ui fluid search">
                <div className="ui icon input">
                  <input
                    className="prompt"
                    type="text"
                    placeholder="Search foods..."
                    value={searchValue}
                    onChange={handleSearchChange}
                  />
                  <i className="search icon" />
                </div>
              </div>
            </th>
          </tr>
          <tr>
            <th className="five wide">Description</th>
            <th>Kcal</th>
            <th>Protein (g)</th>
            <th>Fat (g)</th>
            <th>Carbs (g)</th>
            <th></th>
          </tr>
        </thead>
        <tbody >
          {foodRows}
        </tbody>
      </table>
      <div>
      <Link to="/addFood"> Add New Food </Link>
      </div>
    </div>
    </div>
  );

};

function EditFoodDialog({ food, onClose, onUpdate }) {
  const [editedFood, setEditedFood] = useState(food);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedFood(prev => ({
      ...prev,
      [name]: isNaN(value) ? value : parseFloat(value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(editedFood);
    onClose();
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalClick}>
        <h3>Edit Food</h3>
        <form className="ui form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Description</label>
            <input 
              type="text" 
              name="desc" 
              value={editedFood.desc} 
              onChange={handleInputChange} 
            />
          </div>
          <div className="field">
            <label>Kcal</label>
            <input 
              type="number" 
              step="0.1" 
              name="kcal" 
              value={editedFood.kcal} 
              onChange={handleInputChange} 
            />
          </div>
          <div className="field">
            <label>Protein</label>
            <input 
              type="number" 
              step="0.1" 
              name="protein" 
              value={editedFood.protein} 
              onChange={handleInputChange} 
            />
          </div>
          <div className="field">
            <label>Fat</label>
            <input 
              type="number" 
              step="0.1" 
              name="fat" 
              value={editedFood.fat} 
              onChange={handleInputChange} 
            />
          </div>
          <div className="field">
            <label>Carbs</label>
            <input 
              type="number" 
              step="0.1" 
              name="carb" 
              value={editedFood.carb} 
              onChange={handleInputChange} 
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="ui button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ui primary button">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function AddFood () {

  const initialState = {
    desc: '',
    kcal: 0,
    protein: 0,
    fat: 0,
    carb: 0,
    id: 0
  };

  const [food, setFood] = useState(initialState);
  const [counter, setCounter] = useState(4);

  const onDataInput=(e)=>{
    const name = e.target.name;
    const value = e.target.value;

    setFood((initialObject) => {
      const populatedObj = {...initialObject};

      if(isNaN(value)) {
        populatedObj[name] = value;
      }
      else { populatedObj[name] = parseFloat(value);  }

      return  populatedObj;
    });
  };

  const onFormSubmit=(e)=>{

    e.preventDefault();
    let objId = uuidv4();

    try {

      client.createFood({...food, id: objId})
      .then(response => {
        console.log("Client response: ", response);
        if(response.status >= 200 && response.status < 300) {
          alert("Successfully added food!");
          setFood(initialState);
        }
        else {
          alert( "Failed to add food! Try again.");
        }
      })
      .catch(err => console.log(err));
    } catch (err) {
      console.log(err);
    };
  };

  // step="0.1" min="0" are validations for numbers entered to be =< 0 and have only one number after decimal point
  return(
    <div className=' centered-container'>
    <form className="ui form" onSubmit={onFormSubmit}>
    <div className="field">
      <label htmlFor="desc">Name Of Product</label>
      <input type="text" name="desc" value={food.desc} required onChange={onDataInput} />
    </div>

    <div className="field">
      <label htmlFor="kcal">Kcal (in grams)</label>
      <input type="number" step="0.1" min="0" name="kcal" value={food.kcal} onChange={onDataInput} />
    </div>

    <div className="field">
      <label htmlFor="protein">Proteins (in grams)</label>
      <input type="number" step="0.1" min="0" name="protein" value={food.protein} onChange={onDataInput} />
    </div>

    <div className="field">
      <label htmlFor="fat">Fats (in grams)</label>
      <input type="number" step="0.1" min="0" name="fat" value={food.fat} onChange={onDataInput} />
    </div>

    <div className="field">
      <label htmlFor="carb">Carbohydrates (in grams)</label>
      <input type="number" step="0.1" min="0" name="carb" value={food.carb} onChange={onDataInput} />
    </div>

    <button className="ui blue button" type="submit">Add Food</button>
    <Link to="/" className="ui orange button">Go back</Link>
  </form>
  </div>
  );
};

function NotFound() {
  return (
    <div>
    <h1> No such page exists!</h1>
    <h5> Double-check the URL you entered!</h5>
    </div>
  );
};

function sum(foods, prop) {
  return foods.reduce((total, food) => total + parseFloat(food[prop]), 0).toFixed(1);
};


export default App;
