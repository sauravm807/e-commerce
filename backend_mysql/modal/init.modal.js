const DataTypes = require("sequelize").DataTypes;

const user = require("./user/User.modal");
const uuid = require("./uuids/uuids.Modal");

function initModels(sequelize, Sequelize) {
    const userModal = user(sequelize, Sequelize);
    const uuidModal = uuid(sequelize, Sequelize);

    return { userModal, uuidModal };
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;