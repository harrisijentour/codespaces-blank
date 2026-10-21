/**
 * Harris Ijen Admin Company Portal - Customer Reviews Module
 * PT HARRIS IJEN JAYA MANDIRI
 * Matches design and metrics from reference UI.
 * Requires Guest Data verification in database before submission.
 */

class HarrisReviewsService {
  constructor() {
    this.currentFilter = 'recent'; // 'recent' | 'highest' | 'photos'
    this.verifiedGuest = null;
    this.selectedRating = 5;
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.renderReviewsList();
  }

  // Open the Verification Gate Modal
  openVerifyModal() {
    const modal = document.getElementById('modalVerifyReviewGuest');
    const input = document.getElementById('verifyReviewInput');
    const errBox = document.getElementById('verifyReviewError');
    if (input) input.value = '';
    if (errBox) errBox.classList.add('hidden');
    if (modal) modal.classList.remove('hidden');
  }

  handleVerifySubmit(e) {
    e.preventDefault();
    const query = document.getElementById('verifyReviewInput')?.value.trim();
    const errBox = document.getElementById('verifyReviewError');

    const res = this.verifyGuestIdentity(query);
    if (res.success) {
      document.getElementById('modalVerifyReviewGuest')?.classList.add('hidden');
      this.openReviewSubmitModal(res.guest);
    } else {
      if (errBox) {
        errBox.innerText = res.message;
        errBox.classList.remove('hidden');
      } else {
        alert(res.message);
      }
    }
  }

  verifyGuestIdentity(query) {
    if (!query) {
      return { success: false, message: 'Please enter your Invoice Number or Registered Email.' };
    }

    const trimmed = query.trim();
    const guest = window.db.getGuestByInvoice(trimmed) || window.db.getGuestByEmail(trimmed);

    if (guest) {
      this.verifiedGuest = guest;
      return {
        success: true,
        guest: guest,
        message: `Verified! Welcome ${guest.guestName}. Reservation found for ${guest.tourPackageName}.`
      };
    } else {
      this.verifiedGuest = null;
      return {
        success: false,
        message: 'No booking record found for this Invoice Number or Email in PT Harris Ijen Jaya Mandiri database. Only verified guests can submit a review.'
      };
    }
  }

  openReviewSubmitModal(guest) {
    const modal = document.getElementById('modalSubmitReview');
    if (!modal) return;

    document.getElementById('reviewGuestNameHidden').value = guest.guestName;
    document.getElementById('reviewInvoiceHidden').value = guest.invoiceNumber;
    document.getElementById('reviewCountryHidden').value = guest.country;
    document.getElementById('reviewTourPackageHidden').value = guest.tourPackageName;

    const subTitle = document.getElementById('verifiedReviewGuestSubtitle');
    if (subTitle) {
      subTitle.innerText = `Verified: ${guest.guestName} (${guest.invoiceNumber}) • ${guest.tourPackageName}`;
    }

    this.setRating(5);
    document.getElementById('reviewTextInput').value = '';

    modal.classList.remove('hidden');
  }

  setRating(rating) {
    this.selectedRating = rating;
    const ratingInput = document.getElementById('reviewRatingInput');
    const textVal = document.getElementById('starRatingValueText');
    if (ratingInput) ratingInput.value = rating;
    if (textVal) textVal.innerText = `${rating}.0 / 5.0`;

    const stars = document.querySelectorAll('#starRatingContainer i');
    stars.forEach((s, idx) => {
      if (idx < rating) {
        s.className = 'fa-solid fa-star text-amber-400 hover:text-amber-500 transition';
      } else {
        s.className = 'fa-regular fa-star text-slate-300 hover:text-amber-400 transition';
      }
    });
  }

