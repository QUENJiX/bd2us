// Blog Data Structure
const blogPosts = [
    {
        id: 1,
        title: "Will you get into Harvard, MIT or Stanford?",
        excerpt: "Know from an Admission Officer of a Top US College: I've been on the admissions committee of a top ten university for over 20 years. I can tell you with great certainty that there is absolutely no way to say whether you will be admitted to Harvard, MIT, Stanford or any other top school, even if you have perfect credentials.",
        content: "full-content-will-be-in-separate-file",
        author: "Hasibul Islam",
        date: "2024-12-01",
        category: "admissions",
        likes: 45,
        readTime: "8 min read",
        slug: "will-you-get-into-harvard-mit-stanford"
    },
    {
        id: 2,
        title: "What are Your Chances of Getting into Harvard?",
        excerpt: "Lately I'm seeing lots of curious minds asking questions about whether they would be able to apply or get into Harvard, MIT or similar top schools. Here's the selection process of Harvard that was revealed through Asian Admission Lawsuit (2018) with a detailed breakdown of the 4 main factors.",
        content: "full-content-will-be-in-separate-file",
        author: "Hasibul Islam",
        date: "2024-11-28",
        category: "admissions",
        likes: 67,
        readTime: "12 min read",
        slug: "what-are-your-chances-getting-into-harvard"
    },
    {
        id: 3,
        title: "Can You Cover Your Expenses with Full Tuition Scholarship?",
        excerpt: "If you receive full tuition scholarship, will you be able to cover your expenses? Here's what you need to know about the real costs of studying in the US beyond tuition, including housing, food, transportation, and other essential expenses.",
        content: "full-content-will-be-in-separate-file",
        author: "Safwan Bin Rashid",
        date: "2024-11-25",
        category: "financial-aid",
        likes: 89,
        readTime: "6 min read",
        slug: "cover-expenses-full-tuition-scholarship"
    }
    ,{
        id: 4,
        title: "Colleges Offering Full Scholarships & Generous Aid ($0–$5K EFC)",
        excerpt: "Filterable tables of US colleges that are need-blind/full-need or offer full-ride & near full scholarships for low EFC international applicants, plus rankings & testing policies.",
        content: "full-content-will-be-in-separate-file",
        author: "Hasibul Islam",
        date: "2025-09-21",
        category: "financial-aid",
        likes: 0,
        readTime: "14 min read",
        slug: "full-scholarship-colleges-financial-aid-data"
    }
];

// Category mappings for display
const categoryLabels = {
    'admissions': 'Admissions',
    'financial-aid': 'Financial Aid',
    'essays': 'Essays',
    'testing': 'Testing',
    'scholarships': 'Scholarships',
    'deadlines': 'Deadlines',
    'tips': 'Tips & Tricks',
    'news': 'News & Updates'
};

// Category colors for visual distinction
const categoryColors = {
    'admissions': '#00693E',
    'financial-aid': '#8B4513',
    'essays': '#CD853F',
    'testing': '#4682B4',
    'scholarships': '#DAA520',
    'deadlines': '#A0522D',
    'tips': '#228B22',
    'news': '#6A5ACD'
};

// Function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Function to get relative time
function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    }
    if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return months === 1 ? '1 month ago' : `${months} months ago`;
    }
    const years = Math.floor(diffDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
}

// Export for use in blog.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { blogPosts, categoryLabels, categoryColors, formatDate, getRelativeTime };
}
