import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes
import commonRouter from "../src/routes/common.routes.js" 
import applicantRouter from "../src/routes/applicant.routes.js"
import loanOfficerRouter from "../src/routes/loanOfficer.routes.js"

//route declaration
app.use("/api/v1/", commonRouter)
app.use("/api/v1/applicant", applicantRouter)
app.use("/api/v1/loanOfficer", loanOfficerRouter)
export {app}