const axios = require('axios');

// Use the host port mapped from container port 5000
const API_URL = 'http://localhost:5001/api';

async function register(name, email, password, role) {
    const res = await axios.post(`${API_URL}/auth/register`, { name, email, password, role });
    return res.data;
}
async function login(email, password) {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    return res.data;
}
async function createComplaint(token, subject, category, description, priority) {
    const res = await axios.post(`${API_URL}/complaints`,
        { subject, category, description, priority },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
}
async function updateStatus(token, complaintId, status) {
    const res = await axios.put(`${API_URL}/complaints/${complaintId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
}

(async () => {
    console.log('=== Integration tests ===');
    const studentEmail = `student_${Date.now()}@test.com`;
    const student = await register('Test Student', studentEmail, 'test123', 'student');
    console.log('✅ Student registered');
    const studentLogin = await login(studentEmail, 'test123');
    console.log('✅ Student logged in');
    const complaint = await createComplaint(studentLogin.token, 'CI test complaint', 'faculty', 'Automated test', 'medium');
    const complaintId = complaint._id;
    console.log(`✅ Complaint created (ID: ${complaintId})`);
    const adminEmail = `admin_${Date.now()}@test.com`;
    const admin = await register('Test Admin', adminEmail, 'admin123', 'admin');
    console.log('✅ Admin registered');
    const adminLogin = await login(adminEmail, 'admin123');
    console.log('✅ Admin logged in');
    const updated = await updateStatus(adminLogin.token, complaintId, 'resolved');
    if (updated.status !== 'resolved') throw new Error('Status update failed');
    console.log('✅ Complaint status updated to resolved');
    console.log('🎉 All tests passed');
})();