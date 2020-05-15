import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

public class AlgorithmGenerator {
    private final List<String> rankedCharacters = new ArrayList<>(Arrays.asList(
            "Sauron", "Gandalf", "Dumbledore", "Voldemort", "Yoda",
            "Palpatine", "Mace Windu", "Galadriel", "Bellatrix Lestrange", "Luke Skywalker",
            "Anakin Skywalker", "Elrond", "Severus Snape", "Minerva McGonagall", "Aragorn",
            "Leia", "Harry Potter", "Hermione Granger", "Frodo Baggins", "Lando"
    ));
    private final List<Character> characterList;
    private static final double X = 0; // eBonus
    private double y; // uBonus
    private double z; // uPenalty
    // Possibilities:
    // Multiplication: (0.9, 1.4), (1.9, 1.4), (1.6, 1.0), (1.7, 4.1), (2.2, 2.3), (2.0, 3.2)
    // Multiplication, addition: (1.5, 2.0), (2.2, 1.5), (2.1, 1.9)
    // Power, addition: (1.7, 3), (1.2, 2.8), (1.5, 2.2), (1.5, 1.9)

    public AlgorithmGenerator(double y, double z) {
        characterList = new ArrayList<>();
        this.y = y;
        this.z = z;
        for (String character : rankedCharacters) {
            Character c = new Character(character);
            characterList.add(c);
        }
        Collections.shuffle(characterList); // Randomize the initial order.
    }

    // Modify these methods to play around with the algorithm.

    /**
     * Bonus added to total score on an expected win.
     */
    private double eBonus(double diff) {
        return X;
    }

    /**
     * Bonus added to total score on an unexpected win.
     * @param diff Difference in places on the rankings.
     */
    private double uBonus(double diff) {
        // return (Math.round(Math.pow(diff, 1/y) * 100.0) / 100.0);
        // return (Math.round(Math.pow(diff, y) * 100.0) / 100.0);
        return Math.round(diff * y * 100.0);
        // return diff + y;
    }

    /**
     * Penalty subtracted from total score on an unexpected loss.
     * @param diff Difference in places on the rankings.
     */
    private double uPenalty(double diff) {
        // return -(Math.round(Math.pow(diff, 1/z) * 100.0) / 100.0);
        // return -(Math.round(Math.pow(diff, z) * 100.0) / 100.0);
        return -(Math.round(diff * z * 100.0));
        // return - (diff + z);
    }

    // End of modification section.

    public int runTest() {
        int numIterations = 0;

        while(!doListsMatch()) {
            // Draw three random characters from the list.
            Character char1 = characterList.get(ThreadLocalRandom.current().nextInt(0, characterList.size()));
            Character char2 = characterList.get(ThreadLocalRandom.current().nextInt(0, characterList.size()));
            Character char3 = characterList.get(ThreadLocalRandom.current().nextInt(0, characterList.size()));

            // Account for the characters potentially being the same.
            while (char1 == char2 || char1 == char3 || char2 == char3) {
                char1 = characterList.get(ThreadLocalRandom.current().nextInt(0, characterList.size()));
                char2 = characterList.get(ThreadLocalRandom.current().nextInt(0, characterList.size()));
                char3 = characterList.get(ThreadLocalRandom.current().nextInt(0, characterList.size()));
            }

            // Next, find the winner.
            Character winner = char1;
            Character loser1 = char2;
            Character loser2 = char3;
            for (int i = 0; i < rankedCharacters.size(); i++) {
                if (rankedCharacters.get(i).equals(char1.getName())) {
                    winner = char1;
                    loser1 = char2;
                    loser2 = char3;
                    break;
                }
                else if (rankedCharacters.get(i).equals(char2.getName())) {
                    winner = char2;
                    loser1 = char1;
                    loser2 = char3;
                    break;
                }
                else if (rankedCharacters.get(i).equals(char3.getName())) {
                    winner = char3;
                    loser1 = char1;
                    loser2 = char2;
                    break;
                }
            }

            // Calculate the differences.
            // If negative, it's an expected win.
            // If positive, it's an unexpected loss.
            double diff1 = characterList.indexOf(winner) - characterList.indexOf(loser1);
            double diff2 = characterList.indexOf(winner) - characterList.indexOf(loser2);

            // Expected win.
            if (diff1 <= 0) {
                winner.addToScore(eBonus(diff1));
            }
            else { // Unexpected loss.
                winner.addToScore(uBonus(diff1));
                loser1.addToScore(uPenalty(diff1));
            }

            // Expected win.
            if (diff2 <= 0) {
                winner.addToScore(eBonus(diff2));
            }
            else { // Unexpected loss.
                winner.addToScore(uBonus(diff2));
                loser2.addToScore(uPenalty(diff2));
            }

            // Re-sort the list based on score (descending order).
            Collections.sort(characterList, Collections.reverseOrder());

            // Test consistency by outputting the list every 25 iterations.
            if (numIterations % 25 == 0) {
                System.out.println(characterList);
            }
            numIterations++;
        }
        System.out.println("This algorithm took: " + numIterations + " iterations.");
        return numIterations;
    }

    public static void runMultipleTests() {
        int bestScore = 0;
        double[] bestSet = new double[2];

        // Run for all possible combinations of Y and Z.
        for (double i = 1; i <= 3.0; i+= 0.1) {
            for (double j = 1; j <= 5.0; j+= 0.1) {
                System.out.println("Testing y = " + i + " and z = " + j);
                int score = 0;

                for (int k = 0; k < 5; k++) {
                    AlgorithmGenerator generator = new AlgorithmGenerator(i, j);
                    score += generator.runTest();
                    // System.out.println(score);
                }

                if (bestScore == 0) bestScore = score;

                if (score < bestScore) {
                    bestScore = score;
                    bestSet[0] = i;
                    bestSet[1] = j;
                }
            }
        }

        System.out.println("The best result was: " + bestSet[0] + ", " + bestSet[1] + " with " + bestScore + " total iterations.");
    }

    // Checks for an 80% match rate between the expected character ordering and the user-generated one.
    private boolean doListsMatch() {
        double discrepancies = 0;
        for (int i = 0; i < characterList.size() - 2; i++) { // Lando/Frodo bug
            if (!characterList.get(i).getName().equals(rankedCharacters.get(i))) {
                discrepancies++;
            }
        }
        if (discrepancies / characterList.size() < 0.2) {
            return true;
        }
        else {
            return false;
        }
    }

    // Model class for a character.
    private class Character implements Comparable<Character> {
        private final String name;
        private double score;

        public Character(String name) {
            this.name = name;
            score = 1;
        }

        public String getName() { return name; }
        public double getScore() { return score; }

        public void setScore(double score) { this.score = score; }
        public void addToScore(double score) { this.score += score; }

        @Override
        public int compareTo(Character o) {
            return (int)(this.getScore() - o.getScore());
        }

        public String toString() {
            return name + " " + score;
        }
    }

    public static void main(String[] args) {
        // AlgorithmGenerator.runMultipleTests();
        AlgorithmGenerator generator = new AlgorithmGenerator(2.6, 3.5);
        generator.runTest();
    }
}
