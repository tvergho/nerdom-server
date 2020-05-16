/* eslint-disable no-await-in-loop */
import * as CharacterData from '../models/character_list';
import Character from '../models/character_model';

const axios = require('axios').default;

const STAR_WARS_ROOT_API = 'https://swapi.dev/api';
const HP_ROOT_API = 'https://www.potterapi.com/v1';
const HP_API_KEY = '$2a$10$s2vXN5qGJCl82l0kMAC55Otssd7L3c/K0K0JcHSgr4tA5z./E2Qdi';
const LOTR_ROOT_API = 'https://the-one-api.herokuapp.com/v1';
const LOTR_ACCESS_TOKEN = 'rIfs8ljjvKVfFdAv48Po';
const lotrConfig = {
  headers: { Authorization: `Bearer ${LOTR_ACCESS_TOKEN}` },
};

// Returns { info (contains info from the database), detail (all the info provided by the API) }
export const getStarWarsCharacter = (req, res) => {
  const totalCharacters = CharacterData.STAR_WARS_CHARACTERS.length;
  const character = CharacterData.STAR_WARS_CHARACTERS[Math.floor(Math.random() * totalCharacters)];
  const name = character[0];
  const id = character[1];

  Character.findOne({ name })
    .then((dbResult) => {
      axios.get(`${STAR_WARS_ROOT_API}/people/${id}/`)
        .then((apiResponse) => {
          res.json({ info: dbResult, detail: apiResponse.data });
        })
        .catch((error) => {
          res.status(500).json({ error });
        });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

export const getHPCharacter = (req, res) => {
  const totalCharacters = CharacterData.HP_CHARACTERS.length;
  const character = CharacterData.HP_CHARACTERS[Math.floor(Math.random() * totalCharacters)];
  const name = character[0];
  const id = character[1];

  Character.findOne({ name })
    .then((dbResult) => {
      axios.get(`${HP_ROOT_API}/characters/${id}?key=${HP_API_KEY}`)
        .then((apiResponse) => {
          res.json({ info: dbResult, detail: apiResponse.data });
        })
        .catch((error) => {
          res.status(500).json({ error });
        });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

export const getLOTRCharacter = (req, res) => {
  const totalCharacters = CharacterData.LOTR_CHARACTERS.length;
  const character = CharacterData.LOTR_CHARACTERS[Math.floor(Math.random() * totalCharacters)];
  const name = character[0];
  const id = character[1];

  Character.findOne({ name })
    .then((dbResult) => {
      axios.get(`${LOTR_ROOT_API}/character/${id}`, lotrConfig)
        .then((apiResponse) => {
          res.json({ info: dbResult, detail: apiResponse.data });
        })
        .catch((error) => {
          res.status(500).json({ error });
        });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

export const getRankings = (req, res) => {
  Character.find({}).sort('ranking')
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

export const updateRankings = async (req, res) => {
  const winner = await Character.findOne({ name: req.body.winner })
    .catch((error) => {
      res.status(500).json({ error });
    });
  const loser1 = await Character.findOne({ name: req.body.loser1 })
    .catch((error) => {
      res.status(500).json({ error });
    });
  const loser2 = await Character.findOne({ name: req.body.loser2 })
    .catch((error) => {
      res.status(500).json({ error });
    });

  const diff1 = winner.ranking - loser1.ranking;
  const diff2 = winner.ranking - loser2.ranking;

  if (diff1 > 0) { // Unexpected loss.
    // Cap ranking shifts by 60 and 10 to prevent unexpected outliers.
    await Character.findByIdAndUpdate(winner._id, { score: Math.min(winner.score + (diff1 * 2.6), winner.score + 60) });
    await Character.findByIdAndUpdate(loser1._id, { score: Math.max(loser1.score - (diff1 * 3.5), loser1.score - 10) });
  } else { // Expected win.
    await Character.findByIdAndUpdate(winner._id, { score: winner.score + 1 });
  }
  if (diff2 > 0) {
    await Character.findByIdAndUpdate(winner._id, { score: Math.min(winner.score + (diff1 * 2.6), winner.score + 60) });
    await Character.findByIdAndUpdate(loser2._id, { score: Math.max(loser2.score - (diff1 * 3.5), loser2.score - 10) });
  } else {
    await Character.findByIdAndUpdate(winner._id, { score: winner.score + 1 });
  }

  rerankDatabase()
    .then(() => {
      res.json({ message: 'Rankings updated!' });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

async function rerankDatabase() {
  Character.find({}).sort('-score')
    .then(async (result) => {
      for (let i = 0; i < result.length; i += 1) {
        if (i > 0 && result[i].score === result[i - 1].score) { // It's a tie.
          await Character.findByIdAndUpdate(result[i]._id, { ranking: result[i - 1].ranking })
            .then(() => {
              result[i].ranking = result[i - 1].ranking; // Update prev ranking in reference list.
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          await Character.findByIdAndUpdate(result[i]._id, { ranking: i + 1 })
            .then(() => {
              result[i].ranking = i + 1;
            })
            .catch((error) => {
              console.log(error);
            });
        }
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

export const populateCharacters = async (req, res) => {
  if (req.body.populate) { // Require req.body.populate to be true.
    for (let i = 0; i < CharacterData.STAR_WARS_CHARACTERS.length; i += 1) {
      const character = CharacterData.STAR_WARS_CHARACTERS[i];
      const name = character[0];

      Character.findOne({ name })
        .then(async (result) => {
          if (result === null) { // Write to database.
            const newChar = new Character();
            newChar.name = name;
            newChar.fandom = 'Star Wars';
            newChar.score = CharacterData.STAR_WARS_CHARACTERS.length - i;
            newChar.ranking = i + 1;
            await newChar.save();
          }
        })
        .catch((error) => {
          res.status(500).json({ error });
        });
    }

    for (let i = 0; i < CharacterData.LOTR_CHARACTERS.length; i += 1) {
      const character = CharacterData.LOTR_CHARACTERS[i];
      const name = character[0];

      Character.findOne({ name })
        .then(async (result) => {
          if (result === null) { // Write to database.
            const newChar = new Character();
            newChar.name = name;
            newChar.fandom = 'LOTR';
            newChar.score = CharacterData.LOTR_CHARACTERS.length - i;
            newChar.ranking = i + 1;
            await newChar.save();
          }
        })
        .catch((error) => {
          res.status(500).json({ error });
        });
    }

    for (let i = 0; i < CharacterData.HP_CHARACTERS.length; i += 1) {
      const character = CharacterData.HP_CHARACTERS[i];
      const name = character[0];

      Character.findOne({ name })
        .then(async (result) => {
          if (result === null) { // Write to database.
            const newChar = new Character();
            newChar.name = name;
            newChar.fandom = 'Harry Potter';
            newChar.score = CharacterData.HP_CHARACTERS.length - i;
            newChar.ranking = i + 1;
            await newChar.save();
          }
        })
        .catch((error) => {
          res.status(500).json({ error });
        });
    }
    await rerankDatabase();
    res.json({ message: 'Population successful.' });
  }
};

export const deleteAll = (req, res) => {
  if (req.body.delete) {
    Character.deleteMany({})
      .then(() => {
        res.json({ message: 'Deletion successful' });
      })
      .catch((error) => {
        console.log(error);
      });
  }
};

export const setScore = (req, res) => {
  Character.findOneAndUpdate({ name: req.body.name }, { score: req.body.score })
    .then((response) => {
      this.rerankDatabase();
    })
    .catch((error) => {
      console.log(error);
    });
};
