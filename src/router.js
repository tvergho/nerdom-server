import { Router } from 'express';
import * as Character from './controllers/character_controller';

const router = Router();

router.route('/character/starwars').get(Character.getStarWarsCharacter);
router.route('/character/hp').get(Character.getHPCharacter);
router.route('/character/lotr').get(Character.getLOTRCharacter);
router.route('/rankings').get(Character.getRankings);
router.route('/update').post(Character.updateRankings);
router.route('/getimage').get(Character.getImage);

// Helper functions.
router.route('/populate').post(Character.populateCharacters);
router.route('/deleteall').post(Character.deleteAll);
router.route('/setscore').post(Character.setScore);

export default router;
