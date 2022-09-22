"use strict";
const fs = require('fs');
const path = require('path');
const util = require('util');

function findExt(type) {
    let ext = 'png';
    switch (type) {
        case 'image/jpeg':
            ext = 'jpeg';
            break;
        case 'image/png':
            ext = 'png';
            break;
        case 'image/gif':
            ext = 'gif';
            break;
    }
    return ext;
}

module.exports = {
    uploadPic: function ({ base64, type, id }) {
        return new Promise(async (resolve, reject) => {
            try {
                base64 = base64.replace(/^data:image\/(.*);base64,/, "");
                const ext = findExt(type);
                const loc = path.join(__dirname + '../../../public/assets/profile_pics/');
                const imageName = id + "-" + Date.now() + "." + ext
                const fileName = loc + imageName;
                const createFile = util.promisify(fs.writeFile);
                await createFile(fileName, base64, 'base64');
                resolve(imageName);
            } catch (error) {
                reject(false);
            }
        });
    },

    removePic: function (imagePath) {
        return new Promise(async (resolve, reject) => {
            try {
                const loc = path.join(__dirname + '../../../public/assets/profile_pics/');
                imagePath = loc + imagePath;
                console.log(imagePath);
                const deleteFile = util.promisify(fs.unlink);
                await deleteFile(imagePath);
                resolve(true);
            } catch (error) {
                resolve(true);
            }
        });
    }
}