const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('src');

files.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        let content = fs.readFileSync(file, 'utf8');
        let changed = false;

        // If file is in src/pages/*/, depth is 2. (src -> pages -> admin)
        // If file is in src/layouts/, depth is 2. (src -> layouts)
        // If file is in src/components/shared/, depth is 3. (src -> components -> shared)
        // Let's just fix the relative imports manually based on file location.

        const parts = file.replace(/\\/g, '/').split('/');
        // parts: ['src', 'pages', 'admin', 'AdminPanel.tsx']
        
        if (parts.length >= 3) {
            // Need to fix imports from "../something" to "../../something"
            // specifically for api, types, data
            if (parts[1] === 'pages' || parts[1] === 'layouts') {
                if (content.includes('from "../api"')) { content = content.replace(/from "\.\.\/api"/g, 'from "../../api"'); changed = true; }
                if (content.includes('from "../types"')) { content = content.replace(/from "\.\.\/types"/g, 'from "../../types"'); changed = true; }
                if (content.includes('from "../data"')) { content = content.replace(/from "\.\.\/data"/g, 'from "../../data"'); changed = true; }
            } else if (parts[1] === 'components' && parts[2] === 'shared') {
                if (content.includes('from "../api"')) { content = content.replace(/from "\.\.\/api"/g, 'from "../../api"'); changed = true; }
                if (content.includes('from "../types"')) { content = content.replace(/from "\.\.\/types"/g, 'from "../../types"'); changed = true; }
                if (content.includes('from "../data"')) { content = content.replace(/from "\.\.\/data"/g, 'from "../../data"'); changed = true; }
            }
        }

        if (changed) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Fixed imports in ${file}`);
        }
    }
});
