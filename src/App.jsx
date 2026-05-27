import { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════
   HACKER BACKGROUND — canvas animation
══════════════════════════════════════════ */
function HackerBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "crwn crwncrwn crwn crwn crwn hack me hack me ";
    let drops = Array.from({ length: Math.floor(window.innerWidth / 22) }, () => Math.random() * -120);

    const diagLines = Array.from({ length: 14 }, () => ({
      x: Math.random() * 1.4 - 0.2,
      speed: 0.00025 + Math.random() * 0.0004,
      offset: Math.random(),
      opacity: 0.025 + Math.random() * 0.045,
      width: 0.5 + Math.random() * 1.2,
    }));

    let t = 0;

    function draw() {
      t++;
      ctx.fillStyle = "rgba(0,0,0,0.075)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // diagonal neon streaks
      diagLines.forEach((line) => {
        const progress = (line.offset + t * line.speed) % 1;
        const cx = line.x * canvas.width;
        const angle = Math.PI / 5;
        const len = canvas.height * 2;
        const p1 = progress - 0.15;
        const sx = cx - Math.cos(angle) * len * progress;
        const sy = canvas.height * progress - Math.sin(angle) * len * progress;
        const ex = cx - Math.cos(angle) * len * p1;
        const ey = canvas.height * p1 - Math.sin(angle) * len * p1;
        const grad = ctx.createLinearGradient(sx, sy, ex, ey);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(0.3, `rgba(220,240,255,${line.opacity * 2.5})`);
        grad.addColorStop(0.6, `rgba(200,230,255,${line.opacity})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = grad;
        ctx.lineWidth = line.width;
        ctx.stroke();
      });

      // matrix rain
      ctx.font = "11px monospace";
      const numCols = Math.floor(canvas.width / 22);
      while (drops.length < numCols) drops.push(0);
      drops.length = numCols;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 22;
        const y = drops[i] * 22;
        ctx.fillStyle = "rgba(210,235,255,0.55)";
        ctx.fillText(char, x, y);
        ctx.fillStyle = "rgba(160,200,255,0.05)";
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - 22);
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.32;
      }

      // subtle grid
      if (t % 4 === 0) {
        ctx.strokeStyle = "rgba(255,255,255,0.012)";
        ctx.lineWidth = 0.5;
        for (let y = 0; y < canvas.height; y += 80) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }
        for (let x = 0; x < canvas.width; x += 80) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.65, pointerEvents: "none" }}
    />
  );
}

/* ══════════════════════════════════════════
   CINEMATIC INTRO
══════════════════════════════════════════ */
function Intro({ onDone }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 350),
      setTimeout(() => setPhase(2), 1100),
      setTimeout(() => setPhase(3), 1900),
      setTimeout(() => { setPhase(4); setTimeout(onDone, 850); }, 4400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const exit = useCallback(() => {
    setPhase(4);
    setTimeout(onDone, 850);
  }, [onDone]);

  const fadeUp = (visible, delay = "0s") => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(12px)",
    transition: `all 0.6s ease ${delay}`,
  });

  return (
    <div
      onClick={exit}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#000",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        opacity: phase === 4 ? 0 : 1,
        transition: phase === 4 ? "opacity 0.85s ease" : "none",
        pointerEvents: phase === 4 ? "none" : "auto",
      }}
    >
      {/* scanline sweep */}
      <div style={{
        position: "absolute", left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)",
        top: phase === 0 ? "0%" : "110%",
        transition: "top 1.5s ease-in-out",
      }} />

      {/* corner brackets */}
      {[
        ["tl", { top: 32, left: 32, borderWidth: "1px 0 0 1px" }],
        ["tr", { top: 32, right: 32, borderWidth: "1px 1px 0 0" }],
        ["bl", { bottom: 32, left: 32, borderWidth: "0 0 1px 1px" }],
        ["br", { bottom: 32, right: 32, borderWidth: "0 1px 1px 0" }],
      ].map(([k, pos]) => (
        <div key={k} style={{
          position: "absolute", width: 52, height: 52,
          borderColor: "rgba(255,255,255,0.3)", borderStyle: "solid", ...pos,
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "scale(1)" : "scale(0.6)",
          transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
        }} />
      ))}

      <div style={{ fontSize: "0.62rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: "2rem", ...fadeUp(phase >= 1, "0.2s") }}>
        Portfolio — 2026
      </div>

      <div style={{ overflow: "hidden", textAlign: "center" }}>
        <span style={{
          display: "block",
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(4rem,11vw,10rem)",
          fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 0.9, color: "#fff",
          transform: phase >= 1 ? "translateY(0)" : "translateY(110%)",
          transition: "transform 1s cubic-bezier(0.16,1,0.3,1) 0.45s",
        }}>crWn</span>
        <span style={{
          display: "block",
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(1.4rem,3.5vw,3rem)",
          fontWeight: 400, letterSpacing: "0.08em", color: "rgba(255,255,255,0.18)", marginTop: "0.4rem",
          transform: phase >= 1 ? "translateY(0)" : "translateY(110%)",
          transition: "transform 1s cubic-bezier(0.16,1,0.3,1) 0.6s",
        }}>Jeremiah Ibeun</span>
      </div>

      <div style={{ fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginTop: "2.5rem", ...fadeUp(phase >= 2) }}>
        Designer &nbsp;·&nbsp; Cybersecurity Student &nbsp;·&nbsp; Lagos
      </div>

      <div style={{ width: 200, height: 1, background: "rgba(255,255,255,0.1)", marginTop: "2rem", overflow: "hidden", opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.4s" }}>
        <div style={{ height: "100%", background: "rgba(255,255,255,0.7)", width: phase >= 2 ? "100%" : "0%", transition: phase >= 2 ? "width 1.9s ease" : "none" }} />
      </div>

      <div style={{ marginTop: "1.8rem", fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)", ...fadeUp(phase >= 3) }}>
        Click anywhere to enter
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MARQUEE
══════════════════════════════════════════ */
function Marquee() {
  const items = ["UI/UX Design","Web Development","Cybersecurity Student","HTML & CSS","Figma","Python","Branding","Open to Work","Lagos Nigeria"];
  const doubled = [...items, ...items, ...items];
  return (
    <div style={{ overflow: "hidden", borderBottom: "1px solid #222", padding: "0.6rem 0", background: "#0a0a0a", position: "relative", zIndex: 2 }}>
      <div style={{ display: "flex", gap: "3rem", animation: "marquee 20s linear infinite", whiteSpace: "nowrap" }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#3a3a3a", fontWeight: 500 }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   NAV
══════════════════════════════════════════ */
function Nav() {
  const [hov, setHov] = useState(null);
  const links = ["home","about","skills","portfolio","certifications","contact"];
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.2rem 3rem", background: "rgba(10,10,10,0.93)", backdropFilter: "blur(14px)", borderBottom: "1px solid #222" }}>
      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "0.95rem", fontWeight: 600, color: "#f0f0f0" }}>jeremiah.io</span>
      <div style={{ display: "flex", gap: "2rem" }}>
        {links.map((l) => (
          <button key={l} onClick={() => scrollTo(l)} onMouseEnter={() => setHov(l)} onMouseLeave={() => setHov(null)}
            style={{ background: "none", border: "none", color: hov === l ? "#f0f0f0" : "#555", fontSize: "0.82rem", cursor: "pointer", textTransform: "capitalize", letterSpacing: "0.03em", padding: 0, transition: "color 0.2s" }}>
            {l}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.75rem", color: "#555" }}>
        <span style={{ width: 6, height: 6, background: "#4ade80", borderRadius: "50%", display: "inline-block", animation: "blink 2s infinite" }} />
        Available for work
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════
   BOUNCE WRAPPER
══════════════════════════════════════════ */
function Bounce({ style, children }) {
  const [active, setActive] = useState(false);
  const trigger = () => { setActive(false); requestAnimationFrame(() => setActive(true)); };
  return (
    <div onClick={trigger} onAnimationEnd={() => setActive(false)}
      style={{ ...style, cursor: "pointer", animation: active ? "bounceAnim 0.52s cubic-bezier(0.36,0.07,0.19,0.97) forwards" : "none" }}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════
   REUSABLE CARDS
══════════════════════════════════════════ */
function SkillCard({ num, name, desc }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ padding: "2rem", borderRight: "1px solid #222", background: h ? "#0e0e0e" : "transparent", transition: "background 0.2s" }}>
      <div style={{ fontSize: "0.68rem", letterSpacing: "0.15em", color: "#333", marginBottom: "1rem" }}>{num}</div>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.6rem" }}>{name}</div>
      <div style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.65, fontWeight: 300 }}>{desc}</div>
    </div>
  );
}

function ProjectCard({ type, title, desc, tags, link, linkText }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ padding: "2rem", borderRight: "1px solid #222", display: "flex", flexDirection: "column", gap: "0.8rem", background: h ? "#0e0e0e" : "transparent", transition: "background 0.2s" }}>
      <div style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#333" }}>{type}</div>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "1rem", fontWeight: 600, lineHeight: 1.3 }}>{title}</div>
      <div style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.65, fontWeight: 300, flex: 1 }}>{desc}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
        {tags.map((t) => <span key={t} style={{ padding: "0.2rem 0.6rem", border: "1px solid #222", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#444" }}>{t}</span>)}
      </div>
      <a href={link} target="_blank" rel="noreferrer"
        style={{ fontSize: "0.75rem", color: h ? "#f0f0f0" : "#555", textDecoration: "none", letterSpacing: "0.08em", transition: "color 0.2s" }}>
        {linkText} ↗
      </a>
    </div>
  );
}

function CertCard({ issuer, name, year, status, active }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ padding: "2rem", borderRight: "1px solid #222", background: h ? "#0e0e0e" : "transparent", transition: "background 0.2s" }}>
      <div style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#333", marginBottom: "0.8rem" }}>{issuer}</div>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.35, marginBottom: "0.4rem" }}>{name}</div>
      <div style={{ fontSize: "0.78rem", color: "#555" }}>{year}</div>
      <div style={{ display: "inline-block", marginTop: "0.8rem", padding: "0.2rem 0.6rem", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", border: active ? "1px solid #4ade80" : "1px solid #222", color: active ? "#4ade80" : "#444" }}>
        {status}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════ */
export default function App() {
  const [introGone, setIntroGone] = useState(false);
  const [activeTab, setActiveTab] = useState("Projects");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const onIntroDone = useCallback(() => setIntroGone(true), []);

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => { setSent(false); setForm({ name: "", email: "", message: "" }); }, 3000);
  };

  const eye  = { fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#333", marginBottom: "0.6rem" };
  const stitle = { fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(1.8rem,3.5vw,3rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "1rem" };
  const ssub  = { fontSize: "0.9rem", color: "#666", lineHeight: 1.7, maxWidth: 480, fontWeight: 300 };
  const btnP  = { background: "#f0f0f0", color: "#0a0a0a", padding: "0.75rem 1.8rem", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", border: "none", cursor: "pointer", display: "inline-block" };
  const btnO  = { color: "#666", textDecoration: "none", fontSize: "0.8rem", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.75rem 1.8rem", border: "1px solid #2a2a2a", cursor: "pointer", background: "transparent", display: "inline-block" };
  const sec   = (extra = {}) => ({ padding: "6rem 3rem", borderBottom: "1px solid #222", position: "relative", zIndex: 2, ...extra });

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: "#0a0a0a", color: "#f0f0f0", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes bounceAnim {
          0%  {transform:scale(1)}
          18% {transform:scale(0.91)}
          50% {transform:scale(1.08)}
          72% {transform:scale(0.97)}
          100%{transform:scale(1)}
        }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #1e1e1e; }
      `}</style>

      <HackerBg />
      {!introGone && <Intro onDone={onIntroDone} />}
      <Marquee />
      <Nav />

      {/* ── HERO ── */}
      <section id="home" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", padding: "8rem 3rem 4rem", gap: "4rem", alignItems: "center", borderBottom: "1px solid #222", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#0d0d0d", border: "1px solid #1e1e1e", padding: "0.4rem 0.9rem", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", width: "fit-content" }}>
            <span style={{ width: 6, height: 6, background: "#4ade80", borderRadius: "50%", display: "inline-block", animation: "blink 2s infinite" }} />
            Available for work
          </div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(2.8rem,5vw,5rem)", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.03em" }}>
            Designer<br /><span style={{ color: "#2a2a2a" }}>&</span><br />CyberSec<br />Student
          </div>
          <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.8, maxWidth: 480, fontWeight: 300 }}>
            I design clean, functional digital experiences and I'm advancing into cybersecurity — where design thinking meets defensive strategy. Based in Lagos, Nigeria.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {["UI/UX Design", "Web Dev", "Cybersecurity", "Branding"].map((c) => (
              <span key={c} style={{ padding: "0.3rem 0.85rem", border: "1px solid #1e1e1e", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#555" }}>{c}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <a href="#portfolio" style={btnP}>View Work</a>
            <a href="#contact" style={btnO}>Get in Touch</a>
          </div>
          <div style={{ fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#333" }}>↓ scroll to explore</div>
        </div>

        <Bounce style={{ position: "relative", background: "#0d0d0d", border: "1px solid #1e1e1e", aspectRatio: "3/4", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src="/free.png" alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: -1, left: -1, right: -1, background: "rgba(10,10,10,0.96)", borderTop: "1px solid #1e1e1e", padding: "1.2rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "1rem", fontWeight: 600 }}>Jeremiah Ibeun</div>
              <div style={{ fontSize: "0.75rem", color: "#555", marginTop: 2 }}>Designer · Cybersecurity Student</div>
            </div>
            <span style={{ fontSize: "1.2rem", color: "#444" }}>↗</span>
          </div>
        </Bounce>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={sec({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "start" })}>
        <div>
          <div style={eye}>About Me</div>
          <div style={stitle}>Jeremiah<br />Ibeun</div>
          <div style={{ fontSize: "0.92rem", color: "#666", lineHeight: 1.85, fontWeight: 300 }}>
            <p style={{ marginBottom: "1.2rem" }}>I'm a <strong style={{ color: "#ccc", fontWeight: 500 }}>Computer Science graduate</strong> with a National Diploma from Federal Polytechnic, Offa and hands-on experience in web design, HTML, CSS, Bootstrap, and Python.</p>
            <p style={{ marginBottom: "1.2rem" }}>Currently advancing in <strong style={{ color: "#ccc", fontWeight: 500 }}>Cybersecurity at Miva Open University</strong> — building the technical foundation where design precision meets security thinking.</p>
            <p>Also teaching computer studies at <strong style={{ color: "#ccc", fontWeight: 500 }}>Success Mandate Secondary School</strong> in Lagos, helping students develop real digital skills.</p>
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" }}>
            <a href="/cv.pdf" target="_blank" rel="noreferrer" style={btnP}>Download CV</a>
            <a href="#portfolio" style={btnO}>View Projects</a>
          </div>
        </div>
        <div>
          <Bounce style={{ width: "100%",height: "400px",aspectRatio: "1/1", background: "#0d0d0d", border: "1px solid #1e1e1e", overflow: "hidden", marginBottom: "1.5rem" }}>
            <img src="https://ibeunjeremiah.netlify.app/perfil.png" alt="Square headshot of Jeremiah Ibeun in a dark profile frame, suggesting a confident professional tone" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </Bounce>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid #222" }}>
            {[["10+", "Projects Done"], ["2+", "Years Exp."], ["3+", "Companies"], ["4", "Certifications"]].map(([n, l], i) => (
              <div key={l} style={{ padding: "1.2rem", borderRight: i % 2 === 0 ? "1px solid #222" : "none", borderBottom: i < 2 ? "1px solid #222" : "none" }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "1.8rem", fontWeight: 700 }}>{n}</div>
                <div style={{ fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#333", marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills" style={sec()}>
        <div style={{ marginBottom: "3rem" }}>
          <div style={eye}>Expertise</div>
          <div style={stitle}>What I Can Do</div>
          <p style={ssub}>Entry-level capabilities across design and cybersecurity — built from real projects, coursework, and hands-on practice.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", border: "1px solid #222" }}>
          <SkillCard num="01" name="UI/UX Design" desc="Design clean, user-centred interfaces in Figma. From wireframes to high-fidelity prototypes, focused on usability and visual clarity." />
          <SkillCard num="02" name="Web Development" desc="Build responsive websites with HTML5, CSS3, Bootstrap, and JavaScript. Comfortable working from design files to live code." />
          <SkillCard num="03" name="Brand Identity" desc="Create visual identities including logo design, colour systems, and brand guidelines using Figma and Photoshop." />
          <SkillCard num="04" name="Cybersecurity Foundations" desc="Networking, security concepts, and threat awareness through ISC² CC and Cisco NetAcad coursework." />
          <SkillCard num="05" name="Digital Marketing" desc="Plan and execute digital campaigns. At Arise Business Center, content strategy boosted engagement 40% in one month." />
          <SkillCard num="06" name="Teaching & Communication" desc="Deliver clear technical instruction to non-technical audiences at secondary school level in Lagos." />
        </div>
      </section>

      {/* ── PORTFOLIO ── */}
      <section id="portfolio" style={sec()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={eye}>Selected Work</div>
            <div style={stitle}>Portfolio</div>
          </div>
          <div style={{ display: "flex" }}>
            {["Projects", "Design", "Dev"].map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: "0.55rem 1.4rem", fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", background: activeTab === tab ? "#f0f0f0" : "transparent", color: activeTab === tab ? "#0a0a0a" : "#555", border: "1px solid #222", borderRight: i < 2 ? "none" : "1px solid #222", transition: "all 0.2s" }}>
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", border: "1px solid #222" }}>
          <ProjectCard type="Web Development" title="Personal Portfolio Website" desc="A fully responsive developer portfolio built from scratch. Includes animated sections, smooth scroll, and a contact form. Deployed live on Netlify." tags={["HTML5","CSS3","JS","Netlify"]} link="https://ayodeji-visuals.vercel.app/" linkText="View Live" />
          <ProjectCard type="UI/UX Design" title="Brand Identity Design" desc="Designed a complete visual identity including logo, typography, colour palette, and UI components for a digital brand using Figma." tags={["Figma","UI Design","Branding"]} link="https://capsulejio.netlify.app/" linkText="View Project" />
          <ProjectCard type="Operations & Content" title="ICT & Social Media Growth" desc="Managed ICT operations and social media for Arise Business Center. Content strategy boosted brand engagement by 40% within one month." tags={["Content","Analytics","Operations"]} link="https://capsulejio.netlify.app/" linkText="Read More" />
        </div>
        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <a href="https://github.com/bellacrwn" target="_blank" rel="noreferrer" style={btnO}>View GitHub Portfolio ↗</a>
        </div>
      </section>

      {/* ── CERTIFICATIONS ── */}
      <section id="certifications" style={sec()}>
        <div style={eye}>Credentials</div>
        <div style={stitle}>Certifications &<br />Education</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", border: "1px solid #222", marginTop: "3rem" }}>
          <CertCard issuer="ISC²" name="Certified in Cybersecurity (CC)" year="2025" status="Certified" active />
          <CertCard issuer="Google" name="Digital Marketing Certificate" year="2025" status="Certified" active />
          <CertCard issuer="Cisco NetAcad" name="Introduction to Cybersecurity" year="2025" status="Certified" active />
          <CertCard issuer="Softrays Tech" name="Professional Web Design Certificate" year="2024" status="Certified" active />
          <CertCard issuer="Miva Open University" name="B.Sc. Cybersecurity" year="Expected June 2028" status="In Progress" />
          <CertCard issuer="Federal Polytechnic, Offa" name="National Diploma — Computer Science" year="September 2024" status="Graduated" active />
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={sec()}>
        <div style={eye}>Get in Touch</div>
        <div style={stitle}>Contact Jeremiah</div>
        <p style={ssub}>Reach out for design projects, collaborations, or just to connect.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", marginTop: "3rem" }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p style={{ fontSize: "0.82rem", color: "#555", fontWeight: 300, lineHeight: 1.7 }}>Use the form for project enquiries, feedback, or collaboration around design and cybersecurity work.</p>
            {[["Name","text","name"],["Email","email","email"]].map(([label, type, key]) => (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#333" }}>{label}</label>
                <input type={type} value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} required placeholder={`Your ${label.toLowerCase()}`}
                  style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", color: "#f0f0f0", padding: "0.75rem 1rem", fontFamily: "inherit", fontSize: "0.875rem", outline: "none" }} />
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#333" }}>Message</label>
              <textarea value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} required placeholder="Your message"
                style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", color: "#f0f0f0", padding: "0.75rem 1rem", fontFamily: "inherit", fontSize: "0.875rem", outline: "none", minHeight: 120, resize: "none" }} />
            </div>
            <button type="submit" style={{ ...btnP, width: "fit-content", opacity: sent ? 0.7 : 1 }}>
              {sent ? "Sent ✓" : "Send Message"}
            </button>
          </form>

          <div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.5rem" }}>Connect With Me</div>
            {[
              ["Email", "Jeremiahibeun@gmail.com", "mailto:Jeremiahibeun@gmail.com"],
              ["Phone", "09128346632 / 08164629393", null],
              ["Location", "Satellite Town, Lagos, Nigeria", null],
            ].map(([lbl, val, href]) => (
              <div key={lbl} style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#333", marginBottom: "0.3rem" }}>{lbl}</div>
                {href ? <a href={href} style={{ fontSize: "0.9rem", color: "#666", textDecoration: "none" }}>{val}</a> : <div style={{ fontSize: "0.9rem", color: "#666" }}>{val}</div>}
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", marginTop: "2rem" }}>
              {[
                ["LinkedIn", "@jeremiah-ibeun", "https://linkedin.com/in/jeremiah-ibeun"],
                ["GitHub", "@bellacrwn", "https://github.com/bellacrwn"],
                ["Instagram", "@bellacrwn", "https://instagram.com/bellacrwn"],
                ["Twitter / X", "@crwnib", "https://x.com/crwnib"],
              ].map(([name, handle, url]) => (
                <a key={name} href={url} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", border: "1px solid #1e1e1e", textDecoration: "none", color: "#666", fontSize: "0.82rem", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#f0f0f0"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.color = "#666"; }}>
                  {name}
                  <span style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#333" }}>{handle}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "1.5rem 3rem", borderTop: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", position: "relative", zIndex: 2 }}>
        <div style={{ fontSize: "0.75rem", color: "#333" }}>© 2026 Jeremiah Ibeun — All rights reserved.</div>
        <div style={{ display: "flex", gap: "2rem" }}>
          {["home","about","portfolio","contact"].map((l) => (
            <button key={l} onClick={() => document.getElementById(l)?.scrollIntoView({ behavior: "smooth" })}
              style={{ background: "none", border: "none", fontSize: "0.75rem", color: "#333", cursor: "pointer", textTransform: "capitalize", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.target.style.color = "#888")} onMouseLeave={(e) => (e.target.style.color = "#333")}>
              {l}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
