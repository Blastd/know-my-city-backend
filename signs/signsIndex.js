var sanitize = require("sanitize-filename");
function getSign(name){
    var filePath = "./" + (sanitize(name)) + ".json"
    try{
        return require(filePath);
    }catch{
        return {error: "Sign not found"};
    }
}

module.exports = getSign;