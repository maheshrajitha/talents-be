const { requestDataValidate } = require("../util").Validator
const { AppError , CommonError } = require("../util")
const { executeWithDataAsync , executeAsync } = require("../util/mysql").Client
const { v1 } = require("uuid")

const TRAINING_ERRORS={
    INVALID_TRAINING_SCHEDULE:{
        message:"Invalid Training Schedule",
        code:"INVALID_TRAINING_SCHEDULE"
    },
    NO_SCHEDULES_FOUND:{
        message:"Empty Schedules",
        code:"NO_SCHEDULES_FOUND"
    }
}

module.exports={
    async create(req,res,next){
        if(requestDataValidate(req.body,[
            {
                key:"date",
                type:"number"
            },
            {
                key:"employee",
                type:"string"
            },
            {
                key:"instructor",
                type:"string"
            },
            {
                key:"skill",
                type:"string"
            }
        ])){
            let schedule = {
                id: v1(),
                emp_id: req.body.employee,
                start_date: req.body.date,
                instructor: req.body.instructor,
                skill_id: req.body.skill
            }
            try {
                await executeWithDataAsync("INSERT INTO training_schedule SET ?",schedule);
                res.send({
                    message:"Training Schedule Created"
                })
            } catch (error) {
                next(new AppError(CommonError.INTERNAL_SERVER_ERROR,error,500))
            }
        }else next(new AppError(TRAINING_ERRORS.INVALID_TRAINING_SCHEDULE,"Invalid Request Body",400))
    },

    async getAll(req,res,next){
        let size = req.query.size ? req.query.size : 1000;
        let page = req.query.page ? req.query.page : 1;
        try {
            let employeeList = await executeAsync(
                `SELECT ts.*,talent.label AS skill,employee.first_name AS firstName , employee.last_name AS lastName,employee.epf_number AS epf FROM 
                training_schedule AS ts JOIN talent ON talent.id=skill_id JOIN employee ON employee.id=emp_id LIMIT ${(page - 1) * size}, ${size}`
            )
            if(employeeList.length > 0){
                res.send(employeeList)
            }else next(new AppError(TRAINING_ERRORS.NO_SCHEDULES_FOUND,"Emplty Employees",404))
        } catch (error) {
            console.log(error);
            next(new AppError(CommonError.INTERNAL_SERVER_ERROR,error,500))
        }
    }
}