import express from "express";
import multer from "multer";
import upload from "../config/multerConfig.js";
import sql from "mssql";
import config from "../config/dbconfig.js";
import nodemailer from "nodemailer";
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
router.put("/tblUpdateMembers/:memberID", cpUpload, FATSDB.tblUpdateMembers);
router.delete("/deleteMembersById/:memberID", FATSDB.deleteMembersById);
router.put("/tblInActiveUser/:memberID", FATSDB.tblInActiveUser);
router.put(
  "/tblUpdateEventstatusInactive/:id",
  FATSDB.tblUpdateEventstatusInactive
);
router.put(
  "/tblUpdateEventstatusActive/:id",
  FATSDB.tblUpdateEventstatusActive
);
router.get("/ListOfDropDownWithIDCities", FATSDB.ListOfDropDownCities);
router.get(
  "/ListOfDropDownWithIDProvince/:tblcitiesID",
  FATSDB.ListOfDropDownWithIDProvince
);
router.get(
  "/ListOfDropDownWithIDbarangays/:tblcitiesID",
  FATSDB.ListOfDropDownWithIDbarangays
);
router.delete("/deleteProvanceById/:provinceID", FATSDB.deleteProvanceById);
router.post("/tbl_post_help_desk", FATSDB.tbl_post_help_desk);
router.get("/get_post_help_desk", FATSDB.get_post_help_desk);
router.get("/get_post_help_deskById/:deskID", FATSDB.get_post_help_deskById);
router.put("/tblUpdateHelp_desk/:deskID", FATSDB.tblUpdateHelp_desk);
router.delete("/deleteHelp_desk_ById/:deskID", FATSDB.deleteHelp_desk_ById);

//---------------------------------------RESETPASSWORD----------------------------------
const sendotp = router.post("/passwordchangeotpSend", async (req, res) => {
  let pool = await sql.connect(config);
  let email = req.body.email;
  let data = await pool
    .request()
    .input("email", sql.NVarChar, req.body.email)
    .query(`select * from members where email=@email`);
  console.log(data);
  if (data.rowsAffected[0] == 1) {
    var val = Math.floor(1000 + Math.random() * 9000);
    console.log(val);

    try {
      let OTP = await pool
        .request()
        .input("email", sql.NVarChar, email)
        .input("OTP_NO", sql.Numeric, val)

        .query(
          ` 
            INSERT INTO [dbo].[otp]
                       ([email] 
                        ,[OTP_NO]
                       
                        )
                 VALUES
                       (@email
                        ,@OTP_NO
                      
                             
                       )
                    

                       SELECT SCOPE_IDENTITY() AS otpID
                       
                       
            `
        );
      var transpoter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "eissaanoor@gmail.com",
          pass: "asqgbvuvawbtjnqz",
        },
      });

      var mailoption = {
        from: "eissaanoor@gmail.com",
        to: email,
        subject: "sending email using nodejs",
        text: `changePassword OTP ${val}`,
      };
      transpoter.sendMail(mailoption, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("email send " + info.response);
        }
      });
      console.log("------------------", OTP);
      console.log(data.recordset[0].email);
      let varimail = data.recordset[0].email;
      res.status(200).json({ OTP: `${val}` });
      console.log(varimail, "---------------------------------");
      const sendtp = router.post("/varifyOtp", async (req, res) => {
        console.log(varimail, "---------------------------------");
        const OTP_NO = req.body.OTP_NO;
        const email = req.body.email;
        const result = await pool
          .request()
          // .input("OTP_NO", sql.Numeric, req.body.OTP_NO)
          .query(
            `SELECT * FROM otp WHERE email='${email}' AND OTP_NO='${OTP_NO}'`
          );
        if (result.rowsAffected[0] == 0) {
          res.status(404).json({ error: "INVALID OTP CODE" });
          console.log(result);
        } else {
          res
            .status(200)
            .json({ message: "YOUR VARIFICATION OTP CODE successful" });
        }
      });
      const sendot = router.post("/changePassword", async (req, res) => {
        const email = req.body.email;
        const result = await pool
          .request()

          .query(`SELECT * FROM members WHERE email='${email}'`);

        console.log(result.recordset[0].password);
        if (result.recordset[0].password) {
          let OTP = await pool
            .request()
            .input("password", sql.NVarChar, req.body.password)

            .query(
              ` 
            UPDATE [dbo].[members]
SET
[password] =@password


 
 



  
  
WHERE email='${email}'
                       
                       
            `
            );
          res.status(201).json({ message: "PASSWORD CHANGED" });
        } else {
          res.status(404).json({ error: "PASSWORD NOT CHANGED" });
        }
      });
    } catch (error) {
      console.log("This email cannot exist", error);
      res.json(error);
    }
  } else {
    res.json("This email cannot exist");
  }
});

export default router;
