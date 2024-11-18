const express = require('express');
const cors = require('cors')
const pool = require('./config/db');
const MemberStudentRoutes = require('./routes/MemberStudentRoutes');
const { createMemberStudentTable, createMarksTable } = require('./data/createMemberStudentTable');
const PORT = 8080;

const app = express();
app.use(express.json());
app.use(cors());

(async () => {
    try {
        // create tables if not exists
        await createMemberStudentTable();
        await createMarksTable();
    } catch (err) {
        console.log("Error creating tables:", err);
    }
})();

app.get('/', (req, res) => {
    const userAgent = req.get('User-Agent');
    res.json({ message: `${userAgent}` });
});

app.use('/member', MemberStudentRoutes);

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});