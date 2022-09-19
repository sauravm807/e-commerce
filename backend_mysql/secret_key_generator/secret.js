/**
 * keyGenerator - generates random secret key
 * @returns 
 * @author Saurav Vishal <sauravvishal@globussoft.in>
 */
function keyGenerator() {
    return new Promise((resolve, reject) => {
        require('crypto').randomBytes(48, function (err, buffer) {
            let secretKey = buffer.toString('hex');
            resolve(secretKey);
        });
    });
}
module.exports = { keyGenerator } 