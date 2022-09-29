"use strict";

module.exports = {
    getColumnValues: function (obj) {
        let values = "";
        let columns = "";
        const map = new Map(Object.entries(obj));
        for (let [key, val] of map) {
            if (columns.length) {
                columns += `, ${key} `;
                values += `, ${val.length ? '"' + val + '"' : null}`;
            } else {
                columns += `(${key}`;
                values += `(${val.length ? '"' + val + '"' : null}`;
            }
        }
        columns += ")";
        values += ")";
        return { columns, values };
    }
};