const { requestDataValidate } = require("../util").Validator
const { AppError , CommonError } = require("../util")
const { executeAsync } = require("../util/mysql").Client
const { eq } = require("../util").Hash
const { sign } = require("jsonwebtoken")
const { v1 } = require("uuid")

const AUTH_ERRORS={
    USER_NOT_FOUND:{
        code:"USER_NOT_FOUND",
        message:"No User With This Email"
    },
    PASSWORD_NOT_VALID:{
        code:"PASSWORD_NOT_VALID",
        message:"Passwords not Equal"
    }
}

module.exports={
    async login(req,res,next){
        if(requestDataValidate(req.body,[
            {
                key:"email",
                type:"string"
            },
            {
                key:"password",
                type:"string"
            }
        ])){
            try {
                let user = await executeAsync(
                    `SELECT email,password,role,id,status FROM user WHERE email='${req.body.email}' AND is_active=TRUE AND status=1`
                )
                console.log(req.body.email);
                if(user.length > 0){
                    user = user[0]
                    if(eq(user.password,req.body.password)){
                        let token = sign({
                            id: v1(),
                            role: user.role,
                            status: user.status,
                            userId: user.id
                        },process.env.JWT_SECRET,{subject:"Auth"})
                        res.send({
                            token
                        })
                    }else next(new AppError(AUTH_ERRORS.PASSWORD_NOT_VALID,"Password Not Valid",400))
                }else{
                    next(new AppError(AUTH_ERRORS.USER_NOT_FOUND, "User not found",404))
                }
            } catch (error) {
                next(new AppError(CommonError.DATABASE_ERROR,error,500));
            }
        }else next(new AppError(CommonError.INVALID_REQUEST , "Invalid request body",400))
    },

    async getMe(req,res,next){
        try {
            let user = await executeAsync(`SELECT first_name AS firstName , last_name AS lastName FROM user WHERE id='${req.userId}'`)
            if(user.length === 1){
                res.send(user[0])
            }else next(new AppError(AUTH_ERRORS.USER_NOT_FOUND, "User not found",401))
        } catch (error) {
            // console.log(error);
            next(new AppError(CommonError.INTERNAL_SERVER_ERROR , error,500))
        }
    }
}