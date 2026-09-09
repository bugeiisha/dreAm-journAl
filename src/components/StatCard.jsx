import './StatCard.css'

function StatCard({ label, value, icon, detail }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>

        <span className="stat-card-icon">{icon}</span>
      </div>

      <div className="stat-value">{value}</div>

      {detail && (
        <p className="stat-detail">{detail}</p>
      )}
    </div>
  )
}

export default StatCard