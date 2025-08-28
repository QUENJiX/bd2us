# Development Guide

## Getting Started

1. Clone the repository
2. Open `index.html` in your browser for local development
3. Make changes to HTML, CSS, or JS files
4. Test changes locally before pushing

## File Organization Rules

### HTML Files
- Main pages in root directory
- Chapter content in `chapters/` folder
- Use semantic HTML5 elements
- Include proper meta tags for SEO

### CSS Files
- Main styles in `css/style.css`
- UX enhancements in `css/enhanced-ux.css`
- Specific fixes in separate files (e.g., `css/heading-fix.css`)

### JavaScript Files
- Core functionality in `js/script.js`
- Enhanced features in `js/enhanced-ux.js`
- Use vanilla JavaScript (no frameworks)

### Assets
- Images in `assets/images/` with appropriate subfolders
- Use descriptive file names
- Optimize images for web (compress, proper formats)

## Coding Standards

### CSS
- Use CSS custom properties (variables) defined in `:root`
- Follow BEM methodology for class names
- Maintain consistent indentation (2 spaces)
- Group related styles together

### JavaScript
- Use modern ES6+ features
- Add event listeners after DOM is loaded
- Include error handling and guard clauses
- Comment complex logic

### HTML
- Use proper semantic elements
- Include ARIA labels for accessibility
- Maintain consistent indentation
- Optimize for performance (preconnect, etc.)

## Testing Checklist

- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test responsive design on mobile devices
- [ ] Validate HTML with W3C validator
- [ ] Check accessibility with screen reader
- [ ] Test dark/light theme toggle
- [ ] Verify all links work
- [ ] Check loading performance

## Deployment

Changes to the `main` branch automatically trigger GitHub Pages deployment.

1. Test locally
2. Commit changes with descriptive messages
3. Push to main branch
4. Verify deployment at https://quenjix.github.io/bd2us/
