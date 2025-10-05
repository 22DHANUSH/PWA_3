export default function SiteFooter() {
  return (
    <footer className="section">
      <div
        className="container"
        style={{
          borderTop: "1px solid rgba(0,0,0,.06)",
          paddingTop: 32,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          className="grid-3"
          style={{
            display: "flex",
            flexWrap: "wrap", // ✅ allows wrapping
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            maxWidth: 1000,
            gap: 24, // spacing between items when wrapped
          }}
        >
          {/* Left Info Section */}
          <div
            className="h-stack"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              flex: "1 1 200px", // ✅ flexible on small screens
              minWidth: 150,
            }}
          >
            <div className="subtle">INFO</div>
            <a href="/about">ABOUT</a>
            <a href="/contact">CONTACT US</a>
          </div>

          {/* Center Logo */}
          <div
            className="v-stack"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: "1 1 200px",
              minWidth: 150,
            }}
          >
            <img
              src="/images/Columbia-Logo2.png"
              alt="Columbia Sportswear Logo"
              style={{ maxHeight: 120, maxWidth: "100%", height: "auto" }} // ✅ responsive logo
            />
          </div>

          {/* Right Text */}
          <div
            className="v-stack subtle"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              textAlign: "right",
              flex: "1 1 200px",
              minWidth: 150,
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
