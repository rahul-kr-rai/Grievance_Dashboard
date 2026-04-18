const fs = require('fs');
const path = require('path');

const dirs = ['Frontend/src/department', 'Frontend/src/citizen'];

dirs.forEach(dir => {
    const files = fs.readdirSync(dir);
    files.filter(f => f.endsWith('.html')).forEach(file => {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace db.js with socket.io
        content = content.replace(/<script src="\/Backend\/db\.js"><\/script>/g, '<script src="/socket.io/socket.io.js"></script>');
        
        // Inject dynamic scripts right before </head>
        if (dir === 'Frontend/src/department') {
            if(!content.includes('dynamicAdmin.js')) {
                content = content.replace('</head>', '    <script src="dynamicAdmin.js"></script>\n</head>');
            }
        } else if (dir === 'Frontend/src/citizen') {
             if(!content.includes('socket.io')) {
                  // If db.js was not there, still ensure socket.io is injected for citizen views
                  content = content.replace('</head>', '    <script src="/socket.io/socket.io.js"></script>\n</head>');
             }
        }
        
        fs.writeFileSync(filePath, content);
        console.log('Updated ' + filePath);
    });
});
