
const db = require('../config/db');

exports.getStudentMembers = async (req, res) => {
    let { start, limit } = req.body;

    try {
        start = parseInt(start) || 0;
        limit = parseInt(limit) || 10;

        let result = await db.query(`
            SELECT 
                s.id, 
                s.name, 
                s.email, 
                s.age, 
                s.created_at, 
                m.mark
            FROM students s
            LEFT JOIN marks m ON s.id = m.student_id
            ORDER BY s.id ASC  -- Ascending order by id
            LIMIT $1 OFFSET $2`, [limit, start]);

        const studentMembers = result.rows;

        let totalRecordsResult = await db.query(`SELECT COUNT(*) FROM students`);
        const total = totalRecordsResult.rows.length > 0 ? parseInt(totalRecordsResult.rows[0].count) : 0;

        let response = {
            data: studentMembers,
            recordsFiltered: studentMembers.length,
            totalRecords: total,
        };

        return res.json(response);
    } catch (err) {
        console.log(err);
        return res.json({ error: err.message });
    }
};

exports.addMemberStudent = async (req, res) => {
    try {
        const { name, email, age, mark } = req.body;
        console.log("reqbody", req.body);

        if (!name || name.trim() === '') {
            return res.json({ error: "Name is required and cannot be empty." });
        }

        if (!email || email.trim() === '') {
            return res.json({ error: "Email is required and cannot be empty." });
        }

        if (age < 18) {
            return res.json({ error: "Age must be 18 or older." });
        }

        const emailCheck = await db.query(`SELECT id FROM students WHERE email = $1`, [email]);

        if (emailCheck.rows.length > 0) {
            return res.json({ error: "Email is already registered" });
        }

        const addMember = await db.query(
            `INSERT INTO students (name, email, age, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, name, email, age, created_at`,
            [name, email, age]
        );

        const student_id = addMember.rows[0].id;

        const addMark = await db.query(`INSERT INTO marks (student_id, mark, created_at) VALUES ($1, $2, NOW()) RETURNING *`, [student_id, mark]);
        let response = {
            message: "User and mark created successfully",
            student: addMember.rows[0],
            mark: addMark.rows[0]
        }

        return res.json(response);

    } catch (err) {
        console.log(err);
        return res.json({ message: "Error creating member student", error: err.message });
    }
};

exports.getStudentMember = async (req, res) => {
    const { id, mark } = req.body;

    try {
        if (!id) {
            return res.json({ message: "Student/Member ID is required" });
        }

        let query = "SELECT students.id, students.name, students.email, students.age, marks.mark FROM students LEFT JOIN marks ON students.id = marks.student_id WHERE students.id = $1";

        const queryParams = [id];

        if (mark !== undefined) {
            query += ` AND marks.mark = $2`;
            queryParams.push(mark);
        }

        const memberStudent = await db.query(query, queryParams);

        if (memberStudent.rows.length === 0) {
            return res.json({ message: "No student found with the provided criteria" });
        }

        let response = { data: memberStudent.rows[0], message: "Student retrieved successfully" }
        return res.json(response);
    } catch (err) {
        console.error(err);
        return res.json({ message: "Error retrieving student", error: err.message });
    }
};


exports.updateStudentMember = async (req, res) => {
    const { id } = req.body;

    try {
        if (!id) {
            return res.json({ message: "Student ID is required for updating" });
        }

        // let queryEmail = `SELECT * FROM students where email = $1`
        // let emailCheck = await db.query(queryEmail, [req.body.email]);

        // if (emailCheck.rows.length > 0) {
        //     return res.json({ error: "Email is already registered" });
        // }

        const updatedFields = [];
        const values = [];
        let studentQuery = `UPDATE students SET `;
        const fields = ['name', 'email', 'age'];

        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];

            if (req.body[field] !== undefined) {
                updatedFields.push(`${field} = $${updatedFields.length + 1}`);
                values.push(req.body[field]);
            }
        }

        if (updatedFields.length > 0) {
            studentQuery += updatedFields.join(", ") + ` WHERE id = $${updatedFields.length + 1}`;
            values.push(id);
        }

        const studentResult = updatedFields.length > 0 ? await db.query(studentQuery, values) : null;

        if (req.body.mark !== undefined) {
            const markQuery = "INSERT INTO marks (student_id, mark, created_at) VALUES ($1, $2, NOW()) ON CONFLICT (student_id) DO UPDATE SET mark = $2, created_at = NOW();";
            await db.query(markQuery, [id, req.body.mark]);
        }

        if (studentResult && studentResult.rowCount === 0) {
            return res.status(404).json({ message: "Student not found or no changes made" });
        }

        return res.json({ message: "Member/Student information updated successfully" });
    } catch (err) {
        console.log(err);
        return res.json({ message: "Error updating Member/Student information", error: err.message });
    }
};

exports.deleteStudentMember = async (req, res) => {
    const { id } = req.body;

    try {
        if (!id) {
            return res.json({ message: "Member/Student ID is required for deletion" });
        }

        await db.query('DELETE FROM marks WHERE student_id = $1', [id]);

        const result = await db.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.json({ message: "Student not found" });
        }

        return res.json({ message: "Student record and associated marks deleted successfully" });
    } catch (err) {
        console.log(err);
        return res.json({ message: "Error deleting Student record", error: err.message });
    }
};