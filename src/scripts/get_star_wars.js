/* eslint-disable no-await-in-loop */
const axios = require('axios').default;

const STAR_WARS_ROOT_API = 'https://swapi.dev/api';
const numCharacters = 50;
const characters = [];

async function readCharacters() {
  for (let i = 1; i <= numCharacters; i += 1) {
    if (i !== 17) { // There is no id of 17.
      await axios.get(`${STAR_WARS_ROOT_API}/people/${i}/`)
        .then((response) => {
          characters.push([response.data.name, i]);
          if (i === numCharacters) printCharacters();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
}

function printCharacters() {
  console.log(characters);
}

readCharacters();
