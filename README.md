# Nerdom Server

## Building the AlgorithmGenerator
The most daunting part about starting this project was building the three-way ranking algorithm. I've never taken an algorithms class, so I had no idea how to go about devising an algorithm for this case. In response to the user (who would select one of three characters to win a random "duel"), I needed to be able to move characters up and down the global rankings list by a proportional amount. The algorithm, therefore, had to accept a random list of different characters with very different backgrounds and generate a crowdsourced consensus ranking list with the minimal possible amount of user input. Although I would later pre-rank the data before plugging it into the algorithm to save time, I didn't want to spend hours clicking just to generate a plausible initial list.  

Google searching "ranking algorithms" only revealed results about search engine rankings - nothing that fit my use case. Thus, I needed to devise my own (simple) algorithm. 

I decided that a good algorithm would meet two criteria:
1) It should be able to generate a somewhat "accurate" list with minimal user submissions (which I called "iterations").
2) It should be consistent - that is, one outlier user ranking shouldn't drastically change the global rankings. The list should eventually reach equilibrium after enough data points are submitted.

The eventual algorithm framework I designed accounted for two scenarios:
- If a higher-ranked character beats a lower-ranked character (an **expected win**), the higher-ranked character should receive a constant bonus to their score ("expected bonus," or "eBonus") and the lower-ranked character should receive no penalty.
- If a higher-ranked character *loses* to a lower-ranked character (an **unexpected win**), the higher-ranked character should receive some calculated penalty (a "uPenalty") and the lower-ranked character should receive some calculated bonus (a "uBonus"). 

I therefore wrote AlgorithmGenerator.java with functions for the eBonus, uBonus, and uPenalty. The eBonus was just a constant (X) added onto the score, while the uBonus and uPenalty functions used either addition, multiplication, exponents, or the root function with constants (Y and Z). Changing X, Y, and Z and their respective functions would be how I tested the algorithm. 

Partway through, I realized that the algorithm was never completing because it tended to mix up "Lando" and "Frodo Baggins" as the two weakest characters and for some reason never put them in the proper order. I never identified the source of this bug, so I ended up just cutting the loop that checked whether the two lists were identical early. Manually testing Y and Z values then got tedious, so I wrote a function to cycle through every combination of potential constants to find the optimal one.

Ultimately, while I settled on an algorithm, I realized that a lot of the efficiency variations between tests were random and came from how the characters were initially randomly seeded. And since perfectly matching the pre-ranked list was unnecessary, I modified the doListsMatch() function to only test for 80% consistency. To prevent user mistakes or large outliers from drastically shifting the rankings, I imposed a maximum cap on both the uBonus and the uPenalty when building the client.

Final algorithm:
- uBonus = Y * difference in ranking, Y = 2.6 (max 30)
- uPenalty = Z * difference in ranking, Z = 3.5 (max -10)

## Constructing the Server
The rest of the server side for this project was fairly straightforward. I defined nine routes, six for retreiving random characters and creating/updating the rankings, and thre "helper functions" for populating new characters, resetting the rankings, and setting the score of an individual character. To avoid accidental resets, the latter three functions require a JSON variable to be passed along with the HTTP request for any changes to the database to occur. 

Because each API - in particular, the Harry Potter and LOTR APIs - returns an extremely long list of characters by default, I had to manually select the most prominent characters for inclusion in the final rankings. To do this, I wrote separate Node.js scripts for each API to output the name and ID of every available character. I then created constant arrays containing the 30 characters from each fandom I wanted to include and their respective IDs. 

The trickiest part of the server was writing the rerankDatabase() function, to automatically correct the rankings once the characters' scores are updated. I spent a lot of time debugging a scoping issue with the forEach loop before realizing I could iterate through the object returned from the database with a normal for loop. 

Finally, the server also uses Cheerio to retrieve the main image from a character's wiki page and pass the URL along to the client.