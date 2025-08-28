document.addEventListener('DOMContentLoaded', function () {
    const universityGrid = document.getElementById('university-grid');
    const lacGrid = document.getElementById('lac-grid');
    const searchInputUni = document.getElementById('search-input-uni');
    const aidFilterLac = document.getElementById('aid-filter-lac');

    const universities = collegeData.filter(c => c.type === 'University');
    const lacs = collegeData.filter(c => c.type === 'LAC');

    function createCollegeCard(college) {
        const card = document.createElement('div');
        card.className = 'college-card';
        card.dataset.name = college.name.toLowerCase();
        card.dataset.aid = college.aid_policy;

        // Build a robust logo element with multiple fallbacks
        // 1) Primary logo URL from data
        // 2) Fallback to site favicon derived from the aid_link domain
        // 3) Final fallback to a local generic placeholder
        const getDomainFromUrl = (url) => {
            try { return new URL(url).hostname; } catch { return null; }
        };
        const domain = getDomainFromUrl(college.aid_link);
        const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;
        const placeholder = 'assets/images/colleges/placeholder.svg';
        const logoFallbacks = [college.logo, faviconUrl, placeholder].filter(Boolean);

        // Map aid policy to a CSS class for colored badges
        const policyClass = {
            'Need-Blind': 'need-blind',
            'Need-Aware': 'need-aware',
            'Merit-Only': 'merit-only'
        }[college.aid_policy] || 'need-aware';

        const meetsText = college.meets_need ? `Meets ${college.meets_need}` : '';
        card.innerHTML = `
            <button class="card-header">
                <div class="college-identity">
                    <span class="college-rank">${college.rank_display.split(' ')[0]}</span>
                    <img class="college-logo" alt="${college.name} Logo" loading="lazy" decoding="async" referrerpolicy="no-referrer" />
                    <span class="college-name">${college.name}</span>
                    <span class="aid-badge ${policyClass}" title="${college.aid_policy}">${college.aid_policy}</span>
                </div>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="card-details">
                <p class="reality-check"><strong>${college.rank_display}</strong>${college.reality}</p>
                <ul class="details-grid">
                    <li class="detail-row aid-policy"><span class="detail-label"><i class="fa-solid fa-scale-balanced"></i> Aid</span> <span class="detail-value"><span class="badge policy ${policyClass}">${college.aid_policy}</span>${meetsText ? ` <span class="chip meets">${meetsText}</span>` : ''}</span></li>
                    <li class="detail-row aid-app"><span class="detail-label"><i class="fa-solid fa-file-circle-check"></i> Application</span> <span class="detail-value">${college.aid_app}</span></li>
                    <li class="detail-row sat"><span class="detail-label"><i class="fa-solid fa-chart-line"></i> SAT Range</span> <span class="detail-value">${college.sat_range}</span></li>
                    <li class="detail-row english"><span class="detail-label"><i class="fa-solid fa-language"></i> English</span> <span class="detail-value">${college.english_req}</span></li>
                    <li class="detail-row dates"><span class="detail-label"><i class="fa-solid fa-calendar-days"></i> Timeline</span> <span class="detail-value">${college.timeline}</span></li>
                    <li class="detail-row who full"><span class="detail-label"><i class="fa-solid fa-user-check"></i> Who They Want</span> <span class="detail-value">${college.who_they_want}</span></li>
                    <li class="detail-row link"><span class="detail-label"><i class="fa-solid fa-link"></i> Official</span> <span class="detail-value"><a class="btn-link" href="${college.aid_link}" target="_blank" rel="noopener noreferrer">Visit site</a></span></li>
                </ul>
            </div>
        `;

        // Wire up resilient image loading with progressive fallbacks
        const logoEl = card.querySelector('.college-logo');
        if (logoEl) {
            let i = 0;
            const tryNext = () => {
                if (i < logoFallbacks.length) {
                    logoEl.src = logoFallbacks[i++];
                } else {
                    // If all fallbacks fail, hide the element to keep layout tidy
                    logoEl.style.display = 'none';
                }
            };
            logoEl.addEventListener('load', () => logoEl.classList.add('loaded'), { once: true });
            logoEl.addEventListener('error', tryNext, { once: false });
            tryNext();
        }

    const header = card.querySelector('.card-header');
    header.setAttribute('aria-expanded', 'false');
        header.addEventListener('click', () => {
            header.classList.toggle('active');
            const details = header.nextElementSibling;
            if (details.style.maxHeight) {
                details.style.maxHeight = null;
                details.style.padding = "0 1.5rem";
        header.setAttribute('aria-expanded', 'false');
            } else {
                details.style.maxHeight = details.scrollHeight + "px";
                details.style.padding = "1.5rem 1.5rem";
        header.setAttribute('aria-expanded', 'true');
            }
        });

        return card;
    }

    function renderLists() {
        // Clear existing grids
        universityGrid.innerHTML = '';
        lacGrid.innerHTML = '';

        // Get current filter values from both controls
        const uniSearch = searchInputUni ? searchInputUni.value.toLowerCase() : '';
        const lacAid = aidFilterLac ? aidFilterLac.value : 'all';

        // Filter universities (search applies to universities)
        const filteredUniversities = universities.filter(college => {
            const nameMatch = college.name.toLowerCase().includes(uniSearch);
            const aidMatch = lacAid === 'all' || college.aid_policy === lacAid;
            return nameMatch && aidMatch;
        });

        // Filter LACs (both search and aid filter apply to LACs)
        const filteredLACs = lacs.filter(college => {
            const nameMatch = college.name.toLowerCase().includes(uniSearch);
            const aidMatch = lacAid === 'all' || college.aid_policy === lacAid;
            return nameMatch && aidMatch;
        });

        // Render universities or show no results message
        if (filteredUniversities.length > 0) {
            filteredUniversities.forEach(college => {
                universityGrid.appendChild(createCollegeCard(college));
            });
        } else {
            universityGrid.innerHTML = '<p class="no-results">No universities match your criteria.</p>';
        }

        // Render LACs or show no results message
        if (filteredLACs.length > 0) {
            filteredLACs.forEach(college => {
                lacGrid.appendChild(createCollegeCard(college));
            });
        } else {
            lacGrid.innerHTML = '<p class="no-results">No liberal arts colleges match your criteria.</p>';
        }
    }

    function handleFilterChange() {
        renderLists();
    }

    // Add event listeners for the aligned filter controls only
    if (searchInputUni) searchInputUni.addEventListener('input', handleFilterChange);
    if (aidFilterLac) aidFilterLac.addEventListener('change', handleFilterChange);

    // Initial render
    renderLists();
});
