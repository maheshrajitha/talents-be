const express = require("express")
const RootRouter = express.Router()
const { CommonError } = require("./util")
const Auth = require("./interceptors/auth")


const AuthRouter = express.Router()
const AuthService = require("./service/auth")
AuthRouter.post("/login",AuthService.login)
AuthRouter.get("/me",Auth(0),AuthService.getMe)

RootRouter.use("/auth",AuthRouter)

const TalentService = require("./service/talent")
const TalentRouter = express.Router()
TalentRouter.post("/",TalentService.create)
TalentRouter.get("/",TalentService.getAll)
TalentRouter.get("/no-paging",TalentService.getAllWithoutPaging)

RootRouter.use("/talent",TalentRouter)

const EmployeeService = require("./service/employee")
const EmployeeRouter = express.Router()
EmployeeRouter.post("/",EmployeeService.create)
EmployeeRouter.get("/",EmployeeService.getAll)
EmployeeRouter.get("/no-paging",EmployeeService.getAllNoPaging)
EmployeeRouter.get("/:id",EmployeeService.getEmployeeById)

RootRouter.use("/emp",EmployeeRouter)

const StyleRouter = express.Router()
const StyleService = require("./service/styles")
StyleRouter.post("/",StyleService.create)
StyleRouter.get("/",StyleService.getAllStyles)
StyleRouter.get("/:id",StyleService.getStyleById)

RootRouter.use("/styles",StyleRouter)

const TrainingScheduleRouter = express.Router()
const TrainingService = require("./service/training")
TrainingScheduleRouter.post("",TrainingService.create)
TrainingScheduleRouter.get("",TrainingService.getAll)

RootRouter.use("/training",TrainingScheduleRouter)

/** All other */
RootRouter.all('/**', (req, res) => {
    res.status(404).json(CommonError.PAGE_NOT_FOUND)
});// page not found

module.exports = RootRouter;