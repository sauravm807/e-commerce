"use strict;"
const createError = require('http-errors');
// helper functions imports
const { uploadPic, removePic } = require("../../services/helper/uploadPic.service");

const dbOperation = require("../../connection/sql.connection");

class UserController {
    /**
    * getUserData - to get currently logged in user data
    * @param {*} req 
    * @param {*} res 
    * @param {*} next 
    * @author Saurav Vishal <sauravvishal@globussoft.in>
    */
    async getUserData(req, res, next) {
        try {
            if (!req.user) throw createError.NotFound("Access token required");

            const { id, email, fullName, firstName, lastName } = req.user;

            const query = `SELECT address, pro_pic, phone_no FROM usermeta WHERE user_id = ${id};`;

            const [userData] = await dbOperation.select(query);

            res.status(200).json({
                status: 200,
                message: "User data fetched successfully",
                data: {
                    id,
                    email,
                    fullName,
                    firstName,
                    lastName,
                    address: userData?.address || null,
                    phoneNo: userData?.phone_no || null,
                    proPic: userData?.pro_pic || null
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
    * uploadProfilePic - to upload profile pic
    * @param {*} req 
    * @param {*} res 
    * @param {*} next 
    * @author Saurav Vishal <sauravvishal@globussoft.in>
    */
    async uploadProfilePic(req, res, next) {
        try {
            const { id } = req.user;
            let { base64, type } = req.body;
            if (!base64 || !type) throw createError.BadRequest("Image data is required.");

            const isUploadImagePath = await uploadPic({ base64, type, id });
            if (!isUploadImagePath) throw createError.BadRequest("Something went wrong");

            let query = `SELECT pro_pic FROM usermeta WHERE id = ${id};`;
            const [picData] = await dbOperation.select(query);

            query = `UPDATE usermeta SET pro_pic = "${isUploadImagePath}" WHERE id = ${id};`;

            const updateData = await dbOperation.update(query);
            if (updateData[1] > 0) {
                if (picData?.proPic) await removePic(picData.proPic);
                return res.status(201).json({
                    status: 201,
                    message: "Image uploaded successfully",
                    imagePath: isUploadImagePath
                });
            }
            throw createError.BadRequest("Profile pic not updated.");
        } catch (error) {
            next(error);
        }
    }

    /**
    * searchUser - search users by name, email or email
    * @param {*} req 
    * @param {*} res 
    * @param {*} next 
    * @author Saurav Vishal <sauravvishal@globussoft.in>
    */
    async searchUser(req, res, next) {
        try {
            const { id } = req.user;
            let { searchText } = req.body;
            searchText = searchText?.trim();
            if (!searchText) throw createError.NotFound("Search Item is required.");

            const query = `SELECT u.id as userId, um.full_name AS fullName, um.pro_pic AS proPic, um.last_login as lastLogin, u.email 
                    FROM users u INNER JOIN usermeta um ON u.id = um.user_id WHERE (um.full_name LIKE "%${searchText}%" OR um.phone_no LIKE "%${searchText}%") 
                    AND u.id <> ${id} ORDER BY u.email;`;
            const searchedData = await dbOperation.select(query);

            if (!searchedData.length) throw createError.NotFound("No user found.");

            res.status(200).json({
                status: 200,
                message: "Users found successfully",
                data: searchedData
            })
        } catch (error) {
            next(error);
        }
    }

    async getUsers(req, res, next) {
        try {
            const { id } = req.user;

            let query = `SELECT u.id, um.full_name as fullName, um.pro_pic as proPic, um.last_login as lastLogin FROM users u INNER JOIN usermeta um
                    on u.id = um.user_id WHERE u.id <> ${id} LIMIT 10;`;
            const data = await dbOperation.select(query);

            if (!data.length) throw createError.NotFound("No users found.");

            res.status(200).json({
                status: 200,
                message: "Users found successfully.",
                data: data
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController;