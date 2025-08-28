# BD2US Project Structure

## Directory Organization

```
bd2us/
├── assets/                     # Static assets
│   └── images/                 # All images
│       ├── social/             # Social media images (OG, Twitter cards)
│       └── team/              # Team member photos
├── chapters/                   # Chapter content pages
├── css/                       # Stylesheets
├── docs/                      # Documentation files
├── js/                        # JavaScript files
├── .github/                   # GitHub workflows and configs
├── .gitignore                 # Git ignore rules
├── .nojekyll                  # GitHub Pages config
├── 404.html                   # Error page
├── about.html                 # About page
├── favicon.svg                # Site favicon
├── financial-aid.html         # Financial aid guide
├── index.html                 # Homepage
├── LICENSE                    # MIT License
├── README.md                  # Project documentation
├── resources.html             # Resources page
├── roadmap.html              # Interactive roadmap
├── robots.txt                # Search engine directives
└── sitemap.xml               # SEO sitemap
```

## Asset Management

### Images
- **Social**: Place social media assets (og-image.png, favicons) in `assets/images/social/`
- **Team**: Team member photos go in `assets/images/team/`
- **General**: Any other images can go in `assets/images/`

### CSS
- `style.css`: Main stylesheet with theme variables
- `enhanced-ux.css`: Advanced animations and interactions
- `heading-fix.css`: Typography adjustments

### JavaScript
- `script.js`: Core functionality (navigation, scroll effects)
- `enhanced-ux.js`: Advanced UX features

## File Naming Conventions

- Use kebab-case for HTML files: `financial-aid.html`
- Use camelCase for JavaScript: `enhancedUx.js` 
- Use kebab-case for CSS: `enhanced-ux.css`
- Use descriptive names for images: `founder.jpg`, `og-image.png`

## Missing Assets

1. **Social Media Image**: Create `assets/images/social/og-image.png` (1200x630px)
2. **Team Photos**: Replace placeholder images in `assets/images/team/`

## Maintenance

- Keep documentation updated in `docs/`
- Update sitemap.xml when adding new pages
- Maintain consistent file structure
- Run periodic link checks
