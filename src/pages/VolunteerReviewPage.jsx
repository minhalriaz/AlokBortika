import { useMemo, useState } from "react";
import "../App.css";
import "./VolunteerReviewPage.css";

const STAR_LEVELS = [5, 4, 3, 2, 1];
const FILLED_STAR = "\u2605";
const EMPTY_STAR = "\u2606";

const volunteerProfile = {
  name: "Rafi Hasan",
  initials: "RH",
  completedTasks: 42,
  badge: "Top Volunteer",
};

const initialReviews = [
  {
    id: 1,
    reviewer: "Nusrat Jahan",
    issueTitle: "Broken streetlight near College Road",
    rating: 5,
    comment:
      "He followed up quickly with the local ward office and the light was fixed within two days.",
    date: "2026-02-27",
    status: "Verified",
    solved: "yes",
  },
  {
    id: 2,
    reviewer: "Siam Ahmed",
    issueTitle: "Overflowing waste point beside market",
    rating: 4,
    comment:
      "Great communication and regular updates. Cleanup happened, but bins should be monitored more often.",
    date: "2026-02-18",
    status: "Completed",
    solved: "yes",
  },
  {
    id: 3,
    reviewer: "Mitu Sarker",
    issueTitle: "Pothole near bus stand",
    rating: 5,
    comment:
      "Very supportive and coordinated with volunteers efficiently. The road patching work was completed on time.",
    date: "2026-02-11",
    status: "Verified",
    solved: "yes",
  },
  {
    id: 4,
    reviewer: "Arif Hossain",
    issueTitle: "Unsafe open drain cover",
    rating: 4,
    comment:
      "Good effort and quick response. Temporary safety signs were added while waiting for final repair.",
    date: "2026-01-30",
    status: "Completed",
    solved: "no",
  },
  {
    id: 5,
    reviewer: "Laboni Akter",
    issueTitle: "School lane waterlogging complaint",
    rating: 3,
    comment:
      "Help was arranged and drainage improved, but full resolution took longer than expected.",
    date: "2026-01-21",
    status: "Completed",
    solved: "yes",
  },
];

