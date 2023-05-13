// using mssql .....................................................................................
import jwt from "jsonwebtoken";
import sql from "mssql";

import config from "../config/dbconfig.js";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });
let jwtSecret = process.env.JWT_SECRET;
let jwtExpiration = process.env.JWT_EXPIRATION;
//get all data
function generateUpdateQuery(fields, tableName) {
  const updateFields = Object.keys(fields)
    .map((key) => `${key}=@${key}`)
    .join(",");

  return `UPDATE ${tableName} SET ${updateFields}`;
}
const FATSDB = {
  async UserLoginAuth(req, res, next) {
    try {
      let token;
      let tokenPayload;
      const { email, password } = req.body;
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .query(
          `SELECT * FROM users WHERE email='${email}' AND password='${password}'`
        );

      if (result.recordset.length > 0) {
        // fetch roles assign to user on the basis of loginname

        let data = await pool
          .request()
          .input("email", sql.NVarChar, email)
          .query(`select * from users where email=@email`);
        //
        if (data.rowsAffected[0] != 0) {
          let listdata = data.recordsets[0];
          console.log(listdata);
          const assignedRoles = listdata.map((item) => item.RoleID);
          console.log(assignedRoles);
          tokenPayload = {
            userloginId: email,
            assignedRoles: assignedRoles,
          };
          console.log(tokenPayload);
        } else {
          tokenPayload = {
            userloginId: users,
            assignedRoles: [],
          };
        }
        token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: jwtExpiration });
        console.log(token);

        if (!token)
          return res
            .status(500)
            .send({ success: false, message: "Token not generated" });
        // return res.cookie("token", token, {
        //   // httpOnly: true,
        // }).
        res
          .status(200)
          .send({ success: true, user: result.recordset, token: token });
      } else {
        return res
          .status(400)
          .send({ success: false, message: "Invalid Credentials" });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .send({ success: false, message: "Internal Server Error", error: err });
    }
  },
  async tblPostMembers(req, res, next) {
    try {
      let qdate = new Date();

      let pool = await sql.connect(config);

      let data = await pool
        .request()
        .input("email", sql.NVarChar, req.body.email)
        .input("password", sql.NVarChar, req.body.password)
        .input("first_name", sql.NVarChar, req.body.first_name)
        .input("last_name", sql.NVarChar, req.body.last_name)
        .input("street_address", sql.NVarChar, req.body.street_address)
        .input("barangay", sql.NVarChar, req.body.barangay)
        .input("province", sql.NVarChar, req.body.province)
        .input("city", sql.NVarChar, req.body.city)
        .input("club_name", sql.NVarChar, req.body.club_name)

        .input("club_region", sql.NVarChar, req.body.club_region)
        .input("club_president", sql.NVarChar, req.body.club_president)
        .input("national_president", sql.NVarChar, req.body.national_president)
        .input("date", sql.NVarChar, req.body.date)
        .input("pe_ID", sql.NVarChar, req.body.pe_ID)
        .input("club_secretry_name", sql.NVarChar, req.body.club_secretry_name)
        .input("club_secretry_NO", sql.NVarChar, req.body.club_secretry_NO)

        .query(
          ` 
            INSERT INTO [dbo].[members]
                       ([email]
                        ,[password]
                        ,[first_name] 
                        ,[last_name]
                        ,[street_address]
                        ,[barangay]
                        ,[province]
                        ,[city]
                         ,[club_name]
                          ,[club_region]
                          ,[club_president]
                           ,[national_president]
                            ,[date]
                             ,[pe_ID]
                              ,[club_secretry_name]
                               ,[club_secretry_NO]
                        )
                 VALUES
                       (@email
                        ,@password
                        ,@first_name
                        ,@last_name
                        ,@street_address
                        ,@barangay
                        ,@province
                        ,@city
                         ,@club_name
                          ,@club_region 
                           ,@club_president
                           ,@national_president
                            ,@date
                             ,@pe_ID
                             ,@club_secretry_name
                             ,@club_secretry_NO 
                             
                       )
                    

                       SELECT SCOPE_IDENTITY() AS memberID
                       
                       
            `
        );

      console.log(data);
      return res.send(data);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async getMembersById(req, res, next) {
    try {
      const memberID = req.params.memberID;
      let pool = await sql.connect(config);
      let data = await pool
        .request()
        .query(`select * from members where memberID=${memberID}`);
      console.log(data);
      return res.send(data);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async getMembersAll(req, res, next) {
    try {
      const memberID = req.params.memberID;
      let pool = await sql.connect(config);
      let data = await pool.request().query(`select * from members`);
      console.log(data);
      return res.send(data);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async ListOfDropDownCities(req, res, next) {
    try {
      const memberID = req.params.memberID;
      let pool = await sql.connect(config);
      let data = await pool.request().query(`select Citiyname from tblCities`);
      console.log(data);
      return res.json(data);
    } catch (e) {
      console.log(e);
      return res.status(500).json(e);
    }
  },
  async ListOfDropDownProvince(req, res, next) {
    try {
      const memberID = req.params.memberID;
      let pool = await sql.connect(config);
      let data = await pool
        .request()
        .query(`select provincename from tbl_province`);
      console.log(data);
      return res.json(data);
    } catch (e) {
      console.log(e);
      return res.status(500).json(e);
    }
  },
  //
  ////
};
export default FATSDB;
