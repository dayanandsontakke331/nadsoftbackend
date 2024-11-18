const db = require('../config/db');

const createMemberStudentTable = async () => {
    const dbQuery =
    
    // `DROP TABLE IF EXISTS students;`
    
    `
        CREATE TABLE IF NOT EXISTS students (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            age INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
    `;

    try {
        await db.query(dbQuery);
        console.log("User table created if not exists");
    } catch (error) {
        console.log("Error creating users table: ", error);
    }
};

const createMarksTable = async () => {
    const dbQuery =
    
    // `DROP TABLE IF EXISTS marks;`
    
    `
        CREATE TABLE IF NOT EXISTS marks (
            id SERIAL PRIMARY KEY,
            student_id INTEGER NOT NULL,
            mark INTEGER,
            created_at TIMESTAMP DEFAULT NOW(),
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        );
    `;

    try {
        await db.query(dbQuery);
        console.log("Marks table created if not exists");
    } catch (error) {
        console.log("Error creating marks table: ", error);
    }
};

module.exports = { createMemberStudentTable, createMarksTable };
