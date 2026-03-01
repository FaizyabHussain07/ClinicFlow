const fs = require('fs');
const path = require('path');

const dashboards = {
    'patient-dashboard.html': `
            <div class="form-group mt-16" style="margin-top:16px;">
                <label>Age</label>
                <input type="number" id="prof-edit-age" class="form-control" placeholder="Years">
            </div>
            <div class="form-group mt-16" style="margin-top:16px;">
                <label>Gender</label>
                <select id="prof-edit-gender" class="form-control">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>`,
    'doctor-dashboard.html': `
            <div class="form-group mt-16" style="margin-top:16px;">
                <label>Specialization</label>
                <input type="text" id="prof-edit-specialization" class="form-control" placeholder="e.g. Cardiologist">
            </div>
            <div class="form-group mt-16" style="margin-top:16px;">
                <label>Qualification</label>
                <input type="text" id="prof-edit-qualification" class="form-control" placeholder="e.g. MBBS, MD">
            </div>
            <div class="form-group mt-16" style="margin-top:16px;">
                <label>Experience (Years)</label>
                <input type="number" id="prof-edit-experience" class="form-control" placeholder="e.g. 5">
            </div>`,
    'receptionist-dashboard.html': `
            <div class="form-group mt-16" style="margin-top:16px;">
                <label>Shift Timing</label>
                <input type="text" id="prof-edit-shift" class="form-control" placeholder="e.g. Morning (9AM - 5PM)">
            </div>`,
    'admin-dashboard.html': `` // No extra fields required for admin right now
};

for (const [file, htmlToAdd] of Object.entries(dashboards)) {
    const fPath = path.join(__dirname, 'pages', file);
    if (!fs.existsSync(fPath)) continue;

    let txt = fs.readFileSync(fPath, 'utf8');

    // Add extra HTML to form if not present
    if (htmlToAdd && !txt.includes(htmlToAdd.trim().split('\n')[0])) {
        txt = txt.replace('Save Profile Details', 'Save Profile Details').replace('Save Profile Details\\n            </button>', htmlToAdd + '\n            <button class="btn btn-primary mt-24" style="margin-top:24px;" id="btn-update-profile" onclick="handleUpdateProfile()">\n                Save Profile Details\n            </button>');
        txt = txt.replace(/<button class="btn btn-primary mt-24" style="margin-top:24px;" id="btn-update-profile" onclick="handleUpdateProfile\(\)">\s*Save Profile Details\s*<\/button>/g, htmlToAdd + '\n            <button class="btn btn-primary mt-24" style="margin-top:24px;" id="btn-update-profile" onclick="handleUpdateProfile()">\n                Save Profile Details\n            </button>');
    }

    // Add saving logic to injected JS
    // First, let's extract the fields inside `handleUpdateProfile`
    // We add new variables based on the file
    let extraVars = '';
    let extraVals = '';
    if (file === 'patient-dashboard.html') {
        extraVars = `
            const age = document.getElementById('prof-edit-age') ? document.getElementById('prof-edit-age').value.trim() : null;
            const gender = document.getElementById('prof-edit-gender') ? document.getElementById('prof-edit-gender').value.trim() : null;`;
        extraVals = `, age, gender`;
    } else if (file === 'doctor-dashboard.html') {
        extraVars = `
            const specialization = document.getElementById('prof-edit-specialization') ? document.getElementById('prof-edit-specialization').value.trim() : null;
            const qualification = document.getElementById('prof-edit-qualification') ? document.getElementById('prof-edit-qualification').value.trim() : null;
            const experience = document.getElementById('prof-edit-experience') ? document.getElementById('prof-edit-experience').value.trim() : null;`;
        extraVals = `, specialization, qualification, experience`;
    } else if (file === 'receptionist-dashboard.html') {
        extraVars = `
            const shift = document.getElementById('prof-edit-shift') ? document.getElementById('prof-edit-shift').value.trim() : null;`;
        extraVals = `, shift`;
    }

    if (extraVars && !txt.includes('const age = document.getElementById(\'prof-edit-age\')') && !txt.includes('const specialization')) {
        txt = txt.replace('const address = document.getElementById(\'prof-edit-address\').value.trim();',
            `const address = document.getElementById('prof-edit-address').value.trim();${extraVars}`);

        txt = txt.replace('{ name, avatarUrl, phone, address }', `{ name, avatarUrl, phone, address${extraVals} }`);

        // Populate profile fields 
        let populateLogic = '';
        if (file === 'patient-dashboard.html') populateLogic = `if(document.getElementById('prof-edit-age')) document.getElementById('prof-edit-age').value = p.age || ''; if(document.getElementById('prof-edit-gender')) document.getElementById('prof-edit-gender').value = p.gender || '';`;
        else if (file === 'doctor-dashboard.html') populateLogic = `if(document.getElementById('prof-edit-specialization')) document.getElementById('prof-edit-specialization').value = p.specialization || ''; if(document.getElementById('prof-edit-qualification')) document.getElementById('prof-edit-qualification').value = p.qualification || ''; if(document.getElementById('prof-edit-experience')) document.getElementById('prof-edit-experience').value = p.experience || '';`;
        else if (file === 'receptionist-dashboard.html') populateLogic = `if(document.getElementById('prof-edit-shift')) document.getElementById('prof-edit-shift').value = p.shift || '';`;

        txt = txt.replace('if (document.getElementById(\'prof-edit-address\')) document.getElementById(\'prof-edit-address\').value = p.address || \'\';',
            `if (document.getElementById('prof-edit-address')) document.getElementById('prof-edit-address').value = p.address || '';\n             ${populateLogic}`);
    }

    fs.writeFileSync(fPath, txt, 'utf8');
    console.log("Updated fields for", file);
}

// Ensure responsiveness in main.css
const cssPath = path.join(__dirname, 'assets', 'css', 'main.css');
if (fs.existsSync(cssPath)) {
    let cssText = fs.readFileSync(cssPath, 'utf8');
    if (!cssText.includes('.app-layout { flex-direction: column; }')) {
        cssText += `
@media (max-width: 1024px) {
    .app-layout { flex-direction: column; }
    .sidebar { position: fixed !important; transform: translateX(-100%); z-index: 1000; box-shadow: 10px 0 30px rgba(0,0,0,0.1); transition: transform .3s ease; height: 100vh; width: 260px; }
    .sidebar.open { transform: translateX(0); }
    .main-content { margin-left: 0 !important; width: 100%; min-width: 0; }
    .topbar { width: 100%; padding: 0 16px; position: sticky; top: 0; z-index: 50; }
    .hamburger { display: flex !important; }
    .content-area { padding: 16px; }
    .features-grid { grid-template-columns: 1fr; }
    table.data-table { display: block; overflow-x: auto; white-space: nowrap; }
}

@media (max-width: 600px) {
    .stats-grid { grid-template-columns: 1fr; }
    .profile-view { flex-direction: column; }
    .card-body { padding: 16px; }
    .topbar-title { font-size: 16px; }
}
`;
        fs.writeFileSync(cssPath, cssText, 'utf8');
        console.log("Updated main.css for full responsiveness.");
    }
}
