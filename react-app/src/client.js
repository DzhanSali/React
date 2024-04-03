function getFoods(success) {
  return fetch("http://localhost:3001/api/foods", {
    headers: {
      Accept: "application/json",
    },
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(success)
    .catch(console.error);
}

function createFood(data) {
  return fetch("http://localhost:3001/api/foods", {
    method: "post",
    body: JSON.stringify(data),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).then(checkStatus);
}

function updateFood(data) {
  return fetch("http://localhost:3001/api/foods", {
    method: "put",
    body: JSON.stringify(data),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).then(checkStatus);
}

function deleteFood(data) {
  return fetch("http://localhost:3001/api/foods", {
    method: "delete",
    body: JSON.stringify(data),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).then(checkStatus);
}

function search(query, success) {
  return fetch(`http://localhost:3001/api/foods?query=${query}`, {
    headers: {
      Accept: "application/json",
    },
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(success)
    .catch(console.error);
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(`HTTP Error ${response.statusText}`);
    error.status = response.statusText;
    error.response = response;
    console.log(error);
    throw error;
  }
}

function parseJSON(response) {
  return response.json();
}

const client = {
  getFoods,
  createFood,
  updateFood,
  deleteFood,
  search
};

export default client;
