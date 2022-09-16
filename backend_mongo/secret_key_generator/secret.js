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

async function generateSecretKey() {
    try {
        const secretKey = await keyGenerator();
        console.log(secretKey);
    } catch (error) {
        console.log(error);
    }
}

module.exports = { generateSecretKey };