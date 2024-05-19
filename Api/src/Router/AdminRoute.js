import express from "express";
import {
  addFilm,
  loginAdmin,
  addEpisodeFilm,
  registerAdmin,
  countAdmin,
  getAllUser,
  getAllFilm,
  deleteFilm,
  deleteUser,
  getFilm,
  deleteEpisode,
  uploadFilmURL,
  uploadImageURL,
} from "../Controller/AdminController.js";

import { ValidatePass } from "../Middleware/validatePasswords.js";
import { verifyTokenAdmin } from "../Middleware/veryfiToken.js";
import handler from "../Middleware/uploads.js";

const adminRoute = express.Router();

adminRoute.post("/login", ValidatePass, loginAdmin);
adminRoute.post("/register", registerAdmin);
adminRoute.post("/count", countAdmin);
adminRoute.get("/listuser", verifyTokenAdmin, getAllUser);
adminRoute.get("/listfilm", verifyTokenAdmin, getAllFilm);
adminRoute.post("/films", verifyTokenAdmin, addFilm);
adminRoute.get("/films/:id", verifyTokenAdmin, getFilm);
adminRoute.post("/delete/film", verifyTokenAdmin, deleteFilm);
adminRoute.post("/delete/episode", verifyTokenAdmin, deleteEpisode);
adminRoute.post("/delete/user", verifyTokenAdmin, deleteUser);
adminRoute.post("/episode", verifyTokenAdmin, addEpisodeFilm);
adminRoute.post("/upload-video", uploadFilmURL);
adminRoute.post("/upload-image", uploadImageURL);

export default adminRoute;
