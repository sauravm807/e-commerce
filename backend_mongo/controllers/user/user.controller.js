"use strict;"
// helper functions imports
const { uploadPic } = require("../../services/helper/uploadPic.service");

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
            if (!req.user) createError.NotFound("Access token required");
            const { id, email, fullName, firstName, lastName, address, phoneNo } = req.user;
            res.status(200).json({
                status: 200,
                message: "Login successfull.",
                data: { id, email, fullName, firstName, lastName, address, phoneNo }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
    * getUserData - to upload profile pic
    * @param {*} req 
    * @param {*} res 
    * @param {*} next 
    * @author Saurav Vishal <sauravvishal@globussoft.in>
    */
    async uploadProfilePic(req, res, next) {
        try {
            const { id } = req.user;
            let { base64, type } = req.body;
            if (!base64 || !type) createError.BadRequest("Image data is required.");
            const isUploadImagePath = await uploadPic({ base64, type, id });
            console.log(isUploadImagePath)
            if (!isUploadImagePath) return res.status(400).json({
                status: 400,
                message: "Something went wrong",
            });

            await User.updateOne({ _id: id }, {
                $set: {
                    id: isUploadImagePath
                }
            });
            return res.status(201).json({
                status: 201,
                message: "Image uploaded successfully",
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController;