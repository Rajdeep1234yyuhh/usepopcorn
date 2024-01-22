import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const key = "40f9305b";

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handleSelect(id) {
    setSelectedId((sid) => (id === sid ? null : id));
  }
  function handleClose() {
    setSelectedId(null);
  }
  function handleWatch(movie) {
    setWatched((watched) => [...watched, movie]);
  }
  function handleDelete(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  useEffect(
    function () {
      const controller = new AbortController();

      async function movieFetch() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${key}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) throw new Error("Fetching failed");
          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found!");
          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
            console.error(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (!query.length) {
        setMovies([]);
        setError("");
        return;
      }
      handleClose();
      movieFetch();

      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <Results movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} handleSelect={handleSelect} />
          )}
          {error && <Error message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              handleClose={handleClose}
              handleWatch={handleWatch}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummery watched={watched} />
              <WatchedMoviesList
                watched={watched}
                handleDelete={handleDelete}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function Loader() {
  return <p className="loader">Loading...</p>;
}
function Error({ message }) {
  return (
    <p className="error">
      <span>❌ </span> {message}
    </p>
  );
}
function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
function Results({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function Box({ children }) {
  const [isOpen1, setIsOpen1] = useState(true);
  return (
    <div className="box" style={{ overflow: "hidden" }}>
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen1 ? "–" : "+"}
      </button>
      {isOpen1 && children}
    </div>
  );
}
function MovieList({ movies, handleSelect }) {
  return (
    <ul className="list list-movies" style={{ overflow: "hidden" }}>
      {movies?.map((movie) => (
        <Movie movie={movie} handleSelect={handleSelect} key={movie.imdbID} />
      ))}
    </ul>
  );
}
function Movie({ handleSelect, movie }) {
  return (
    <li key={movie.imdbID} onClick={() => handleSelect(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummery({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie?.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMoviesList({ watched, handleDelete }) {
  return (
    <ul className="list" style={{ overflow: "hidden" }}>
      {watched.map((movie) => (
        <WatchedMovies
          movie={movie}
          key={movie.imdbID}
          handleDelete={handleDelete}
        />
      ))}
    </ul>
  );
}
function WatchedMovies({ movie, handleDelete }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => handleDelete(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
function MovieDetails({ selectedId, handleClose, handleWatch, watched }) {
  const [movie, setMovie] = useState({});
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState();
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const uuserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;
  const {
    Title: title,
    Poster: poster,
    Year: year,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Actors: actors,
    Director: director,
    Released: released,
    // Genre: genre,
  } = movie;
  // const [top, setTop] = useState();
  // console.log(top);
  // useEffect(
  //   function () {
  //     setTop(imdbRating > 8);
  //   },
  //   [imdbRating]
  // );
  const Top = imdbRating > 8;
  console.log(Top);
  // const [avg, setAvg] = useState(0);
  function handleAdd() {
    const newMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ")[0]),
      userRating,
    };
    handleWatch(newMovie);
    // setAvg(Number(imdbRating));
    // setAvg((x) => Number(x + userRating) / 2);
    handleClose();
  }
  useEffect(
    function () {
      async function getMovieDetails() {
        setLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${key}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
      }
      getMovieDetails();
      setLoading(false);
    },
    [selectedId]
  );
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      return function () {
        document.title = "UsePopcorn";
      };
    },

    [title]
  );
  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          handleClose();
        }
      }
      document.addEventListener("keydown", callback);
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [handleClose]
  );
  return (
    <div className="details">
      {loading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={handleClose}>
              &larr;
            </button>
            <img src={poster} alt={`poster of the movie ${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {movie.Runtime}
              </p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          {/* <p>{avg}</p> */}
          <section>
            {!isWatched ? (
              <div className="rating">
                <StarRating
                  maxRating={10}
                  size={24}
                  setMovieRating={setUserRating}
                />
                {userRating > 0 && (
                  <button className="btn-add" onClick={handleAdd}>
                    + Add to list
                  </button>
                )}
              </div>
            ) : (
              <p>
                Already rated this movie {uuserRating} <span>⭐</span>
              </p>
            )}
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
