export default function SiteFooter() {
  return (
    <footer className="section">
      <div className="container" style={{ borderTop: '1px solid rgba(0,0,0,.06)', paddingTop: 32 }}>
        <div className="grid-3">
          <div className="v-stack" style={{ gap: 8 }}>
            <div className="subtle">INFO</div>
            <a href="#">PRICING</a>
            <a href="#">ABOUT</a>
            <a href="#">CONTACTS</a>
            <div className="subtle" style={{ marginTop: 14 }}>LANGUAGES</div>
            <a href="#">ENG</a><a href="#">ESP</a><a href="#">SVE</a>
          </div>
          <div className="v-stack" style={{ gap: 7 }}>
            <div className="subtle">TECHNOLOGIES</div>
            <div className="h-stack" style={{ gap: 14, alignItems: 'center' }}>
              <div style={{ width: 22, height: 22, transform: 'rotate(45deg)', border: '2px solid #111' }} aria-hidden />
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 46, lineHeight: 1 }}>COLUMBIA<br/>SPORTSWEAR</div>
            </div>
            <div className="subtle">Near-field communication</div>
          </div>
          <div className="v-stack subtle" style={{ gap: 8 }}>
            <div>© {new Date().getFullYear()} Columbia Sportswear</div>
            <div>All rights reserved.</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
