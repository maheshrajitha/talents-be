const { requestDataValidate } = require("../util").Validator
const { AppError , CommonError } = require("../util")
const { executeWithDataAsync , executeAsync } = require("../util/mysql").Client
const { v1 } = require("uuid")

const EMPLOYEE_ERROR= {
    EMPLOYEE_EPF_EXISTS:{
        message:"This EPF number is exists",
        code:"EMPLOYEE_EPF_EXISTS"
    },
    NO_EMPLOYEES_FOUND:{
        message:"No Employees Found",
        code:"NO_EMPLOYEES_FOUND"
    },
    NO_EMPLOYEE_WITH_THIS_ID:{
        message:"Invalid Employee Id",
        code:"NO_EMPLOYEE_WITH_THIS_ID"
    }
}

module.exports={

    async create(req,res,next){
        if(requestDataValidate(req.body,[
            {
                key:"firstName",
                type:"string"
            },
            {
                key:"lastName",
                type:"string"
            },
            {
                key:"epf",
                type:"string"
            },
            {
                key:"talents",
                type:"object"
            }
        ])){
            try {
                let employee = {
                    id:v1(),
                    first_name: req.body.firstName,
                    last_name: req.body.lastName,
                    epf_number: req.body.epf
                }
                let talentList = req.body.talents.map(talent=>(
                    [
                        v1(),
                        employee.id,
                        talent.value,
                        talent.efficiency,
                        talent.quality
                    ]
                ))
                await executeWithDataAsync(`INSERT INTO employee SET ?;
                INSERT INTO employee_talent (id,employee_id,talent_id,efficiency,quality) VALUES ?`,[employee , talentList])
                res.send(employee)
            } catch (error) {
                if(typeof error.code == "string" && error.code == "ER_DUP_ENTRY"){
                    next(new AppError(EMPLOYEE_ERROR.EMPLOYEE_EPF_EXISTS,error,400))
                }else next(new AppError(CommonError.INTERNAL_SERVER_ERROR,error,500))
            }
        }else{
            next(new AppError(CommonError.INVALID_REQUEST,"Invalid Request Body",400))
        }
    },

    async getAll(req,res,next){
        let size = req.query.size ? req.query.size : 1000;
        let page = req.query.page ? req.query.page : 1;
        console.log("hello");
        try {
            let employeeList = await executeAsync(
                `SELECT * FROM employee LIMIT ${(page - 1) * size}, ${size}`
            )
            if(employeeList.length > 0){
                res.send(employeeList)
            }else next(new AppError(EMPLOYEE_ERROR.NO_EMPLOYEES_FOUND,"Emplty Employees",404))
        } catch (error) {
            next(new AppError(CommonError.INTERNAL_SERVER_ERROR,error,500))
        }
    },

    async getEmployeeById(req,res,next){
        try {
            let employeeData = await executeAsync(
                `SELECT * FROM employee WHERE id='${req.params.id}';
                SELECT et.*,talent.label FROM employee_talent et JOIN talent ON talent.id=et.talent_id WHERE employee_id='${req.params.id}'
                `
            )
            if(employeeData[0].length > 0){
                res.send({
                    employeeData: employeeData[0],
                    talents: employeeData[1]
                })
            }else next(new AppError(EMPLOYEE_ERROR.NO_EMPLOYEE_WITH_THIS_ID,"Emplty Employees",404))
        } catch (error) {
            console.log(error);
            next(new AppError(CommonError.INTERNAL_SERVER_ERROR,error,500))
        }
    }
}