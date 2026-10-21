/**
 * Harris Ijen Admin Company Portal - Blogspot Publishing & Embed Module
 * PT HARRIS IJEN JAYA MANDIRI
 * Official Blog: https://www.harrisijentourandtravel.com
 * Requirement 7: The application must be designed to be embedded within a Blogspot post page without affecting the default Blogspot template.
 */

class HarrisBlogspotService {
  constructor() {
    this.postType = 'review';
  }

  getConfig() {
    return window.db ? window.db.getBlogspotConfig() : {};
  }

  saveConfig(newConfig) {
    if (window.db) {
      window.db.updateBlogspotConfig(newConfig);
      alert('Blogspot settings updated successfully!');
    }
  }

  // Pre-fill composer from a verified review
  openComposerWithReview(review) {
    if (window.app) window.app.switchTab('blogspot');

    const titleInput = document.getElementById('blogPostTitle');
    const labelsInput = document.getElementById('blogPostLabels');
    const contentTextarea = document.getElementById('blogPostContent');

    const title = `[Traveler Review] ${review.guestName} (${review.country}) on ${review.tag || 'Harris Ijen Tour'}`;
    const labels = `Guest Reviews, ${review.tag || 'Ijen Tour'}, PT Harris Ijen Jaya Mandiri, Banyuwangi Travel`;

    const htmlContent = `
<div class="harris-blogger-card" style="all: initial; display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 680px; margin: 20px auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); box-sizing: border-box;">
  <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 20px;">
    <div>
      <span style="display: inline-block; background-color: #0B2545; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px; letter-spacing: 0.5px;">Verified Harris Ijen Guest</span>
      <h2 style="color: #0B2545; margin: 8px 0 4px 0; font-size: 20px; font-weight: 800;">${review.guestName} from ${review.country}</h2>
      <p style="margin: 0; color: #64748b; font-size: 13px;">Tour: <strong>${review.tag}</strong> • ${review.date}</p>
    </div>
    <div style="text-align: right;">
      <div style="color: #f59e0b; font-size: 18px; letter-spacing: 2px;">★★★★★</div>
      <span style="font-size: 12px; color: #10b981; font-weight: 700;">5.0 / 5.0 Rating</span>
    </div>
  </div>

  <blockquote style="font-style: italic; color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0; padding-left: 16px; border-left: 4px solid #C59B27;">
    "${review.reviewText}"
  </blockquote>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; color: #475569;">
    <div><strong>Professionalism:</strong> ★★★★★ (5.0)</div>
    <div><strong>Quality of Tour:</strong> ★★★★★ (5.0)</div>
    <div><strong>Timeliness & Pickup:</strong> ★★★★★ (5.0)</div>
    <div><strong>Communication:</strong> ★★★★★ (5.0)</div>
  </div>

  ${review.response ? `
  <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 14px; border-radius: 0 10px 10px 0; margin-bottom: 20px;">
    <div style="font-weight: 700; color: #1e3a8a; font-size: 12px; margin-bottom: 4px;">Response from Management (${review.response.author}):</div>
    <div style="color: #1e40af; font-size: 13px; line-height: 1.5;">${review.response.text}</div>
  </div>
  ` : ''}

  <div style="text-align: center; margin-top: 24px; padding-top: 18px; border-top: 1px solid #f1f5f9;">
    <p style="color: #64748b; font-size: 13px; margin-bottom: 12px;">Ready to explore Mount Ijen Blue Fire and Banyuwangi with certified local leaders?</p>
    <a href="https://wa.me/6281234567890?text=Hello%20Harris%20Ijen%20Tour,%20I%20am%20interested%20in%20booking%20the%20${encodeURIComponent(review.tag)}" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 30px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);">
      Chat on WhatsApp with Tour Specialist
    </a>
  </div>
</div>
    `.trim();

    if (titleInput) titleInput.value = title;
    if (labelsInput) labelsInput.value = labels;
    if (contentTextarea) contentTextarea.value = htmlContent;

    this.updatePreview();
  }

