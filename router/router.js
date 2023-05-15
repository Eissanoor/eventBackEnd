import express from "express";
import upload from "../config/multerConfig.js";

const router = express.Router();

import FATSDBODBC from "../controllers/controllersODBC.js";
//
import FATSDB from "../controllers/controlletrsMSSQL.js";
import {
  checkAuthentication,
  checkRole,
  generateToken,
} from "../helpers/apiAuth.js";
import logoUpload from "../config/multerLogoConfig.js";
router.post("/UserLoginAuth", FATSDB.UserLoginAuth);
router.post("/tblPostMembers", FATSDB.tblPostMembers);
router.get("/getMembersById/:memberID", FATSDB.getMembersById);
router.get("/getMembersAll", FATSDB.getMembersAll);
router.get("/ListOfDropDownCities", FATSDB.ListOfDropDownCities);
router.get("/ListOfDropDownProvince", FATSDB.ListOfDropDownProvince);
router.get(
  "/getMembersEmail_Password/:email/:password",
  FATSDB.getMembersEmail_Password
);
router.get("/getEentById/:id", FATSDB.getEentById);
router.get("/getEventAll", FATSDB.getEventAll);
router.post("/tblPostEvent", FATSDB.tblPostEvent);
router.put("/tblUpdateEvent/:id", FATSDB.tblUpdateEvent);
router.delete("/deleteEventById/:id", FATSDB.deleteEventById);
export default router;
