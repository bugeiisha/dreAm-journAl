import './DreamCard.css'

function DreamCard({ dream }) {
  return (
    <article className="dream-card">
      {dream.image ? (
        <div
          className="dream-image"
          style={{ backgroundImage: `url(${dream.image})` }}
        />
      ) : (
        <div className="dream-image dream-image-placeholder">
          <span>☾</span>
        </div>
      )}

      <div className="dream-card-content">
        <div className="dream-card-header">
          <h3>{dream.title}</h3>

          <span className="dream-date">{dream.date}</span>
        </div>

        <p className="dream-preview">
          {dream.preview}
        </p>

        <div className="dream-tags">
          {dream.tags.map((tag) => (
            <span
              className="dream-tag"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className={`mood mood-${dream.moodType}`}>
        {dream.mood}
      </div>
    </article>
  )
}

export default DreamCard