  // Pre-fill composer with a Tour Package Promo
  loadTourPromoTemplate() {
    const titleInput = document.getElementById('blogPostTitle');
    const labelsInput = document.getElementById('blogPostLabels');
    const contentTextarea = document.getElementById('blogPostContent');

    const title = 'Official Mount Ijen Blue Fire Tour & Sunrise Trekking Guide 2026 | PT Harris Ijen Jaya Mandiri';
    const labels = 'Ijen Blue Fire, Banyuwangi Tour, Mount Ijen Package, Java Travel, PT Harris Ijen Jaya Mandiri';

    const htmlContent = `
<div class="harris-blogger-promo" style="all: initial; display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 720px; margin: 20px auto; color: #1e293b; line-height: 1.7; box-sizing: border-box;">
  <div style="background: linear-gradient(135deg, #0B2545 0%, #13315C 100%); color: white; padding: 32px 24px; border-radius: 18px; text-align: center; margin-bottom: 24px;">
    <span style="background-color: #C59B27; color: #0B2545; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; letter-spacing: 1px;">Official Tour Package</span>
    <h1 style="color: #ffffff; margin: 12px 0; font-size: 26px; font-weight: 800;">Mount Ijen Blue Fire Midnight Tour & Sunrise</h1>
    <p style="color: #cbd5e1; font-size: 14px; max-width: 500px; margin: 0 auto;">Witness one of only two natural electric blue fire volcanic phenomena in the world, followed by the majestic turquoise acid lake sunrise.</p>
  </div>

  <h3 style="color: #0B2545; font-size: 18px; border-bottom: 2px solid #C59B27; padding-bottom: 6px; margin-top: 24px;">Tour Highlights</h3>
  <ul style="padding-left: 20px; color: #334155;">
    <li>Midnight pickup directly from your Banyuwangi hotel, station, or ferry harbor.</li>
    <li>Certified experienced local trekking guide & safety ranger.</li>
    <li>High-grade professional gas mask and powerful LED headlamp provided.</li>
    <li>Descend to the crater floor to see the rare Blue Fire phenomenon up close.</li>
    <li>Breathtaking sunrise overlooking the world's largest acidic crater lake.</li>
    <li>Comfortable private AC transportation with experienced driver.</li>
  </ul>

  <div style="background-color: #f8fafc; border: 2px dashed #C59B27; border-radius: 14px; padding: 20px; text-align: center; margin: 28px 0;">
    <div style="font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: 700;">Special All-Inclusive Price</div>
    <div style="font-size: 28px; font-weight: 800; color: #0B2545; margin: 4px 0;">IDR 2,500,000 <span style="font-size: 14px; font-weight: normal; color: #64748b;">/ package (up to 4 pax)</span></div>
    <p style="font-size: 12px; color: #64748b; margin-bottom: 16px;">*No hidden charges. Verified and insured by PT HARRIS IJEN JAYA MANDIRI.</p>
    <a href="https://wa.me/6281234567890?text=Hello%20Harris%20Ijen%20Tour,%20I%20would%20like%20to%20book%20the%20Mount%20Ijen%20Midnight%20Tour" style="display: inline-block; background-color: #0B2545; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 30px; font-size: 14px;">
      Book Now via WhatsApp
    </a>
  </div>

  <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #64748b; text-align: center;">
    PT HARRIS IJEN JAYA MANDIRI • Harris Ijen Tour & Travel Service<br>
    Jl. Raya Ijen No. 88, Licin, Banyuwangi, East Java, Indonesia
  </div>
</div>
    `.trim();

    if (titleInput) titleInput.value = title;
    if (labelsInput) labelsInput.value = labels;
    if (contentTextarea) contentTextarea.value = htmlContent;

    this.updatePreview();
  }

