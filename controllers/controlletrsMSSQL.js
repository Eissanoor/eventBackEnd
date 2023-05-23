// using mssql .....................................................................................
import jwt from "jsonwebtoken";
import sql from "mssql";

import config from "../config/dbconfig.js";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//
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
let date = new Date();
let alldate = date.toLocaleString();
console.log(alldate);
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
          `SELECT * FROM members WHERE email='${email}' AND password='${password}'`
        );

      if (result.recordset.length > 0) {
        // fetch roles assign to user on the basis of loginname

        let data = await pool
          .request()
          .input("email", sql.NVarChar, email)
          .query(`select * from members where email=@email`);

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
      const file = req.files["governmentIDImage"];

      const url = `http://gs1ksa.org:3015/api/profile/${file[0].filename}`;
      const iD = req.files["selfieIDImage"][0];

      const url2 = `http://gs1ksa.org:3015/api/profile/${iD.filename}`;
      console.log(url2);
      console.log(url);
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
        .input("date", sql.DateTime, req.body.date)
        .input("pe_ID", sql.NVarChar, req.body.pe_ID)

        .input("club_secretry_name", sql.NVarChar, req.body.club_secretry_name)
        .input("club_secretry_NO", sql.NVarChar, req.body.club_secretry_NO)
        .input("status", sql.NVarChar, "InActive")
        .input("governmentIDImage", sql.NVarChar, url)
        .input("selfieIDImage", sql.NVarChar, url2)
        .input("lattitiude", sql.VarChar, req.body.lattitiude)
        .input("longitude", sql.VarChar, req.body.longitude)
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
                               ,[status]
                                 ,[governmentIDImage]
                                 ,[selfieIDImage]
                                  ,[lattitiude]
                                   ,[longitude]
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
                             ,@status 
                             ,@governmentIDImage 
                             ,@selfieIDImage
                             ,@lattitiude
                             ,@longitude
                       )
                    

                       SELECT SCOPE_IDENTITY() AS memberID
                       
                       
            `
        );
      //
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
  async getMembersEmail_Password(req, res, next) {
    try {
      const { email, password } = req.params;
      let pool = await sql.connect(config);
      const result = await pool
        .request()
        .query(
          `SELECT * FROM members WHERE email='${email}' AND password='${password}'`
        );
      return res.json(result);
    } catch (e) {
      console.log(e);
      return res.status(500).json(e);
    }
  },
  async getEventAll(req, res, next) {
    try {
      const memberID = req.params.memberID;
      let pool = await sql.connect(config);
      let data = await pool.request().query(`select * from events`);
      console.log(data);
      return res.send(data);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },

  async tblPostEvent(req, res, next) {
    try {
      let pool = await sql.connect(config);
      var today = new Date();
      var date = today.toLocaleString();
      let data = await pool
        .request()
        .input("event_name", sql.NVarChar, req.body.event_name)
        .input("event_description", sql.NVarChar, req.body.event_description)
        .input("location", sql.NVarChar, req.body.location)
        .input("location_area", sql.NVarChar, req.body.location_area)
        .input("status", sql.NVarChar, "Pending")
        .input("start_date", sql.NVarChar, req.body.start_date)
        .input("created_at", sql.NVarChar, date)

        .query(
          ` 
            INSERT INTO [dbo].[events]
                       ([event_name] 
                        ,[event_description]
                        ,[location] 
                        ,[location_area]
                        ,[status]
                        ,[start_date]
                         ,[created_at]
                        )
                 VALUES
                       (@event_name
                        ,@event_description
                        ,@location
                        ,@location_area
                        ,@status
                        ,@start_date
                        ,@created_at
                             
                       )
                    

                       SELECT SCOPE_IDENTITY() AS id
                       
                       
            `
        );
      //
      console.log(data);
      return res.send(data);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async tblUpdateEvent(req, res, next) {
    try {
      let pool = await sql.connect(config);
      const id = req.params.id;
      var today = new Date();
      var date = today.toLocaleString();

      let data = await pool
        .request()

        .input("event_name", sql.NVarChar, req.body.event_name)
        .input("event_description", sql.NVarChar, req.body.event_description)
        .input("location", sql.NVarChar, req.body.location)
        .input("location_area", sql.NVarChar, req.body.location_area)

        .input("updated_at", sql.NVarChar, date).query(`

    
   UPDATE [dbo].[events]