function createInitialBreakdown() {
  return STAR_LEVELS.reduce((counts, star) => {
    counts[star] = 0;
    return counts;
  }, {});
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function stars(rating, keyPrefix) {
  return Array.from({ length: 5 }, (_, index) => {
    const isFilled = index < rating;
    return (
      <span
        key={`${keyPrefix}-${index}`}
        className={`vr-star ${isFilled ? "vr-star--filled" : "vr-star--empty"}`}
        aria-hidden="true"
      >
        {isFilled ? FILLED_STAR : EMPTY_STAR}
      </span>
    );
  });
}

export default function VolunteerReviewPage() {
  const [reviews, setReviews] = useState(initialReviews);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");
  const [formData, setFormData] = useState({
    reviewer: "",
    issueTitle: "",
    rating: 0,
    comment: "",
    solved: "yes",
  });
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const ratingStats = useMemo(() => {
    const totalReviews = reviews.length;
    const totalScore = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalReviews > 0 ? totalScore / totalReviews : 0;
    const breakdown = createInitialBreakdown();

    reviews.forEach((review) => {
      breakdown[review.rating] += 1;
    });

    return { averageRating, totalReviews, breakdown };
  }, [reviews]);

  const visibleReviews = useMemo(() => {
    const filtered =
      activeFilter === "all"
        ? [...reviews]
        : reviews.filter((review) => review.rating === Number(activeFilter));

    filtered.sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();
      return sortOrder === "recent" ? bTime - aTime : aTime - bTime;
    });

    return filtered;
  }, [reviews, activeFilter, sortOrder]);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError("");
    setFormMessage("");
  }

  function handleRatingSelect(selectedRating) {
    setFormData((prev) => ({ ...prev, rating: selectedRating }));
    setFormError("");
    setFormMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (formData.rating < 1) {
      setFormError("Please select a star rating before submitting.");
      return;
    }

    if (formData.comment.trim().length < 10) {
      setFormError("Please write at least 10 characters in your feedback comment.");
      return;
    }

    const newReview = {
      id: Date.now(),
      reviewer: formData.reviewer.trim() || "Anonymous Resident",
      issueTitle: formData.issueTitle.trim() || "Community issue follow-up",
      rating: formData.rating,
      comment: formData.comment.trim(),
      date: new Date().toISOString(),
      status: formData.solved === "yes" ? "Verified" : "Completed",
      solved: formData.solved,
    };

    setReviews((prev) => [newReview, ...prev]);
    setFormData({
      reviewer: "",
      issueTitle: "",
      rating: 0,
      comment: "",
      solved: "yes",
    });
    setActiveFilter("all");
    setSortOrder("recent");
    setFormError("");
    setFormMessage("Review submitted successfully. Thank you for your feedback.");
  }

  return (
    <div className="page">
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      <div className="hero">
        <div className="heroInner">
          <div className="badge">Community trust and transparency</div>
          <h1 className="title">Volunteer Reviews</h1>
          <p className="subtitle">
            This page shows community feedback on volunteer contributions and completed issue
            resolutions across AlokBortika.
          </p>

          <section className="aboutCard vrSummaryCard" aria-label="Volunteer summary card">
            <div className="vrAvatar" aria-hidden="true">
              {volunteerProfile.initials}
            </div>

            <div className="vrSummaryMain">
              <p className="vrSummaryLabel">Featured helper</p>
              <h3>{volunteerProfile.name}</h3>

              <div className="vrRatingLine">
                <span className="vrStars">{stars(Math.round(ratingStats.averageRating), "summary")}</span>
                <strong>{ratingStats.averageRating.toFixed(1)}</strong>
                <span className="vrMuted">average resident rating</span>
              </div>
            </div>

            <div className="vrSummaryStats">
              <div className="vrMiniStat">
                <span>Completed tasks</span>
                <strong>{volunteerProfile.completedTasks}</strong>
              </div>
              <div className="vrMiniStat">
                <span>Total reviews</span>
                <strong>{ratingStats.totalReviews}</strong>
              </div>
              <span className="status statusResolved">{volunteerProfile.badge}</span>
            </div>
          </section>

          <section className="section">
            <div className="cards vrTopGrid">
              <div className="card">
                <div className="cardTop">
                  <h3>Rating Overview</h3>
                  <span className="status statusInReview">{ratingStats.totalReviews} reviews</span>
                </div>

                <div className="vrOverviewTop">
                  <div className="vrAverageNumber">{ratingStats.averageRating.toFixed(1)}</div>
                  <div>
                    <p className="vrMuted">Average rating from residents</p>
                  </div>
                </div>

                <div className="vrBreakdownList">
                  {STAR_LEVELS.map((star) => {
                    const count = ratingStats.breakdown[star];
                    const percent = ratingStats.totalReviews
                      ? (count / ratingStats.totalReviews) * 100
                      : 0;

                    return (
                      <div className="vrBreakdownRow" key={star}>
                        <span className="vrBreakdownLabel">{star} star</span>
                        <div className="vrProgressTrack" aria-hidden="true">
                          <div className="vrProgressFill" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="vrBreakdownCount">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card">
                <div className="cardTop">
                  <h3>Filter and Sort</h3>
                </div>

                <div className="vrFilterButtons">
                  <button
                    type="button"
                    className={activeFilter === "all" ? "vrFilterBtn vrFilterBtnActive" : "vrFilterBtn"}
                    onClick={() => setActiveFilter("all")}
                  >
                    All Reviews
                  </button>
                  <button
                    type="button"
                    className={activeFilter === "5" ? "vrFilterBtn vrFilterBtnActive" : "vrFilterBtn"}
                    onClick={() => setActiveFilter("5")}
                  >
                    5 Star
                  </button>
                  <button
                    type="button"
                    className={activeFilter === "4" ? "vrFilterBtn vrFilterBtnActive" : "vrFilterBtn"}
                    onClick={() => setActiveFilter("4")}
                  >
                    4 Star
                  </button>
                </div>

                <div className="vrSortWrap">
                  <label htmlFor="sortOrder">Sort by</label>
                  <select
                    id="sortOrder"
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                  >
                    <option value="recent">Most recent</option>
                    <option value="oldest">Oldest</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="sectionHead">
              <h2>Review History</h2>
              <p>{visibleReviews.length} reviews shown after filter and sort</p>
            </div>

            {visibleReviews.length === 0 ? (
              <div className="aboutCard">
                <p>No reviews match this filter right now.</p>
              </div>
            ) : (
              <div className="cards">
                {visibleReviews.map((review) => {
                  const statusClass =
                    review.status === "Verified"
                      ? "status statusResolved"
                      : "status statusAssigned";

                  return (
                    <article className="card vrReviewCard" key={review.id}>
                      <div className="cardTop">
                        <div>
                          <p className="vrReviewer">{review.reviewer}</p>
                          <h3>{review.issueTitle}</h3>
                        </div>
                        <span className={statusClass}>{review.status}</span>
                      </div>

                      <div className="vrRatingLine">
                        <span className="vrStars">{stars(review.rating, `review-${review.id}`)}</span>
                        <span className="vrMuted">{review.rating}.0</span>
                      </div>

                      <p>{review.comment}</p>

                      <div className="vrReviewFooter">
                        <span className="vrMuted">{formatDate(review.date)}</span>
                        <span className={review.solved === "yes" ? "status statusResolved" : "status statusPending"}>
                          {review.solved === "yes" ? "Issue solved" : "Needs follow-up"}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="section">
            <div className="sectionHead">
              <h2>Add Review</h2>
              <p>Share your feedback to help residents evaluate volunteer performance.</p>
            </div>

            <div className="formCard">
              <form className="formGrid" onSubmit={handleSubmit}>
                <label>
                  Your name (optional)
                  <input
                    type="text"
                    name="reviewer"
                    placeholder="e.g., Rahim Uddin"
                    value={formData.reviewer}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  Related issue title (optional)
                  <input
                    type="text"
                    name="issueTitle"
                    placeholder="e.g., Drainage overflow near block C"
                    value={formData.issueTitle}
                    onChange={handleInputChange}
                  />
                </label>

                <div className="fullWidth vrFieldBlock">
                  <p>Star rating</p>
                  <div className="vrRatingInput" role="radiogroup" aria-label="Star rating input">
                    {STAR_LEVELS.slice().reverse().map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={star <= formData.rating ? "vrStarButton vrStarButtonActive" : "vrStarButton"}
                        onClick={() => handleRatingSelect(star)}
                        aria-label={`${star} star`}
                      >
                        {star <= formData.rating ? FILLED_STAR : EMPTY_STAR}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="fullWidth">
                  Feedback comment
                  <textarea
                    rows={4}
                    name="comment"
                    placeholder="Write your feedback about response time, communication, and final resolution."
                    value={formData.comment}
                    onChange={handleInputChange}
                  />
                </label>

                <div className="fullWidth vrFieldBlock">
                  <p>Was the issue fully solved?</p>
                  <div className="vrSolveOptions">
                    <label className="vrChoice">
                      <input
                        type="radio"
                        name="solved"
                        value="yes"
                        checked={formData.solved === "yes"}
                        onChange={handleInputChange}
                      />
                      Yes
                    </label>
                    <label className="vrChoice">
                      <input
                        type="radio"
                        name="solved"
                        value="no"
                        checked={formData.solved === "no"}
                        onChange={handleInputChange}
                      />
                      No
                    </label>
                  </div>
                </div>

                {formError ? <p className="messageError fullWidth">{formError}</p> : null}
                {formMessage ? <p className="messageSuccess fullWidth">{formMessage}</p> : null}

                <div className="formActions fullWidth">
                  <button className="primary" type="submit">
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
