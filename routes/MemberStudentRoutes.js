const express = require('express');
const MemberStudentController = require('../controllers/MemberStudentController');

const router = express.Router();

router.post('/addMemberStudent', MemberStudentController.addMemberStudent);
router.post('/updateStudentMember', MemberStudentController.updateStudentMember);
router.post('/getMembers', MemberStudentController.getStudentMembers);
router.post('/specificMemberStudent', MemberStudentController.getStudentMember);
router.post('/deleteStudentMember', MemberStudentController.deleteStudentMember);

module.exports = router;
