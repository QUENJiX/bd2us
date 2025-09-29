// Centralized chapter navigation for BD2US Guide
// Defines chapter order and auto-builds prev/next navigation
(function(){
  const chapters = [
    { slug: 'introduction', titleNav: "Forget the Filter, Let's Get Real" },
    { slug: 'application-timeline', titleNav: 'The Timeline Illusion' },
    { slug: 'college-research', titleNav: 'College Research' },
    { slug: 'application-strategy-ea-ed', titleNav: 'The Application Hunger Games: ED, EA, REA, RD' },
    { slug: 'application-platforms', titleNav: 'The Digital Battlefield: Mastering the Common App & Its Rivals' },
    { slug: 'fee-waivers', titleNav: "Fee Waivers: How to Apply for Free (Because You're Broke)" },
    { slug: 'academics', titleNav: 'Academics: The Biryani of Your Application' },
    { slug: 'standardized-testing', titleNav: 'Standardized Tests: The SAT/ACT Game and the "Test-Optional" Lie' },
    { slug: 'english-proficiency-test', titleNav: 'English Tests: TOEFL, IELTS, and the Duolingo Lifeline' },
    { slug: 'extracurriculars', titleNav: 'Extracurriculars: The "What Else Do You Do?" Test' },
    { slug: 'awards-honors', titleNav: 'Awards & Honors: Your Trophy Shelf' },
    { slug: 'essays', titleNav: 'Chapter 11: Essays' }
  ];
  window.BD2US_CHAPTERS = chapters;

  function buildNav(){
    const container = document.querySelector('section.blog-post-navigation[data-auto-nav] .blog-nav-container');
    if(!container) return; // nothing to do

    const page = window.location.pathname.split('/').pop().replace('.html','');
    const idx = chapters.findIndex(c => c.slug === page);
    if(idx === -1) return;

    const prev = chapters[idx - 1];
    const next = chapters[idx + 1];

    const frag = document.createDocumentFragment();

    if(prev){
      frag.appendChild(createLink(prev, 'prev', 'Previous Chapter'));
    }
    if(next){
      frag.appendChild(createLink(next, 'next', 'Next Chapter'));
    } else {
      // Last chapter: link back to roadmap
      frag.appendChild(createRoadmapLink());
    }

    container.appendChild(frag);
  }

  function createLink(chapter, direction, label){
    const a = document.createElement('a');
    a.href = `${chapter.slug}.html`;
    a.className = `blog-nav-link ${direction}`;
    a.innerHTML = `\n        <i class="fas fa-arrow-${direction === 'prev' ? 'left' : 'right'}"></i>\n        <div>\n            <div class="nav-label">${label}</div>\n            <div class="nav-title">${chapter.titleNav}</div>\n        </div>`;
    return a;
  }

  function createRoadmapLink(){
    const a = document.createElement('a');
    a.href = '../roadmap.html';
    a.className = 'blog-nav-link next';
    a.innerHTML = `\n        <i class="fas fa-arrow-right"></i>\n        <div>\n            <div class="nav-label">Complete Guide</div>\n            <div class="nav-title">Back to Roadmap</div>\n        </div>`;
    return a;
  }

  document.addEventListener('DOMContentLoaded', buildNav);
})();
