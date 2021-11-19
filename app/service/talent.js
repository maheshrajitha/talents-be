const { requestDataValidate } = require("../util").Validator
const { AppError , CommonError } = require("../util")
const { executeWithDataAsync , executeAsync } = require("../util/mysql").Client
const { v1 } = require("uuid")

const TALENT_ERRORS={
    DUPLICATE_TALENT:{
        message:"This talent already exist in our system",
        code:"DUPLICATE_TALENT"
    },
    NO_SAVED_TALENTS:{
        message:"No Talents In Your System",
        code:"NO_SAVED_TALENTS"
    }
}

module.exports={
    async create(req,res,next){
        if(requestDataValidate(req.body,[
            {
                key:"label",
                type:"string"
            },
            {
                key:"stw",
                type:"number"
            }
        ])){
            let talent ={
                id: v1(),
                label: req.body.label.trim(),
                stw: req.body.stw
            }
            try {
                await executeWithDataAsync(`INSERT INTO talent SET ?`,talent);
                res.send(talent)
            } catch (error) {
                if(typeof error.code == "string" && error.code == "ER_DUP_ENTRY"){
                    next(new AppError(TALENT_ERRORS.DUPLICATE_TALENT,error,400))
                }else next(new AppError(CommonError.INTERNAL_SERVER_ERROR,error,500))
            }
        }else{
            next(new AppError(CommonError.INVALID_REQUEST,"Invalid Request Body",400))
        }
    },

    async getAll(req,res,next){
        let size = req.query.size ? req.query.size : 1000;
        let page = req.query.page ? req.query.page : 1;
        try {
            let talentList = await executeAsync(`SELECT id AS value , label , stw FROM talent LIMIT ${(page - 1) * size}, ${size}`)
            if(talentList.length > 0){
                res.send(talentList)
            }else next(new AppError(TALENT_ERRORS.NO_SAVED_TALENTS,"Empty Talents",404))
        } catch (error) {
            next(new AppError(CommonError.INTERNAL_SERVER_ERROR,error,500))
        }
    },

    async getAllWithoutPaging(req,res,next){
        try {
            let talentList = await executeAsync(`SELECT id AS value , label , stw FROM talent`)
            if(talentList.length > 0){
                res.send(talentList)
            }else next(new AppError(TALENT_ERRORS.NO_SAVED_TALENTS,"Empty Talents",404))
        } catch (error) {
            next(new AppError(CommonError.INTERNAL_SERVER_ERROR,error,500))
        }
    }
}