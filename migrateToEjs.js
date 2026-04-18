const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'Frontend', 'src');
const depDir = path.join(baseDir, 'department');
const citDir = path.join(baseDir, 'citizen');

const viewsDir = path.join(__dirname, 'Backend', 'views');
const partialsDir = path.join(viewsDir, 'partials');
const depViewsDir = path.join(viewsDir, 'department');
const citViewsDir = path.join(viewsDir, 'citizen');

// Create required directories
[viewsDir, partialsDir, depViewsDir, citViewsDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

function setupPartials() {
    // ---- ADMIN PARTIALS ----
    const adminDashboard = fs.readFileSync(path.join(depDir, 'AdminDashboard.html'), 'utf8');
    
    // Extract <head>
    const headMatch = adminDashboard.match(/<head>([\s\S]*?)<\/head>/);
    let headContent = headMatch ? headMatch[1] : '';
    // Replace hardcoded active link
    fs.writeFileSync(path.join(partialsDir, 'admin-head.ejs'), headContent.trim());

    // Extract <header>
    const headerMatch = adminDashboard.match(/<header class="header">([\s\S]*?)<\/header>/);
    let headerContent = headerMatch ? headerMatch[0] : '';
    fs.writeFileSync(path.join(partialsDir, 'admin-header.ejs'), headerContent.trim());

    // Extract <aside class="sidebar">
    const sidebarMatch = adminDashboard.match(/<aside class="sidebar">([\s\S]*?)<\/aside>/);
    let sidebarContent = sidebarMatch ? sidebarMatch[0] : '';
    // Let's strip the 'active-link' class from all links, we will let JS handle it dynamically as it currently does in main.js
    sidebarContent = sidebarContent.replace(/class="active-link"/g, '');
    fs.writeFileSync(path.join(partialsDir, 'admin-sidebar.ejs'), sidebarContent.trim());

    // Extract footer
    const footerMatch = adminDashboard.match(/<footer class="footer">([\s\S]*?)<\/footer>/);
    let footerContent = footerMatch ? footerMatch[0] : '';
    fs.writeFileSync(path.join(partialsDir, 'footer.ejs'), footerContent.trim());

    // ---- CITIZEN PARTIALS ----
    const citDashboard = fs.readFileSync(path.join(citDir, 'Dashbord.html'), 'utf8');
    
    // Citizen Head
    const citHeadMatch = citDashboard.match(/<head>([\s\S]*?)<\/head>/);
    fs.writeFileSync(path.join(partialsDir, 'citizen-head.ejs'), (citHeadMatch ? citHeadMatch[1] : '').trim());

    // Citizen Header
    const citHeaderMatch = citDashboard.match(/<header class="header">([\s\S]*?)<\/header>/);
    fs.writeFileSync(path.join(partialsDir, 'citizen-header.ejs'), (citHeaderMatch ? citHeaderMatch[0] : '').trim());

    // Citizen Sidebar
    const citSidebarMatch = citDashboard.match(/<aside class="sidebar">([\s\S]*?)<\/aside>/);
    let citSidebarContent = citSidebarMatch ? citSidebarMatch[0] : '';
    citSidebarContent = citSidebarContent.replace(/class="active-link"/g, ''); // just in case
    fs.writeFileSync(path.join(partialsDir, 'citizen-sidebar.ejs'), citSidebarContent.trim());
}

function convertFiles(sourceDir, destDir, type) {
    const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.html') && f !== 'login.html'); // Skip standalone login files mapping as they don't have sidebars

    files.forEach(file => {
        const filePath = path.join(sourceDir, file);
        const originalContent = fs.readFileSync(filePath, 'utf8');

        // Extract <div class="content"> block
        // Note: For 'Raise New Complaint.html', the div class is 'complaint-form' etc.
        // Wait, not all pages have 'div class="content"'. Let's extract everything inside 'main-content' but OUTSIDE the 'aside'
        const mainContentMatch = originalContent.match(/<div class="main-content">([\s\S]*?)<footer/);
        
        if (mainContentMatch) {
            let innerMain = mainContentMatch[1];
            // Remove the sidebar part from the inner content
            innerMain = innerMain.replace(/<aside class="sidebar">[\s\S]*?<\/aside>/, '');

            // Construct new ejs template
            const ejsTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <%- include('../partials/${type}-head') %>
    <% if (locals.pageTitle) { %><title><%= pageTitle %></title><% } %>
    <% if (locals.extraHead) { %><%- extraHead %><% } %>
</head>
<body>
    <%- include('../partials/${type}-header') %>
    <div class="main-content">
        <%- include('../partials/${type}-sidebar') %>
        
        ${innerMain.trim()}
    </div>
    
    <%- include('../partials/footer') %>
</body>
</html>`;
            const destPath = path.join(destDir, file.replace('.html', '.ejs'));
            fs.writeFileSync(destPath, ejsTemplate);
            console.log(`Migrated ${file} -> ${path.basename(destPath)}`);
        } else {
            console.log(`Skipped ${file} - no standard main-content structure found.`);
        }
    });
}

function portLoginFiles() {
    ['department', 'citizen'].forEach(type => {
        const loginPath = path.join(baseDir, type, 'login.html');
        if(fs.existsSync(loginPath)) {
             fs.copyFileSync(loginPath, path.join(viewsDir, type, 'login.ejs'));
             console.log(`Ported ${type} login.html`);
        }
    });

    const indexHtml = path.join(__dirname, 'Frontend', 'index.html');
    if(fs.existsSync(indexHtml)) {
        fs.copyFileSync(indexHtml, path.join(viewsDir, 'index.ejs'));
        console.log('Ported index.html');
    }
}

try {
    setupPartials();
    convertFiles(depDir, depViewsDir, 'admin');
    convertFiles(citDir, citViewsDir, 'citizen');
    portLoginFiles();
    console.log("Migration script complete");
} catch(e) {
    console.error(e);
}
