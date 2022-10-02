"use strict;"
const createError = require('http-errors');
// helper functions imports
const { uploadPic, removePic } = require("../../services/helper/uploadPic.service");

// modals imports
const User = require("../../modal/user/User.modal");
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

            const { address, proPic, phoneNo } = await User.findOne({ _id: id }, {
                proPic: 1, address: 1,
                phoneNo: 1, _id: 0
            });
            res.status(200).json({
                status: 200,
                message: "Login successfull.",
                data: { id, email, fullName, firstName, lastName, address, proPic, phoneNo }
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

            const { proPic } = await User.findOne({ _id: id }, { proPic: 1, _id: 0 });

            await User.updateOne({ _id: id }, {
                $set: {
                    proPic: isUploadImagePath
                }
            });

            if (proPic) await removePic(proPic);

            res.status(201).json({
                status: 201,
                message: "Image uploaded successfully",
                imagePath: isUploadImagePath
            });
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
            const { searchText } = req.body;
            if (!searchText) throw createError.NotFound("Search Item is required.");
            const data = await User.find({
                $or: [
                    { email: { $regex: '.*' + "saurav" + '.*' } },
                    { fullName: { $regex: '.*' + "saurav" + '.*' } },
                    { firstName: { $regex: '.*' + "saurav" + '.*' } },
                    { lastName: { $regex: '.*' + "saurav" + '.*' } },
                    { phoneNo: { $regex: '.*' + "saurav" + '.*' } },
                ]
            });

            db.users.aggregate([
                { $match: { email: { $regex: '.*' + "sau" + '.*' } } }
            ])

            // db.users.aggregate([
            //     {$match: { email: { $regex: '.*' + "sau" + '.*' } }},
            //     {$match: { firstName: { $regex: '.*' + "sau" + '.*' } }},
            //   {$match: { lastName: { $regex: '.*' + "sau" + '.*' } }},
            //    {$match: { fullName: { $regex: '.*' + "sau" + '.*' } }},
            //     {$match: { phoneNo: { $regex: '.*' + "sau" + '.*' } }}
            //  ])

            if (!data.length) throw createError.NotFound("No users found.")

            res.status(200).json({
                status: 200,
                message: "User fetched successfully",
                data: data
            });
        } catch (error) {
            next(error);
        }
    }

    async getUsers(req, res) {
        try {
            const { id } = req.user;
            
            const users = await User.find({ _id: { $ne: id } }).limit(10);
            if (!users.length) throw createError.NotFound("No user found.");
            res.status(200).json({
                status: 200,
                message: "User fetched successfully",
                data: users
            })
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController;