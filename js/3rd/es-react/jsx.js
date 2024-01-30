import React from "./react.js";
import htm from "../htm/htm.js";

export const jsx = htm.bind(React.createElement);

export default jsx;
