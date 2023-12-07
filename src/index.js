import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import StarRating from "./StarRating";
// import "./index.css";
// import App from "./App";

function Test() {
  const [movieRating, setMovieRating] = useState();
  return (
    <>
      <StarRating maxRating={10} color="blue" setMovieRating={setMovieRating} />
      <p>This movie is rated {movieRating} </p>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <StarRating
      maxRating={5}
      messages={["worst", "bad", "okay", "good", "amazing!"]}
    />
    <StarRating
      maxRating={5}
      size={16}
      color="red"
      className="test"
      defaultRating={3}
    />
    <Test />
  </React.StrictMode>
);
