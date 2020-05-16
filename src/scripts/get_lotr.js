const axios = require('axios').default;
const fs = require('fs');

const LOTR_ROOT_API = 'https://the-one-api.herokuapp.com/v1';
const LOTR_ACCESS_TOKEN = 'rIfs8ljjvKVfFdAv48Po';
const config = {
  headers: { Authorization: `Bearer ${LOTR_ACCESS_TOKEN}` },
};
const characters = [];

axios.get(`${LOTR_ROOT_API}/character`, config)
  .then((response) => {
    const file = fs.createWriteStream('lotr_characters.txt');
    response.data.docs.forEach((element) => {
      characters.push([element.name, element._id]);
      file.write(`['${element.name}', '${element._id}'], \n`);
    });
    file.end();
  })
  .catch((error) => {
    console.log(error);
  });
