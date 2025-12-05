const fs = require('fs');
const path = require('path');


// Load HTML template
exports.loadTemplate = (templateName, variables) => {
    const templatePath = `./public/templates/basic.html`;
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Replace variables in the template
    return templateContent.replace(/\${(.*?)}/g, (match, variable) => variables[variable]);
  };