const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);

const DATA_FILE = path.join(__dirname, "./data.json");

app.set("port", process.env.PORT || 3001);

app.use("/", express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

/* app.get("/api/foods", (req, res) => {
    fs.readFile(DATA_FILE, (err, data) => {
      if (err) {
        console.error("Error reading data file:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      res.setHeader("Cache-Control", "no-cache");
      res.json(JSON.parse(data));
    });
}); */

app.get("/api/foods", (req, res) => {
    const query = req.query.query;
  
    fs.readFile(DATA_FILE, (err, data) => {
      if (err) {
        console.error("Error reading data file:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
  
      const foods = JSON.parse(data);
      let matchedFoods = [];

      if (query) {
        console.log(`Searching for ${query}...`);
        matchedFoods = foods.filter(food => food.desc.toLowerCase().includes(query.toLowerCase()));
        // NOTE TO SELF:
        // Was getting "Error: Can't set headers after they are sent to the client" which resulted in getting 
        // another ERR_CNNECTION_REFUSED inside the browser console which basically meant that the search bar in the App.js 
        // would work only once and then the server would throw error thus crashing App.js.
        // The main reason for the error was that I had:
        // [1] res.setHeader("Cache-Control", "no-cache"); and then again [2] res.json() two more times inside this endpoint.
        // As a result I had one request but multiple responses which violates the rule "One response per request!"
        // stackoverflow thread: 
        // https://stackoverflow.com/questions/7042340/error-cant-set-headers-after-they-are-sent-to-the-client
        res.json(matchedFoods);
      } else {
        console.log("nema bate");
        res.json(matchedFoods);
      }      
    });
  });

app.post("/api/foods",  (req, res) => {
    fs.readFile(DATA_FILE, (err, data) => {
        const foods = JSON.parse(data);
        const newFood = {
            desc: req.body.desc,
            kcal: req.body.kcal,
            protein: req.body.protein,
            fat: req.body.fat,
            carb: req.body.carb,
            id: req.body.id,
        };
        foods.push(newFood);
        fs.writeFile(DATA_FILE, JSON.stringify(foods, null, 4), () => {
            res.setHeader("Cache-Control", "no-cache");
            res.json(foods);
        });
    });
});

app.put("/api/foods", (req, res) => {
    fs.readFile(DATA_FILE, (err, data) => {
        const foods = JSON.parse(data);
        foods.forEach((food) => {
            if (food.id === req.body.id) {
                food.desc = req.body.desc;
                food.kcal = req.body.kcal;
                food.protein = req.body.protein;
                food.fat = req.body.fat;
                food.carb = req.body.carb;
            }
        });
        fs.writeFile(DATA_FILE, JSON.stringify(foods, null, 4), () => {
            res.json({});
        });
        });
    });

app.delete("/api/foods", (req, res) => {
    fs.readFile(DATA_FILE, (err, data) => {
        let foods = JSON.parse(data);
        foods = foods.reduce((memo, food) => {
            if (food.id === req.body.id) {
                return memo;
            }
            else {
                return memo.concat(food);
            }}, []);
            fs.writeFile(DATA_FILE, JSON.stringify(foods, null, 4), () => {
                res.json({});
            });
        });
    });



app.listen(app.get("port"), () => {
    console.log(`Find the server at: http://localhost:${app.get("port")}/`); 
});
  