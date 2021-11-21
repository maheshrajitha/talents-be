const crypto = require("crypto")
const ejs = require("ejs")
const path = require("path")
const nodemailer = require("nodemailer")

exports.Hash ={
    hsa256(plainText){
        return crypto.createHash("sha256").update(plainText).digest("hex");
    },
    eq(hashedText,plainText){
        return crypto.createHash("sha256").update(plainText).digest("hex") === hashedText
    }
}

exports.Validator ={
    requestDataValidate(object , keysAndTypes){
        if(Object.keys(object).length >= keysAndTypes.length){
            for(let i = 0 ; i < keysAndTypes.length; i++){
                if(object[keysAndTypes[i].key] === null || typeof object[keysAndTypes[i].key] !== keysAndTypes[i].type )
                    return false
            }
            return true
        }else return false
    }
}

exports.Mailer = {
    async sendEmail(content,subject , toAddress , template){
        let templateData = await ejs.renderFile(`${__dirname}/templates/${template}`,{
            data: content
        })
        let transporter = nodemailer.createTransport({
            host:"smtp.gmail.com",
            service:"gmail",
            auth:{
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        })

        return transporter.sendMail({
            subject: subject,
            from: process.env.EMAIL,
            to: toAddress,
            html: templateData
        })
    }
}

// exports.Error = (error, exception, statusCode) => {
//     Error.captureStackTrace(this, this.constructor);
//     this.error = error || "Application Error";
//     if (process.env.DEBUG == "true")
//         this.exception = exception;
//     this.statusCode = statusCode || 400;
// }

class AppError extends Error {
    constructor(error, exception, statusCode){
        super()
        this.error = error || "Application Error";
        if (process.env.DEBUG == "true")
            this.exception = exception;
        this.statusCode = statusCode || 400;
    }
}

exports.AppError = AppError

exports.CommonError = {
    PAGE_NOT_FOUND: { message: "page not found", code: "PAGE_NOT_FOUND" },

    UNAUTHORIZED: { message: "Unauthorized", code: "UNAUTHORIZED" },

    DATABASE_ERROR: { message: "Database Error", code: "DATABASE_ERROR" },

    FILE_UPLOAD_ERROR: { message: "File Upload Error", code: "FILE_UPLOAD_ERROR" },

    CACHE_ERROR: { message: "Cache Error", code: "CACHE_ERROR" },

    INVALID_REQUEST: { message: "Invalid Request", code: "INVALID_REQUEST" },

    INTERNAL_SERVER_ERROR: { message: "Something Went Wrong, We will fix it soon", code: "INTERNAL_SERVER_ERROR"}
};