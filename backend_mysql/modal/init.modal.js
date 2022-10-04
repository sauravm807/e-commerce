const DataTypes = require("sequelize").DataTypes;

const user = require("./user/User.modal");
const userMeta = require("./user/Usermeta.modal");
const wrongPassCount = require("./user/wrongPassCount.modal");
const uuid = require("./uuids/uuids.Modal");

function initModels(sequelize, Sequelize) {
    const userModal = user(sequelize, Sequelize);
    const userMetaModal = userMeta(sequelize, Sequelize);
    const wrongPassCountModal = wrongPassCount(sequelize, Sequelize);
    const uuidModal = uuid(sequelize, Sequelize);

    userModal.hasOne(userMetaModal, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'RESTRICT' });
    userModal.hasOne(wrongPassCountModal, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'RESTRICT' });
    userModal.hasMany(uuidModal, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'RESTRICT' });

    return { userModal, userMetaModal, uuidModal, wrongPassCountModal };
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;