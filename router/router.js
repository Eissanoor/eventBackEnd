import express from "express";
import multer from "multer";
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

const storage = multer.diskStorage({
  destination: "../uploads",
  filename: function (req, file, cb) {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
var uploadee = multer({
  storage: storage,
  limits: { fileSize: 1000000000000000000000 },
});
const cpUpload = upload.fields([
  { name: "governmentIDImage" },
  { name: "selfieIDImage" },
]);

router.use("/profile", express.static("uploads"));
router.post("/UserLoginAuth", FATSDB.UserLoginAuth);
router.post("/tblPostMembers", cpUpload, FATSDB.tblPostMembers);
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
router.put("/tblApprovalUser/:memberID", FATSDB.tblApprovalUser);
router.get("/ListOFAllLocation", FATSDB.ListOFAllLocation);
router.get("/listOfSevenDayPateints", FATSDB.listOfSevenDayPateints);
router.put(
  "/tblUpdateProfileIMAG/:memberID",
  cpUpload,
  FATSDB.tblUpdateProfileIMAG
);
router.put("/tblUpdateMembers/:memberID", FATSDB.tblUpdateMembers);
router.delete("/deleteMembersById/:memberID", FATSDB.deleteMembersById);
router.put("/tblInActiveUser/:memberID", FATSDB.tblInActiveUser);
export default router;
