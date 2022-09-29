const DataTypes = require("sequelize").DataTypes;

const user = require("./user/User.modal");
const uuid = require("./uuids/uuids.Modal");

function initModels(sequelize) {
    const userModal = user(sequelize, DataTypes);
    const uuidModal = uuid(sequelize, DataTypes);

    return { userModal, uuidModal };
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;