import type { APIRoute } from 'astro';
import { verifyToken } from '../../utils/jwt';
import { validateStudentSession } from '../../utils/auth';

// Helper to decode HTML entities
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#39;/g, "'")
    .replace(/&#x60;/g, "`")
    .replace(/&nbsp;/g, ' ');
}

export const GET: APIRoute = async ({ cookies, url }) => {
  try {
    // 1. Authenticate Request (Check student session or admin session)
    const mhsToken = cookies.get('mhs_access_token');
    const adminToken = cookies.get('admin_access_token');
    
    let isAuthenticated = false;
    if (mhsToken) {
      const studentSession = await validateStudentSession(cookies);
      if (studentSession.isValid) {
        isAuthenticated = true;
      }
    }
    if (!isAuthenticated && adminToken) {
      const payload = await verifyToken(adminToken.value);
      if (payload && (payload.level === 'admin' || payload.level.startsWith('lecturer'))) {
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse Query Params
    const q = url.searchParams.get('q') || '';
    const type = url.searchParams.get('type') || 'All';

    // 3. Construct Search Query
    let queryStr = '';
    if (q.trim()) {
      if (type !== 'All') {
        queryStr = `"${q}" "${type.toLowerCase()}" indonesia 2026`;
      } else {
        queryStr = `"${q}" (internship OR magang OR beasiswa OR scholarship OR lomba OR kompetisi OR sertifikasi) indonesia 2026`;
      }
    } else {
      switch (type) {
        case 'Internship':
          queryStr = 'magang internship mahasiswa indonesia 2026';
          break;
        case 'Scholarship':
          queryStr = 'beasiswa kuliah mahasiswa indonesia 2026';
          break;
        case 'Competition':
          queryStr = 'lomba kompetisi mahasiswa nasional 2026';
          break;
        case 'Certification':
          queryStr = 'sertifikasi kompetensi gratis mahasiswa IT';
          break;
        case 'All':
        default:
          queryStr = 'magang beasiswa lomba kompetisi sertifikasi mahasiswa indonesia 2026';
          break;
      }
    }

    const SERPER_API_KEY = import.meta.env.SERPER_API_KEY;
    let opportunities = [];

    if (SERPER_API_KEY) {
      // 4a. Fetch from Serper.dev (Google Search API)
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: queryStr,
          gl: 'id', // country: indonesia
          hl: 'id', // language: indonesian
          num: 15
        })
      });

      if (response.ok) {
        const data = await response.json();
        const results = data.organic || [];
        
        opportunities = results.map((result: any, i: number) => {
          const title = result.title;
          const snippet = result.snippet || '';
          const link = result.link;

          // Parse and clean company name
          let company = 'External Opportunity';
          let location = 'Indonesia';
          try {
            const urlObj = new URL(link);
            const hostname = urlObj.hostname;
            const parts = hostname.replace('www.', '').split('.');
            company = parts.length >= 2 ? parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1) : parts[0];
            
            if (!hostname.endsWith('.id')) {
              location = 'International / Online';
            }
          } catch (e) {}

          // Deduce category type
          let optType = type !== 'All' ? type : 'Internship';
          const searchText = `${title} ${snippet}`.toLowerCase();
          if (searchText.includes('beasiswa') || searchText.includes('scholarship')) optType = 'Scholarship';
          else if (searchText.includes('lomba') || searchText.includes('kompetisi') || searchText.includes('competition')) optType = 'Competition';
          else if (searchText.includes('sertifikasi') || searchText.includes('certification')) optType = 'Certification';

          return {
            id: `serper-${i}-${Date.now()}`,
            title,
            company,
            type: optType,
            location,
            gpaReq: optType === 'Scholarship' ? 3.0 : 0,
            matchReason: snippet,
            link
          };
        });
      }
    }

    // 4b. Fallback to DuckDuckGo if Serper failed or no key
    if (opportunities.length === 0) {
      const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(queryStr)}`;
      const response = await fetch(ddgUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        }
      });

      if (response.ok) {
        const html = await response.text();
        const blocks = html.split(/class="[^"]*result\s+results_links/);

        // Skip the first block (page header)
        for (let i = 1; i < blocks.length; i++) {
          const block = blocks[i];

          const linkMatch = block.match(/class="result__a"\s+href="([^"]+)"/);
          const titleMatch = block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/);
          const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);

          if (linkMatch && titleMatch) {
            let rawLink = linkMatch[1];
            let title = decodeHtmlEntities(titleMatch[1].replace(/<[^>]*>/g, '').trim());
            let snippet = snippetMatch ? decodeHtmlEntities(snippetMatch[1].replace(/<[^>]*>/g, '').trim()) : '';

            let link = rawLink;
            if (link.startsWith('//duckduckgo.com/l/?uddg=')) link = 'https:' + link;
            if (link.includes('uddg=')) {
              try {
                const urlParam = new URL(link, 'https://duckduckgo.com').searchParams.get('uddg');
                if (urlParam) link = decodeURIComponent(urlParam);
              } catch (e) {}
            }

            if (link.includes('duckduckgo.com/y.js') || link.includes('duckduckgo.com/l/') || link.includes('duckduckgo.com/html')) continue;

            let company = 'External Opportunity';
            let location = 'Online / Remote';
            try {
              const urlObj = new URL(link);
              const hostname = urlObj.hostname;
              const parts = hostname.replace('www.', '').split('.');
              company = parts.length >= 2 ? parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1) : parts[0];
              location = hostname.endsWith('.id') ? 'Indonesia' : 'International / Online';
            } catch (e) {}

            let optType = type !== 'All' ? type : 'Internship';
            const searchText = `${title} ${snippet}`.toLowerCase();
            if (searchText.includes('beasiswa') || searchText.includes('scholarship')) optType = 'Scholarship';
            else if (searchText.includes('lomba') || searchText.includes('kompetisi') || searchText.includes('competition')) optType = 'Competition';
            else if (searchText.includes('sertifikasi') || searchText.includes('certification')) optType = 'Certification';

            opportunities.push({
              id: `live-${i}-${Date.now()}`,
              title,
              company,
              type: optType,
              location,
              gpaReq: optType === 'Scholarship' ? 3.0 : 0,
              matchReason: snippet || 'Matches your general profile and interest areas.',
              link
            });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, opportunities }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error fetching live opportunities:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
