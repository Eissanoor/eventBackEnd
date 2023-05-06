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
  async tblPostMembers(req, res, next) {
    try {
      let qdate = new Date();

      let pool = await sql.connect(config);

      let data = await pool
        .request()
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
                       ([first_name]
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
                       (@first_name
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
  //
  ////
};
export default FATSDB;
