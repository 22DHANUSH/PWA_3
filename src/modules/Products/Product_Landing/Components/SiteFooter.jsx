export default function SiteFooter() {
  return (
    <footer className="section">
      <div
        className="container"
        style={{
          borderTop: '1px solid rgba(0,0,0,.06)',
          paddingTop: 32,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          className="grid-3"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: 1000,
          }}
        >

          <div className="h-stack" style={{ display: 'flex', gap: 48 }}>
            <div className="v-stack" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="subtle">INFO</div>

              <a href="/about">ABOUT</a>
              <a href="/contact">CONTACT US</a>

            </div>

          </div>


          <div className="v-stack" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src="/images/Columbia-Logo2.png"
              alt="Columbia Sportswear Logo"
              style={{ height: 150 }}
            />
          </div>


          <div
            className="v-stack subtle"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              textAlign: 'right',
            }}
          >
            <div>© {new Date().getFullYear()} Columbia Sportswear</div>
            <div>All rights reserved.</div>
          </div>
        </div>
      </div>
    </footer>
  );
}


