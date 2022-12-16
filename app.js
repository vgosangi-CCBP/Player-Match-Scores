const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// //API 1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      player_id as playerId,
      player_name as playerName
    FROM
      player_details
    ORDER BY
      player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray);
});

//API 2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
      player_id as playerId,
      player_name as playerName
    FROM
      player_details
    where
      player_id=${playerId};`;
  const playerArray = await db.all(getPlayerQuery);
  response.send(playerArray[0]);
});

//API 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerQuery = `
    update
      player_details
   SET
       player_name = '${playerName}'
         WHERE
      player_id = ${playerId};
      `;

  const dbResponse = await db.run(updatePlayerQuery);

  response.send("Player Details Updated");
});

// //API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    SELECT
      match_id as matchId,
      match,
      year
    FROM
      match_details
   where
      match_id = ${matchId};`;
  const matchArray = await db.all(getMatchQuery);
  response.send(matchArray[0]);
});

// //API 5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getMatchQuery = `
    SELECT
      match_details.match_id as matchId,
      match,
      year
    FROM
      match_details inner join player_match_score on
      match_details.match_id = player_match_score.match_id
   where
      player_match_score.player_id = ${playerId};`;
  const matchArray = await db.all(getMatchQuery);
  response.send(matchArray);
});

//API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    SELECT
      player_details.player_id as playerId,
      player_details.player_name as playerName
    FROM
      player_details inner join player_match_score on
      player_details.player_id = player_match_score.player_id
   where
      player_match_score.match_id = ${matchId};`;
  const matchArray = await db.all(getMatchQuery);
  response.send(matchArray);
});

//API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getMatchQuery = `
    SELECT
      player_details.player_id as playerId,
      player_details.player_name as playerName,
      sum(score) as totalScore,
       sum(player_match_score.fours) as totalFours,
        sum(player_match_score.sixes) as totalSixes

    FROM
      player_details natural join player_match_score
   where
      player_id = ${playerId};`;
  const matchArray = await db.all(getMatchQuery);
  response.send(matchArray[0]);
});

module.exports = app;