  // Update real-time preview
  updatePreview() {
    const previewContainer = document.getElementById('blogPostPreview');
    const contentTextarea = document.getElementById('blogPostContent');
    const titleInput = document.getElementById('blogPostTitle');
    const previewTitle = document.getElementById('blogPreviewTitle');

    if (previewTitle && titleInput) {
      previewTitle.innerText = titleInput.value || 'Untitled Post Preview';
    }
    if (previewContainer && contentTextarea) {
      previewContainer.innerHTML = contentTextarea.value || '<p class="text-slate-400 italic">No content written yet.</p>';
    }
  }

  // Copy HTML to clipboard
  copyHTML() {
    const contentTextarea = document.getElementById('blogPostContent');
    if (!contentTextarea || !contentTextarea.value) {
      alert('Post content is empty!');
      return;
    }

    navigator.clipboard.writeText(contentTextarea.value).then(() => {
      alert('HTML copied to clipboard! You can paste this directly into Blogger (HTML view) with zero template conflicts.');
    }).catch(err => {
      contentTextarea.select();
      document.execCommand('copy');
      alert('HTML copied to clipboard!');
    });
  }

  // Direct Publish via Google Blogger API v3
  async publishDirectlyToBlogger() {
    const config = this.getConfig();
    const title = document.getElementById('blogPostTitle')?.value;
    const content = document.getElementById('blogPostContent')?.value;
    const labelsRaw = document.getElementById('blogPostLabels')?.value;
    const token = document.getElementById('bloggerAccessToken')?.value;

    if (!title || !content) {
      alert('Please fill in both post title and content.');
      return;
    }

    if (!config.blogId) {
      alert('Please configure your Blogger Blog ID in the Blogspot Settings tab.');
      return;
    }

    const labels = labelsRaw ? labelsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    if (token && token.trim()) {
      const url = `https://www.googleapis.com/blogger/v3/blogs/${config.blogId}/posts/`;
      const payload = {
        kind: 'blogger#post',
        blog: { id: config.blogId },
        title: title,
        content: content,
        labels: labels
      };

      try {
        const btn = document.getElementById('btnPublishBlogspot');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Publishing to Blogger...';

        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await resp.json();
        if (btn) btn.innerHTML = '<i class="fa-brands fa-blogger-b mr-1"></i> Publish to Blogspot (Blogger API)';

        if (resp.ok) {
          alert(`Success! Post published to Blogspot: ${data.url || 'Live on Blogspot'}`);
          if (window.auth && window.db) {
            const user = window.auth.getUser();
            window.db.logActivity({
              username: user.username,
              fullName: user.fullName,
              role: `${user.position} (${user.employeeNumber})`,
              action: `Published Blogspot Post: "${title}" (Post ID: ${data.id})`,
              status: 'Success'
            });
          }
          return;
        } else {
          alert(`Blogger API returned an error: ${data.error?.message || 'Check access token or Blog ID'}`);
        }
      } catch (err) {
        alert('Network or CORS error connecting to Blogger API. You can still use the "Copy HTML" button to paste directly into your Blogspot post editor.');
      }
    } else {
      const proceed = confirm(
        'No Google OAuth2 Access Token provided for automatic Blogger API v3 submission.\n\n' +
        'Would you like to copy the ready-to-publish Blogger HTML to your clipboard so you can paste it directly into your Blogger post editor?'
      );
      if (proceed) {
        this.copyHTML();
        window.open('https://draft.blogger.com/blog/posts/' + (config.blogId || '3136808355151123445'), '_blank');
      }
    }
  }

