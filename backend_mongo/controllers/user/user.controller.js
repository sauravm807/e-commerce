"use strict;"
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
                code: 200,
                data: { id, email, fullName, firstName, lastName, address, phoneNo }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController;