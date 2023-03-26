const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

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

/*  API 1 */

app.get("/movies/", async (request, response) => {
  const moviesquerry = `
    SELECT 
        *
    FROM
        movie;`;

  const dbresponse = await db.all(moviesquerry);
  response.send(
    dbresponse.map((eachitem) => convertDbObjectToResponseObject(eachitem))
  );
});

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

/*  API 2 */

app.post("/movies/", async (request, response) => {
  const moviedetails = request.body;
  const { directorId, movieName, leadActor } = moviedetails;

  const addmoviequerry = `
    INSERT INTO
        movie (director_id,movie_name,lead_actor) 
    VALUES (
        '${directorId}',
        '${movieName}',
        '${leadActor}'
     );`;

  const addmovie = await db.run(addmoviequerry);
  response.send("Movie Successfully Added");
});

/*  API 3 */

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getmoviequerry = `
    SELECT 
        *
    FROM
        movie
    WHERE
       movie_id = ${movieId};`;

  const getmovres = await db.get(getmoviequerry);
  response.send(getmovres.map((eachmov) => getmoviecheck(eachmov)));
});

const getmoviecheck = (getmovobj) => {
  return {
    movieId: getmovobj.movie_id,
    directorId: getmovobj.director_id,
    movieName: getmovobj.movie_name,
    leadActor: getmovobj.lead_actor,
  };
};

/*  API 4 */

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const moviedetails = request.body;
  const { directorId, movieName, leadActor } = moviedetails;

  const putquery = `
    UPDATE 
        movie
    SET
        director_id= '${directorId}',
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE 
        movie_id = ${movieId};`;

  const putresponse = await db.run(putquery);
  response.send("Movie Details Updated");
});

/*  API 5 */

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deletequery = `
    DELETE FROM 
        movie
    WHERE
        movie_id = ${movieId};`;

  const deleteresponse = await db.run(deletequery);
  response.send("Movie Removed");
});

/* API 6 */

app.get("/directors/", async (request, response) => {
  const getdirqry = `
    SELECT * FROM director;`;

  const getdirres = await db.all(getdirqry);
  response.send(getdirres.map((eachdir) => directorcheck(eachdir)));
});

const directorcheck = (dirobj) => {
  return {
    directorId: dirobj.director_id,
    directorName: dirobj.director_name,
  };
};

/* API 7 */

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const dirmovqry = `
    SELECT 
        *
    FROM
        movie
    WHERE 
        director_id = ${directorId};`;

  const dirmovres = await db.all(dirmovqry);
  response.send(dirmovres.map((eachdirmov) => dirmoviescheck(eachdirmov)));
});

const dirmoviescheck = (dirmovobj) => {
  return {
    movieName: dirmovobj.movie_name,
  };
};

module.exports = app;