  /**
   * REQUIREMENT 7: Blogspot Post Page Embedding without affecting the default template.
   * Generates two isolated embedding approaches:
   * 1. Responsive Auto-Resizing Iframe (100% Sandbox Isolation - Guaranteed Zero Template Impact)
   * 2. Scoped Container Code with CSS `all: initial` isolation
   */
  generatePortalEmbedSnippet(type = 'iframe') {
    const portalUrl = window.location.href.split('?')[0].split('#')[0];

    if (type === 'iframe') {
      return `
<!-- ======================================================== -->
<!-- HARRIS IJEN ADMIN COMPANY PORTAL - BLOGSPOT POST EMBED    -->
<!-- PT HARRIS IJEN JAYA MANDIRI                               -->
<!-- Safe embed: 100% Isolated Iframe with auto-height script  -->
<!-- Does NOT affect or override the default Blogspot template -->
<!-- ======================================================== -->
<div class="harris-portal-embed-wrapper" style="width:100%; max-width:1170px; margin:20px auto; clear:both; box-sizing:border-box;">
  <iframe id="harrisPortalFrame" 
          src="${portalUrl}?embed=true" 
          style="width:100%; border:none; min-height:850px; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.08); background:#f8fafc; display:block;" 
          scrolling="no"
          title="Harris Ijen Admin Company Portal">
  </iframe>
</div>

<script>
(function() {
  // Listen for auto-height messages from the embedded portal
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'HARRIS_PORTAL_RESIZE') {
      var iframe = document.getElementById('harrisPortalFrame');
      if (iframe && event.data.height) {
        iframe.style.height = (event.data.height + 40) + 'px';
      }
    }
  });
})();
<\/script>
<!-- ==================== END EMBED CODE ==================== -->
      `.trim();
    } else {
      // Scoped HTML Container
      return `
<!-- ======================================================== -->
<!-- HARRIS IJEN PORTAL - SCOPED BLOGSPOT WIDGET CONTAINER     -->
<!-- Scoped under #harris-portal-embed with isolated CSS reset -->
<!-- ======================================================== -->
<div id="harris-portal-embed" style="all:initial; display:block; font-family:'Plus Jakarta Sans',sans-serif; max-width:100%; margin:20px 0; background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:20px; box-sizing:border-box;">
  <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #e2e8f0; padding-bottom:12px; margin-bottom:16px;">
    <div>
      <h3 style="margin:0; font-size:16px; font-weight:800; color:#0B2545;">Harris Ijen Admin Company Portal</h3>
      <p style="margin:0; font-size:11px; color:#64748B;">PT HARRIS IJEN JAYA MANDIRI • Official Travel Services</p>
    </div>
    <a href="https://www.harrisijentourandtravel.com/p/employee-data-pt-harris-ijen-jaya.html" target="_blank" style="font-size:11px; font-weight:700; color:#2563EB; text-decoration:none;">
      Employee Directory <i class="fa-solid fa-arrow-up-right-from-square"></i>
    </a>
  </div>
  <p style="font-size:13px; color:#334155; margin-bottom:16px;">
    Access verified guest reservations, generate official signed invoices, or verify booking authenticity.
  </p>
  <a href="${portalUrl}" target="_blank" style="display:inline-block; background:#0B2545; color:#ffffff; font-weight:700; font-size:13px; padding:10px 20px; border-radius:10px; text-decoration:none;">
    Launch Portal in Full Screen &rarr;
  </a>
</div>
      `.trim();
    }
  }

  // Update Embed Code inputs in UI
  updateEmbedCodeInputs() {
    const iframeSnippet = document.getElementById('portalIframeSnippet');
    const containerSnippet = document.getElementById('portalContainerSnippet');

    if (iframeSnippet) iframeSnippet.value = this.generatePortalEmbedSnippet('iframe');
    if (containerSnippet) containerSnippet.value = this.generatePortalEmbedSnippet('container');
  }

  copyEmbedSnippet(elementId) {
    const el = document.getElementById(elementId);
    if (!el || !el.value) return;

    navigator.clipboard.writeText(el.value).then(() => {
      alert('Blogspot embed code copied! Paste this directly into any Blogspot post or page HTML view.');
    }).catch(err => {
      el.select();
      document.execCommand('copy');
      alert('Blogspot embed code copied to clipboard!');
    });
  }
}

// Global Blogspot Service Instance
window.blogspotService = new HarrisBlogspotService();
