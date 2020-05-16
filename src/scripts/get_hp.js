const axios = require('axios').default;
const fs = require('fs');

const HP_ROOT_API = 'https://www.potterapi.com/v1';
const HP_API_KEY = '$2a$10$s2vXN5qGJCl82l0kMAC55Otssd7L3c/K0K0JcHSgr4tA5z./E2Qdi';

axios.get(`${HP_ROOT_API}/characters?key=${HP_API_KEY}`)
  .then((response) => {
    const file = fs.createWriteStream('hp_characters.txt');
    response.data.forEach((element) => {
      file.write(`['${element.name}', '${element._id}'], \n`);
    });
    file.end();
  })
  .catch((error) => {
    console.log(error);
  });
