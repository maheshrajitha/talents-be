const { requestDataValidate } = require("../util").Validator
const { AppError , CommonError } = require("../util")
const { executeWithDataAsync , executeAsync } = require("../util/mysql").Client
const { v1 } = require("uuid")

const STYLES_ERRORS={
    INVALID_STYLE:{
        message:"Invalid Style Data",
        code:"INVALID_STYLE"
    }
}

module.exports={

    async create(req,res,next){
        if(requestDataValidate(req.body,[
            {
                key:"styleCode",
                type:"string"
            },
            {
                key:"styleName",
                type:"string"
            },
            {
                key:"qty",
                type:"string"
            },
            {
                key:"skills",
                type:"object"
            }
        ])){
            let style = {
                id: v1(),
                style_code: req.body.styleCode,
                label: req.body.styleName,
                qty: req.body.qty,
                deadline: req.body.deadline
            }
            let skills = req.body.skills.map((skill)=>([
                v1(),
                style.id,
                skill.value
            ]))
            try {
                await executeWithDataAsync(
                    `INSERT INTO styles SET ?;
                    INSERT INTO style_skills (id,style_id,talent_id) VALUES ?
                    `,[style,skills]
                )
                res.send({
                    message:"Style Saved"
                })
            } catch (error) {
                console.log(error);
                next(new AppError(CommonError.INTERNAL_SERVER_ERROR,error,500))
            }
        }else{
            next(new AppError(STYLES_ERRORS.INVALID_STYLE,"Invalid request body",400))
        }
    },

    async getAllStyles(req,res,next){
        let size = req.query.size ? req.query.size : 1000;
        let page = req.query.page ? req.query.page : 1;
        try {
            let employeeList = await executeAsync(
                `SELECT * FROM styles LIMIT ${(page - 1) * size}, ${size}`
            )
            if(employeeList.length > 0){
                res.send(employeeList)
            }else next(new AppError(EMPLOYEE_ERROR.NO_EMPLOYEES_FOUND,"Emplty Employees",404))
        } catch (error) {
            next(new AppError(CommonError.INTERNAL_SERVER_ERROR,error,500))
        }
    },

    async getStyleById(req,res,next){
        try {
            let employeeData = await executeAsync(
                `SELECT * FROM styles WHERE id='${req.params.id}';
                SELECT et.*,talent.label FROM style_skills et JOIN talent ON talent.id=et.talent_id WHERE style_id='${req.params.id}'
                `
            )
            if(employeeData[0].length > 0){
                res.send({
                    employeeData: employeeData[0][0],
                    talents: employeeData[1]
                })
            }else next(new AppError(EMPLOYEE_ERROR.NO_EMPLOYEE_WITH_THIS_ID,"Emplty Employees",404))
        } catch (error) {
            console.log(error);
            next(new AppError(CommonError.INTERNAL_SERVER_ERROR,error,500))
        }
    }
}