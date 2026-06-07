const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove JavaScript for switchView
html = html.replace(/<script>[\s\S]*?function switchView[\s\S]*?<\/script>/, '');

// 2. Change buttons to anchors
html = html.replace(/<button class="action-btn-small" onclick="switchView\('view-services'\)">/g, '<a href="#view-services" class="action-btn-small">');
html = html.replace(/<button class="action-btn-small" onclick="switchView\('view-about'\)">/g, '<a href="#view-about" class="action-btn-small">');
html = html.replace(/<button class="action-btn-small" onclick="switchView\('view-banks'\)">/g, '<a href="#view-banks" class="action-btn-small">');
// Change closing tags for those specific buttons
html = html.replace(/(<a href="#view-services"[^>]*>\s*Our Services\s*)<\/button>/g, '$1</a>');
html = html.replace(/(<a href="#view-about"[^>]*>\s*About Us\s*)<\/button>/g, '$1</a>');
html = html.replace(/(<a href="#view-banks"[^>]*>\s*Bank Partners\s*)<\/button>/g, '$1</a>');

// 3. Remove "Back to Card" buttons
html = html.replace(/<button class="back-btn" onclick="switchView\('view-front'\)">[\s\S]*?<\/button>/g, '');

// 4. Change body styles to align nicely and scroll
html = html.replace(/body \{([\s\S]*?)\}/, `body {$1
            flex-direction: column;
            justify-content: flex-start;
            gap: 20px;
            scroll-behavior: smooth;
        }`.replace('justify-content: center;', '/*justify-content: center;*/'));

// 5. Extract internal views and place them OUTSIDE .card
// We'll find the closing div of .view-container and .card, then append the extracted views.

const servicesMatch = html.match(/<!-- =========================================\s*SERVICES VIEW[\s\S]*?<!-- =========================================\s*ABOUT VIEW/);
const aboutMatch = html.match(/<!-- =========================================\s*ABOUT VIEW[\s\S]*?<!-- =========================================\s*BANK PARTNERS VIEW/);
const banksMatch = html.match(/<!-- =========================================\s*BANK PARTNERS VIEW[\s\S]*?(?=\s*<\/div>\s*<\/div>\s*<\/div>)/);

if (servicesMatch && aboutMatch && banksMatch) {
    let services = servicesMatch[0].replace('<!-- =========================================\n                     ABOUT VIEW', '').trim();
    let about = aboutMatch[0].replace('<!-- =========================================\n                     BANK PARTNERS VIEW', '').trim();
    let banks = banksMatch[0].trim();

    // Change .view to .content-section so it's not absolutely positioned
    services = services.replace(/class="view expanded-view"/g, 'class="content-section"');
    about = about.replace(/class="view expanded-view"/g, 'class="content-section"');
    banks = banks.replace(/class="view expanded-view"/g, 'class="content-section"');

    // Remove them from original location
    html = html.replace(servicesMatch[0], '<!-- =========================================\n                     ABOUT VIEW');
    html = html.replace(aboutMatch[0], '<!-- =========================================\n                     BANK PARTNERS VIEW');
    html = html.replace(banksMatch[0], '');

    // Now insert them below .card
    const insertPoint = '        </div>\n    </div>'; // end of .card and .card-wrapper
    const insertion = `\n    <!-- Content Sections -->\n    <div class="card-wrapper additional-content">\n        ${services}\n        ${about}\n        ${banks}\n    </div>\n`;
    html = html.replace(insertPoint, insertPoint + insertion);
}

// 6. Clean up CSS that hides views
// Find .view.expanded-view styles and change to .content-section
html = html.replace(/\.view\.expanded-view/g, '.content-section');
html = html.replace(/\.expanded-view::-webkit-scrollbar/g, '/* removed scrollbar */');

// Remove .view absolute positioning and opacity logic
html = html.replace(/\.view \{[\s\S]*?\}/, `
        .view {
            /* Now just a static container for front view */
            display: flex;
            width: 100%;
            height: 100%;
        }
`);
html = html.replace(/\.view\.active \{[\s\S]*?\}/, '');

// Give .content-section appropriate styling
html = html.replace(/\.content-section \{[\s\S]*?\}/, `
        .content-section {
            display: flex;
            flex-direction: column;
            padding: 20px;
            background: var(--bg-white);
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05);
            margin-bottom: 20px;
        }
`);

// Also fix action buttons links to remove button default styles (if they were buttons)
html = html.replace(/\.action-btn-small \{/g, '.action-btn-small {\n            text-decoration: none;\n            display: inline-flex;\n            align-items: center;\n            justify-content: center;');

// Make html smooth scroll
html = html.replace(/html \{/, 'html {\n            scroll-behavior: smooth;');
if (!html.includes('scroll-behavior: smooth;')) {
    html = html.replace(/<style>/, '<style>\n        html {\n            scroll-behavior: smooth;\n        }');
}

fs.writeFileSync('index.html', html);
console.log('Refactor complete');
