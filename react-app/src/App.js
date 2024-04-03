import './App.css';
import React, {useState, useEffect} from "react";
import client from "./client";
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [selectedFoods, setSelectedFoods] = useState([]);

  const addFoodToSelected = (food) => {
    setSelectedFoods(prevSelectedFoods => [...prevSelectedFoods, food]);
  };

  return (
    <div>
      <div>
    <FoodTable selectedFoods={selectedFoods} />
    </div>
    <div>
    <SearchFood addFoodToSelected={addFoodToSelected} />
    </div>
    </div>
  );
}


function FoodTable ({selectedFoods}) {
  const [foods, setFoods] = useState([]);
  
  useEffect(() => {
    client.getFoods((data) => {
      setFoods(data); 
    });
  }, []); 

  const foodRows = foods.map((food, idx) => (
    <tr key={idx} onClick={() => handleFoodClick(food)}>
      <td>{food.desc}</td>
      <td className="right aligned">{food.kcal}</td>
      <td className="right aligned">{food.protein}</td>
      <td className="right aligned">{food.fat}</td>
      <td className="right aligned">{food.carb}</td>
    </tr>
  ));

  const handleFoodClick = (food) => {
    //setSelectedFoods(prevSelectedFoods => [...prevSelectedFoods, food]);
  };
  

  return (
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
                {sum(foods, "protein_g")}
              </th>
              <th className="right aligned" id="total-fat_g">
                {sum(foods, "fat_g")}
              </th>
              <th className="right aligned" id="total-carbohydrate_g">
                {sum(foods, "carbohydrate_g")}
              </th>
            </tr>
          </tfoot>
        </table>
      );

};

function SearchFood({addFoodToSelected}) {
  const [foods, setFoods] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  // useEffect hook to fetch foods when the component mounts
/*   useEffect(() => {
    client.getFoods((data) => {
      setFoods(data); // Set the fetched foods to the state
    });
  }, []); */

  const MATCHING_ITEM_LIMIT = 25;

  const handleFoodClick = (food) => {
    addFoodToSelected(food);
    console.log("addFoodSelected");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value === "" || (value.length < 3)) { setFoods([]);  } 
    else 
    // Once value.length is > 3, a new call to the server will be made only per 3 additional chars (for performance reasons).
    if (value.length >= 3 && (value.length % 3 === 0)) {
      setSearchValue(value);

      client.search(value, (foods) => {
        setFoods(foods.slice(0, MATCHING_ITEM_LIMIT)); // Update the foods state with matching foods
      });
    }
  };

  const foodRows = foods.map((food, idx) => (
    <tr key={idx} id="dummyid" onClick={() => handleFoodClick(idx)}>
      <td>{food.desc}</td>
      <td className="right aligned">{food.kcal}</td>
      <td className="right aligned">{food.protein}</td>
      <td className="right aligned">{food.fat}</td>
      <td className="right aligned">{food.carb}</td>
    </tr>
  ));

  return (
    <div id="food-search">
      <table className="ui selectable structured large table">
        <thead>
          <tr>
            <th colSpan="5">
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
            <th className="eight wide">Description</th>
            <th>Kcal</th>
            <th>Protein (g)</th>
            <th>Fat (g)</th>
            <th>Carbs (g)</th>
          </tr>
        </thead>
        <tbody id="dummyid" onClick={() => handleFoodClick()}>{foodRows}</tbody>
      </table>
    </div>
  );

}

function AddFood () {
  //const navigate = useNavigate();

  const [food, setFood] = useState({
    desc: '',
    kcal: 0,
    protein: 0,
    fat: 0,
    carb: 0,
    id: 0
  });

  const onDataInput = (e) => {
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

  const onFormSubmit = (e) => {
    e.preventDefault();

    //setFood({...food, id: uuidv4()})

    try {
      client.createFood({...food, id: uuidv4()})
      .then(() => {
        navigate(`/`);
      })
    } catch (err) {
      console.log(err);
    }
  };

  // step="0.1" min="0" are validations for numbers entered to be =< 0 and have only one number after decimal point
  return(
    <form onSubmit={onFormSubmit}>
      <label for="desc"> Name Of Product:
        <input type="text" name="desc" value={food.desc} required onChange={onDataInput}></input>
      </label>

      <label for="kcal"> Kcal (in grams):
        <input type="number" step="0.1" min="0" name="kcal" value={food.kcal} onChange={onDataInput}></input>
      </label>

      <label for="protein"> Proteins (in grams):
        <input type="number" step="0.1" min="0" name="protein" value={food.protein} onChange={onDataInput}></input>
      </label>

      <label for="fat"> Fats (in grams):
        <input type="number" step="0.1" min="0" name="fat" value={food.fat} onChange={onDataInput}></input>
      </label>

      <label for="carb"> Carbohydrates (in grams):
        <input type="number" step="0.1" min="0" name="carb" value={food.carb} onChange={onDataInput}></input>
      </label>

      <button type="submit">Add Food</button>
    </form>
  );
};

function sum(foods, prop) {
  return foods
    .reduce((memo, food) => parseInt(food[prop], 10) + memo, 0.0)
    .toFixed(2);
};

export default App;