  handleReviewFormSubmit(e) {
    e.preventDefault();

    if (!this.verifiedGuest) {
      alert('Verification required before submitting a review.');
      return;
    }

    const reviewText = document.getElementById('reviewTextInput')?.value.trim();
    const catProf = Number(document.getElementById('revCatProf')?.value || 5);
    const catQual = Number(document.getElementById('revCatQual')?.value || 5);
    const catTime = Number(document.getElementById('revCatTime')?.value || 5);
    const catComm = Number(document.getElementById('revCatComm')?.value || 5);

    const newRev = window.db.addReview({
      invoiceNumber: this.verifiedGuest.invoiceNumber,
      guestName: this.verifiedGuest.guestName,
      country: this.verifiedGuest.country,
      location: `${this.verifiedGuest.country} / Banyuwangi`,
      rating: this.selectedRating,
      tag: this.verifiedGuest.tourPackageName,
      reviewText: reviewText,
      categories: {
        professionalism: catProf,
        qualityOfWork: catQual,
        timeliness: catTime,
        communication: catComm
      }
    });

    document.getElementById('modalSubmitReview')?.classList.add('hidden');
    this.verifiedGuest = null;

    if (window.confetti) {
      window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    }

    if (window.app) {
      window.app.toast('Thank you! Your verified review has been published.', 'success');
      window.app.updateStatsCounters();
    }
    this.renderDashboard();
  }

  // Render the entire Review Dashboard
  renderDashboard() {
    const metrics = window.db ? window.db.getReviewMetrics() : null;
    if (!metrics) return;

    // 1. Metric Cards
    const avgEl = document.getElementById('reviewMetricAvg') || document.getElementById('revAverageRating');
    const totEl = document.getElementById('reviewMetricTotal') || document.getElementById('revTotalCount');
    const pctEl = document.getElementById('reviewMetricFiveStar') || document.getElementById('rev5StarPercent');

    if (avgEl) avgEl.innerText = metrics.averageRating.toFixed(1);
    if (totEl) totEl.innerText = `Based on ${metrics.totalReviews} verified reviews`;
    if (pctEl) pctEl.innerText = `${metrics.fiveStarPercent}%`;

    // 2. Ratings Breakdown Bars
    const breakdownContainer = document.getElementById('reviewBreakdownContainer');
    if (breakdownContainer) {
      breakdownContainer.innerHTML = [5, 4, 3, 2, 1].map(star => {
        const count = metrics.breakdown[star] || 0;
        const pct = Math.round((count / (metrics.totalReviews || 1)) * 100);
        return `
          <div class="flex items-center space-x-2">
            <span class="w-7 font-bold text-slate-700 flex items-center justify-end">${star} <i class="fa-solid fa-star text-amber-400 text-[10px] ml-0.5"></i></span>
            <div class="flex-1 rating-progress-bg">
              <div class="rating-progress-fill bg-amber-400" style="width: ${pct}%;"></div>
            </div>
            <span class="w-8 font-mono text-slate-500 text-right">${count}</span>
          </div>
        `;
      }).join('');
    }

    // 3. Category Ratings Breakdown
    const cat = metrics.categoryAverages;
    const catMap = {
      catAvgProf: cat.professionalism,
      catAvgQual: cat.qualityOfWork,
      catAvgTime: cat.timeliness,
      catAvgComm: cat.communication
    };

    for (const [id, val] of Object.entries(catMap)) {
      const el = document.getElementById(id);
      if (el) el.innerText = `${val || '5.0'} / 5.0`;
    }

    // 4. Render Reviews List
    this.renderReviewsList();
  }

