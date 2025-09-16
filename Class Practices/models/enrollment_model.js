const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
    courseId : {type:mongoose.Schema.Types.ObjectId,ref:"Course"},
    studentId :{type:mongoose.Schema.Types.ObjectId,ref:"Student"}
});

const EnrollmentModel = mongoose.model("Enrollment",enrollmentSchema);

module.exports = EnrollmentModel;