SET
[event_name] =@event_name
,[event_description] =@event_description
,[location] =@location
,[location_area] =@location_area
,[updated_at] =@updated_at

 
 



  
  
WHERE id=${id}`);
      console.log(data);
      return res.send(data);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async getEentById(req, res, next) {
    try {
      const id = req.params.id;
      let pool = await sql.connect(config);
      let data = await pool
        .request()
        .query(`select * from events where id=${id}`);
      console.log(data);
      return res.send(data);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async deleteEventById(req, res, next) {
    try {
      let pool = await sql.connect(config);
      const id = req.params.id;
      let data = await pool
        .request()

        .query(`delete from events where id=${id}`);
      console.log(data);
      return res.send(data);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async tblApprovalUser(req, res, next) {
    try {
      let pool = await sql.connect(config);
      const memberID = req.params.memberID;
      var today = new Date();
      var date = today.toLocaleString();

      let data = await pool
        .request()

        .input("status", sql.NVarChar, "Active").query(`

    
   UPDATE [dbo].[members]
SET
[status] =@status

WHERE memberID=${memberID}`);
      console.log(data);
      return res.send(data);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async ListOFAllLocation(req, res, next) {
    try {
      const memberID = req.params.memberID;
      let pool = await sql.connect(config);
      let data = await pool
        .request()
        .query(`SELECT lattitiude,longitude FROM members`);
      console.log(data);
      return res.send(data);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async tblUpdateProfileIMAG(req, res, next) {
    try {
      let pool = await sql.connect(config);
      const memberID = req.params.memberID;

      const file = req.files["selfieIDImage"];

      const url = `http://gs1ksa.org:3015/api/profile/${file[0].filename}`;
      let data = await pool
        .request()

        .input("selfieIDImage", sql.NVarChar, url).query(`

    
   UPDATE [dbo].[members]
SET
[selfieIDImage] =@selfieIDImage


 
 



  
  
WHERE memberID=${memberID}`);
      console.log(data);
      return res.send(data);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async tblUpdateMembers(req, res, next) {
    try {
      let pool = await sql.connect(config);
      const memberID = req.params.memberID;
      var today = new Date();
      var date = today.toLocaleString();

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

        .input("pe_ID", sql.NVarChar, req.body.pe_ID)

        .input("club_secretry_name", sql.NVarChar, req.body.club_secretry_name)
        .input("club_secretry_NO", sql.NVarChar, req.body.club_secretry_NO)
        .query(`

    
   UPDATE [dbo].[members]
SET
[first_name] =@first_name
,[last_name] =@last_name
,[street_address] =@street_address
,[barangay] =@barangay

,[province] =@province
,[city] =@city
,[club_name] =@club_name
,[club_region] =@club_region
,[club_president] =@club_president
,[national_president] =@national_president
,[pe_ID] =@pe_ID

,[club_secretry_name] =@club_secretry_name
,[club_secretry_NO] =@club_secretry_NO


 
 



  
  
WHERE memberID=${memberID}`);
      console.log(data);
      return res.send(data);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  //--------------practice-----------------------
  async listOfSevenDayPateints(req, res, next) {
    try {
      let pool = await sql.connect(config);
      let data = await pool
        .request()
        .query(
          `select * from members where date BETWEEN DATEADD(day, -1, GETDATE()) AND DATEADD(day, -0, GETDATE())`
        );
      if (data.rowsAffected[0] == 0) return res.status(200).json(0);
      let listdata = data.recordsets[0];
      console.log(listdata);
      return res.send(listdata);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  //
  ////
};
export default FATSDB;