  // Render individual review cards
  renderReviewsList() {
    const container = document.getElementById('reviewsListContainer') || document.getElementById('reviewsCardsContainer');
    if (!container || !window.db) return;

    let reviews = [...window.db.getReviews()];

    if (this.currentFilter === 'highest') {
      reviews.sort((a, b) => b.rating - a.rating);
    } else {
      reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    if (reviews.length === 0) {
      container.innerHTML = `
        <div class="ui-card p-8 text-center text-slate-400">
          <i class="fa-solid fa-comment-slash text-3xl mb-3 block"></i>
          No customer reviews recorded yet.
        </div>
      `;
      return;
    }

    container.innerHTML = reviews.map(rev => {
      const starsHtml = this.generateStarsHtml(rev.rating);

      return `
        <div class="ui-card p-5 hover:border-slate-300 transition space-y-3">
          <!-- Top Row -->
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-3">
              <img src="${rev.avatarUrl}" alt="${rev.guestName}" class="w-11 h-11 rounded-full object-cover border border-slate-200">
              <div>
                <div class="font-extrabold text-sm text-slate-900">${rev.guestName}</div>
                <div class="text-[11px] text-slate-500">${rev.country} • ${rev.date}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-amber-400 text-sm">${starsHtml}</div>
              <span class="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 mt-1">
                <i class="fa-solid fa-shield-check mr-1"></i> Verified Traveler
              </span>
            </div>
          </div>

          <!-- Tour Tag -->
          <div class="inline-block bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg">
            <i class="fa-solid fa-map-pin text-blue-600 mr-1"></i> ${rev.tag}
          </div>

          <!-- Review Text -->
          <p class="text-xs text-slate-700 leading-relaxed italic">
            "${rev.reviewText}"
          </p>

          <!-- Category Sub-ratings pills -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600">
            <div><strong>Prof:</strong> ★★★★★ (${rev.categories?.professionalism || 5}.0)</div>
            <div><strong>Quality:</strong> ★★★★★ (${rev.categories?.qualityOfWork || 5}.0)</div>
            <div><strong>Punctual:</strong> ★★★★★ (${rev.categories?.timeliness || 5}.0)</div>
            <div><strong>Comm:</strong> ★★★★★ (${rev.categories?.communication || 5}.0)</div>
          </div>

          <!-- Official Management Response -->
          ${rev.response ? `
            <div class="bg-blue-50/70 border-l-4 border-blue-600 p-3 rounded-r-xl text-xs space-y-1">
              <div class="font-bold text-blue-900 text-[11px] flex items-center justify-between">
                <span>Official Management Response (${rev.response.author}):</span>
                <span class="text-slate-400 text-[10px] font-normal">${rev.response.date}</span>
              </div>
              <p class="text-blue-950 text-xs">${rev.response.text}</p>
            </div>
          ` : ''}

          <!-- Footer Actions -->
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button onclick="reviewsService.voteHelpful('${rev.id}')" class="text-slate-500 hover:text-blue-600 font-semibold flex items-center space-x-1">
              <i class="fa-regular fa-thumbs-up"></i>
              <span>Helpful (${rev.helpfulCount || 0})</span>
            </button>
            <div class="space-x-2">
              <button onclick="reviewsService.openReplyModal('${rev.id}')" class="text-slate-500 hover:text-slate-800 font-semibold">
                <i class="fa-solid fa-reply mr-1"></i> Reply
              </button>
              <button onclick="reviewsService.publishToBlogspot('${rev.id}')" class="text-orange-600 hover:text-orange-700 font-bold">
                <i class="fa-brands fa-blogger-b mr-1"></i> Post to Blogspot
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  generateStarsHtml(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;

    let res = '';
    for (let i = 0; i < full; i++) res += '<i class="fa-solid fa-star"></i>';
    if (half) res += '<i class="fa-solid fa-star-half-stroke"></i>';
    for (let i = 0; i < empty; i++) res += '<i class="fa-regular fa-star text-slate-300"></i>';
    return res;
  }

  voteHelpful(reviewId) {
    if (window.db) {
      window.db.voteReviewHelpful(reviewId);
      this.renderReviewsList();
    }
  }

  openReplyModal(reviewId) {
    const replyText = prompt('Enter Management Response for this traveler review:');
    if (replyText && replyText.trim()) {
      const user = window.auth ? window.auth.getUser() : null;
      const author = user ? `${user.roleLabel} - PT HARRIS IJEN JAYA MANDIRI` : 'Management';
      window.db.replyToReview(reviewId, author, replyText.trim());
      this.renderReviewsList();
      if (window.app) window.app.toast('Management reply posted!', 'success');
    }
  }

  publishToBlogspot(reviewId) {
    const rev = window.db.getReviews().find(r => r.id === reviewId);
    if (!rev || !window.blogspotService) return;
    window.blogspotService.openComposerWithReview(rev);
  }
}

// Global Reviews Service Instance
window.reviewsService = new HarrisReviewsService();
