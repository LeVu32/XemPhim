import express from "express";
import { getAll, streamVideos, getFilm } from "../Controller/FilmController.js";

const filmRoute = express.Router();
filmRoute.get("/", getAll);
filmRoute.get("/:id", getFilm);
filmRoute.get("/episode/:pathPhim", streamVideos);
export default filmRoute;
