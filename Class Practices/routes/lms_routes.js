const express = require("express");
const studentModel = require("../models/student_model");
const couseModel = require("../models/course_model");
const EnrollmentModel = require("../models/enrollment_model");

const LMSRouter = express.Router();

LMSRouter.post("/addstudent", async (req, res) => {
  try {
    let student = await studentModel.create(req.body);
    res.status(201).json({ message: "Student Created", student });
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
    console.error(error);
  }
});

// add Cource

LMSRouter.post("/addcouse", async (req, res) => {
  try {
    let course = couseModel.create(req.body);
    res.status(201).json({ message: "Student Added", course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ messgae: "Someting Went Wrong..." });
  }
});

//Many to many Relationships is managed by enrollment
// enrollment is juction schema

LMSRouter.post("/enroll", async (req, res) => {
  try {
    let enrollment = EnrollmentModel.create(req.body);
    res.status(201).json({ message: "Student Enrolled", enrollment });
  } catch (error) {
    console.error(error);
    res.status(501).json({ message: "Someting Went Wrong.." });
  }
});

//Get enrollment

LMSRouter.get("/enroll/:enrollId", async (req, res) => {
  try {
    const { enrollId } = req.params; // extract ID from params
    const enroll = await EnrollmentModel.findById(enrollId)
      .populate("courseId")
      .populate("studentId");

    if (!enroll) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.status(200).json({ message: "Enrollment Details", enroll });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something Went Wrong.." });
  }
});

// Get Student details using cource id

LMSRouter.get("/student/:courceId", async (req,res)=>{
    let {courceId} = req.params;
    try {
        const student = await EnrollmentModel.find({courceId});
        res.status(200).json({messgae:"Student Details",student});
    } catch (error) {
        console.error(error);
        res.status(500).json({msg:"Someting Went Wrong..."})
    }
})

module.exports = LMSRouter;
