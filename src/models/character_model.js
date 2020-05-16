import mongoose, { Schema } from 'mongoose';

const CharacterSchema = new Schema({
  name: String,
  fandom: String,
  score: Number,
  ranking: Number,
});

const CharacterModel = mongoose.model('Character', CharacterSchema);

export default CharacterModel;
