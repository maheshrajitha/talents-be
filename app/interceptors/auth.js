const jwt = require("jsonwebtoken")
const { CommonError } = require("../util")

function authorize(req,res,roles,callback){
    if(typeof req.headers["authorization"] === "string"){
        let token = req.headers["authorization"].split(/(\s+)/)
        if(token.length > 0){
            let decodedToken = jwt.decode(token[2])
            req.userId= decodedToken.userId
        }
        callback(false,undefined)
    }
}


module.exports = (roles=[])=>{
    if(!Array.isArray(roles))
        roles = [roles]
    return [
        (req, res, next) => {
            authorize(req, res, roles, (err, exception) => {
                if (!err || roles.length === 0) next();
                else next(new AppError(CommonError.UNAUTHORIZED, exception, 401));
            });
        }
    ];
}