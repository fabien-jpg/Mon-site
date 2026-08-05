import React, { useState, useMemo } from "react";
import { ArrowLeft, Home, Ruler, Percent } from "lucide-react";

/* ---------------------------------------------------------
   TOKENS
--------------------------------------------------------- */
const C = {
  ink: "#16232B",
  inkSoft: "#22343D",
  paper: "#EAE2D0",
  card: "#F7F2E6",
  cardDark: "#20313A",
  brass: "#AE8A4E",
  brassLight: "#CBA96C",
  forest: "#33513E",
  forestSoft: "#4A6B54",
  rust: "#9C4A34",
  slate: "#5F6E75",
  line: "rgba(22,35,43,0.16)",
  lineLight: "rgba(247,242,230,0.22)",
};

const fmtEUR = (n) =>
  (isFinite(n) ? n : 0).toLocaleString("fr-FR", {
    maximumFractionDigits: 0,
  }) + " €";
const fmtPct = (n) =>
  (isFinite(n) ? n : 0).toLocaleString("fr-FR", {
    maximumFractionDigits: 2,
  }) + " %";

/* ---------------------------------------------------------
   GLOBAL STYLE
--------------------------------------------------------- */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

    .srl-root { font-family: 'Inter', sans-serif; color: ${C.ink}; }
    .srl-display { font-family: 'Fraunces', serif; }
    .srl-mono { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
    .srl-root * { box-sizing: border-box; }
    .srl-root input[type=number]::-webkit-outer-spin-button,
    .srl-root input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    .srl-root input[type=number] { -moz-appearance: textfield; }
    .srl-scroll::-webkit-scrollbar { width: 6px; }
    .srl-scroll::-webkit-scrollbar-thumb { background: ${C.brass}; border-radius: 4px; }

    .srl-field:focus-within .srl-field-label { color: ${C.brass}; }
    .srl-input:focus { outline: none; border-bottom-color: ${C.brass} !important; }

    .srl-card-hover { transition: transform .35s cubic-bezier(.2,.7,.3,1), box-shadow .35s ease, border-color .35s ease; }
    .srl-card-hover:hover { transform: translateY(-4px); border-color: ${C.brass}; box-shadow: 0 18px 40px -18px rgba(22,35,43,0.45); }

    .srl-btn { transition: background .25s ease, color .25s ease, transform .15s ease; }
    .srl-btn:hover { background: ${C.brassLight}; }
    .srl-btn:active { transform: scale(0.98); }

    @media (prefers-reduced-motion: reduce) {
      .srl-card-hover, .srl-btn { transition: none !important; }
    }
  `}</style>
);

/* ---------------------------------------------------------
   SMALL DECORATIVE HOUSE LINE MARK
--------------------------------------------------------- */
const PlanMark = ({ size = 46, stroke = C.brass }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path
      d="M6 24 L24 8 L42 24"
      stroke={stroke}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 21 V40 H37 V21"
      stroke={stroke}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M21 40 V29 H27 V40" stroke={stroke} strokeWidth="1.4" />
    <circle cx="24" cy="8" r="1.6" fill={stroke} />
  </svg>
);

/* ---------------------------------------------------------
   GAUGE — rentabilité nette, style cadran d'arpenteur
--------------------------------------------------------- */
function Gauge({ value, min = 0, max = 12, label = "Rentabilité nette" }) {
  const clamped = Math.max(min, Math.min(max, isFinite(value) ? value : 0));
  const pct = (clamped - min) / (max - min);
  const angle = -90 + pct * 180; // -90 -> 90
  const zones = [
    { to: 2, color: C.rust },
    { to: 5, color: C.brass },
    { to: 8, color: C.forestSoft },
    { to: 12, color: C.forest },
  ];

  const polarToXY = (cx, cy, r, deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };

  const arcs = [];
  let prev = min;
  zones.forEach((z, i) => {
    const a1 = -90 + ((prev - min) / (max - min)) * 180;
    const a2 = -90 + ((Math.min(z.to, max) - min) / (max - min)) * 180;
    const [x1, y1] = polarToXY(60, 60, 46, a1);
    const [x2, y2] = polarToXY(60, 60, 46, a2);
    const large = a2 - a1 > 180 ? 1 : 0;
    arcs.push(
      <path
        key={i}
        d={`M ${x1} ${y1} A 46 46 0 ${large} 1 ${x2} ${y2}`}
        stroke={z.color}
        strokeWidth="7"
        fill="none"
        strokeLinecap="butt"
        opacity="0.9"
      />
    );
    prev = z.to;
  });

  return (
    <div style={{ textAlign: "center" }}>
      <svg width="150" height="92" viewBox="0 0 120 70">
        <g>{arcs}</g>
        <line
          x1="60"
          y1="60"
          x2={60 + 40 * Math.sin((angle * Math.PI) / 180)}
          y2={60 - 40 * Math.cos((angle * Math.PI) / 180)}
          stroke={C.ink}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="60" cy="60" r="3.5" fill={C.ink} />
        <circle cx="60" cy="60" r="1.3" fill={C.brassLight} />
      </svg>
      <div
        className="srl-mono"
        style={{ fontSize: 26, fontWeight: 600, marginTop: -6, color: C.ink }}
      >
        {fmtPct(value)}
      </div>
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: C.slate,
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   FORM PRIMITIVES
--------------------------------------------------------- */
function Section({ index, title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          marginBottom: 14,
          borderBottom: `1px solid ${C.line}`,
          paddingBottom: 8,
        }}
      >
        <span
          className="srl-mono"
          style={{ fontSize: 12, color: C.brass, letterSpacing: "0.05em" }}
        >
          {index}
        </span>
        <h3
          className="srl-display"
          style={{ fontSize: 17, fontWeight: 600, margin: 0, color: C.ink }}
        >
          {title}
        </h3>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "18px 24px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, suffix = "€" }) {
  // Cases numériques : saisie libre en texte (virgule ou point) pour ne
  // jamais perdre la décimale en cours de frappe, avec resynchronisation
  // uniquement si la valeur change depuis l'extérieur (ex: réinitialisation).
  const [text, setText] = useState(String(value).replace(".", ","));

  React.useEffect(() => {
    const normalizedText = text.replace(",", ".");
    const parsedText = parseFloat(normalizedText);
    if (parsedText !== value) {
      setText(String(value).replace(".", ","));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e) => {
    let raw = e.target.value;
    raw = raw.replace(/[^0-9,.-]/g, "");
    // une seule virgule/point autorisé
    const firstSep = raw.search(/[,.]/);
    if (firstSep !== -1) {
      raw =
        raw.slice(0, firstSep + 1) +
        raw.slice(firstSep + 1).replace(/[,.]/g, "");
    }
    setText(raw);
    const normalized = raw.replace(",", ".");
    const parsed = parseFloat(normalized);
    onChange(isNaN(parsed) ? 0 : parsed);
  };

  return (
    <label className="srl-field" style={{ display: "block" }}>
      <div
        className="srl-field-label"
        style={{
          fontSize: 11.5,
          color: C.slate,
          marginBottom: 6,
          letterSpacing: "0.02em",
          transition: "color .2s ease",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <input
          className="srl-input srl-mono"
          type="text"
          inputMode="decimal"
          value={text}
          onChange={handleChange}
          placeholder="0"
          style={{
            width: "100%",
            border: "none",
            borderBottom: `1.5px solid ${C.line}`,
            background: "transparent",
            padding: "4px 0",
            fontSize: 17,
            fontWeight: 500,
            color: C.ink,
          }}
        />
        <span style={{ fontSize: 12.5, color: C.slate, whiteSpace: "nowrap" }}>
          {suffix}
        </span>
      </div>
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="srl-field" style={{ display: "block" }}>
      <div
        className="srl-field-label"
        style={{
          fontSize: 11.5,
          color: C.slate,
          marginBottom: 6,
          letterSpacing: "0.02em",
          transition: "color .2s ease",
        }}
      >
        {label}
      </div>
      <select
        className="srl-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          border: "none",
          borderBottom: `1.5px solid ${C.line}`,
          background: "transparent",
          padding: "6px 0",
          fontSize: 14.5,
          fontWeight: 500,
          color: C.ink,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatRow({ label, value, strong, tone }) {
  const color =
    tone === "pos" ? C.forest : tone === "neg" ? C.rust : C.ink;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "9px 0",
        borderBottom: `1px solid ${C.lineLight}`,
      }}
    >
      <span style={{ fontSize: 13, color: "rgba(247,242,230,0.72)" }}>
        {label}
      </span>
      <span
        className="srl-mono"
        style={{
          fontSize: strong ? 18 : 14.5,
          fontWeight: strong ? 600 : 500,
          color: strong ? (tone ? color : C.brassLight) : "#F7F2E6",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function loanPayment(capital, annualRate, years) {
  const n = years * 12;
  if (n <= 0) return 0;
  const i = annualRate / 100 / 12;
  if (i === 0) return capital / n;
  return (capital * i) / (1 - Math.pow(1 + i, -n));
}

/* ---------------------------------------------------------
   HOME
--------------------------------------------------------- */
function HomeScreen({ onPick }) {
  return (
    <div
      style={{
        minHeight: "100%",
        background: C.paper,
        padding: "56px 24px 64px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <PlanMark />
          </div>
          <div
            className="srl-mono"
            style={{
              fontSize: 11.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.brass,
              marginBottom: 10,
            }}
          >
            Investissement immobilier locatif
          </div>
          <h1
            className="srl-display"
            style={{
              fontSize: "clamp(28px, 4.5vw, 42px)",
              fontWeight: 600,
              margin: 0,
              color: C.ink,
              lineHeight: 1.15,
            }}
          >
            Simulateur de rentabilité
          </h1>
          <p
            style={{
              color: C.slate,
              fontSize: 15,
              maxWidth: 480,
              margin: "14px auto 0",
              lineHeight: 1.5,
            }}
          >
            Choisissez votre dossier : une estimation rapide, ou une analyse
            complète avec financement et fiscalité.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          <button
            onClick={() => onPick("simple")}
            className="srl-card-hover"
            style={{
              textAlign: "left",
              cursor: "pointer",
              background: C.card,
              border: `1px solid ${C.line}`,
              borderRadius: 4,
              padding: "30px 28px",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <span
                className="srl-mono"
                style={{ fontSize: 11, color: C.brass, letterSpacing: "0.08em" }}
              >
                DOSSIER 01
              </span>
              <Percent size={20} color={C.brass} strokeWidth={1.6} />
            </div>
            <h2
              className="srl-display"
              style={{
                fontSize: 24,
                fontWeight: 600,
                margin: "16px 0 8px",
                color: C.ink,
              }}
            >
              Simulateur simple
            </h2>
            <p style={{ fontSize: 13.5, color: C.slate, lineHeight: 1.55, margin: 0 }}>
              Prix, loyer, charges essentielles et crédit. Rentabilité brute,
              nette et cash-flow mensuel en quelques champs.
            </p>
            <div
              style={{
                marginTop: 20,
                fontSize: 12.5,
                color: C.forest,
                fontWeight: 600,
              }}
            >
              Ouvrir le dossier →
            </div>
          </button>

          <button
            onClick={() => onPick("advanced")}
            className="srl-card-hover"
            style={{
              textAlign: "left",
              cursor: "pointer",
              background: C.ink,
              border: `1px solid ${C.ink}`,
              borderRadius: 4,
              padding: "30px 28px",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <span
                className="srl-mono"
                style={{
                  fontSize: 11,
                  color: C.brassLight,
                  letterSpacing: "0.08em",
                }}
              >
                DOSSIER 02
              </span>
              <Ruler size={20} color={C.brassLight} strokeWidth={1.6} />
            </div>
            <h2
              className="srl-display"
              style={{
                fontSize: 24,
                fontWeight: 600,
                margin: "16px 0 8px",
                color: "#F7F2E6",
              }}
            >
              Simulateur avancé
            </h2>
            <p
              style={{
                fontSize: 13.5,
                color: "rgba(247,242,230,0.68)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Financement détaillé, régime fiscal (micro-foncier, réel,
              LMNP), TMI et cash-flow net d'impôt.
            </p>
            <div
              style={{
                marginTop: 20,
                fontSize: 12.5,
                color: C.brassLight,
                fontWeight: 600,
              }}
            >
              Ouvrir le dossier →
            </div>
          </button>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 11.5,
            color: C.slate,
            marginTop: 40,
          }}
        >
          Estimations indicatives — ne remplacent pas l'avis d'un professionnel
          (notaire, expert-comptable, conseiller en gestion de patrimoine).
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   HEADER (shared by both simulators)
--------------------------------------------------------- */
function ToolHeader({ title, onBack }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "20px 28px",
        borderBottom: `1px solid ${C.line}`,
        background: C.card,
      }}
    >
      <button
        onClick={onBack}
        className="srl-btn"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "transparent",
          border: `1px solid ${C.line}`,
          borderRadius: 3,
          padding: "6px 10px",
          cursor: "pointer",
          fontSize: 12.5,
          color: C.ink,
        }}
      >
        <ArrowLeft size={14} /> Retour
      </button>
      <div style={{ width: 1, height: 20, background: C.line }} />
      <h2
        className="srl-display"
        style={{ fontSize: 18, fontWeight: 600, margin: 0, color: C.ink }}
      >
        {title}
      </h2>
    </div>
  );
}

/* ---------------------------------------------------------
   SIMPLE SIMULATOR
--------------------------------------------------------- */
function SimpleSimulator({ onBack }) {
  const [prix, setPrix] = useState(180000);
  const [notairePct, setNotairePct] = useState(7.5);
  const [travaux, setTravaux] = useState(8000);
  const [loyer, setLoyer] = useState(750);
  const [charges, setCharges] = useState(1800);
  const [vacance, setVacance] = useState(5);
  const [apport, setApport] = useState(20000);
  const [taux, setTaux] = useState(3.6);
  const [duree, setDuree] = useState(20);

  const computeResult = () => {
    const coutTotal = prix * (1 + notairePct / 100) + travaux;
    const loyerAnnuelBrut = loyer * 12;
    const loyerAnnuelEffectif = loyerAnnuelBrut * (1 - vacance / 100);
    const rentabiliteBrute = (loyerAnnuelBrut / coutTotal) * 100;
    const rentabiliteNette =
      ((loyerAnnuelEffectif - charges) / coutTotal) * 100;
    const emprunt = Math.max(0, coutTotal - apport);
    const mensualite = loanPayment(emprunt, taux, duree);
    const cashflowMensuel =
      (loyerAnnuelEffectif - charges) / 12 - mensualite;
    return {
      coutTotal,
      loyerAnnuelBrut,
      loyerAnnuelEffectif,
      rentabiliteBrute,
      rentabiliteNette,
      emprunt,
      mensualite,
      cashflowMensuel,
    };
  };

  const [r, setR] = useState(null);
  const handleCalculer = () => setR(computeResult());

  return (
    <div style={{ minHeight: "100%", background: C.paper }}>
      <ToolHeader title="Simulateur simple" onBack={onBack} />
      <div
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          padding: "32px 24px 64px",
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: 28,
        }}
      >
        <div
          className="srl-scroll"
          style={{
            background: C.card,
            border: `1px solid ${C.line}`,
            borderRadius: 4,
            padding: "26px 26px 8px",
          }}
        >
          <Section index="01" title="Acquisition">
            <Field label="Prix d'achat" value={prix} onChange={setPrix} step={1000} />
            <Field
              label="Frais de notaire"
              value={notairePct}
              onChange={setNotairePct}
              suffix="%"
              step={0.1}
            />
            <Field label="Travaux / rénovation" value={travaux} onChange={setTravaux} step={500} />
          </Section>

          <Section index="02" title="Location">
            <Field label="Loyer mensuel (hors charges)" value={loyer} onChange={setLoyer} step={10} />
            <Field
              label="Charges annuelles (copro, taxe foncière, assurance)"
              value={charges}
              onChange={setCharges}
              step={50}
            />
            <Field
              label="Vacance locative estimée"
              value={vacance}
              onChange={setVacance}
              suffix="%"
              step={0.5}
            />
          </Section>

          <Section index="03" title="Financement">
            <Field label="Apport personnel" value={apport} onChange={setApport} step={1000} />
            <Field label="Taux du crédit" value={taux} onChange={setTaux} suffix="%" step={0.05} />
            <Field label="Durée du crédit" value={duree} onChange={setDuree} suffix="ans" step={1} />
          </Section>

          <button
            onClick={handleCalculer}
            className="srl-btn"
            style={{
              width: "100%",
              background: C.brass,
              color: "#F7F2E6",
              border: "none",
              borderRadius: 3,
              padding: "13px 0",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.04em",
              cursor: "pointer",
              margin: "6px 0 26px",
            }}
          >
            Calculer
          </button>
        </div>

        <div
          style={{
            background: C.ink,
            borderRadius: 4,
            padding: "28px 26px",
            height: "fit-content",
            position: "sticky",
            top: 20,
          }}
        >
          <div
            className="srl-mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.1em",
              color: C.brassLight,
              marginBottom: 6,
            }}
          >
            RÉSULTAT
          </div>
          {!r ? (
            <p
              style={{
                fontSize: 13,
                color: "rgba(247,242,230,0.62)",
                lineHeight: 1.6,
                marginTop: 18,
              }}
            >
              Renseignez les champs puis cliquez sur « Calculer » pour
              afficher la rentabilité et le cash-flow.
            </p>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "center", margin: "6px 0 10px" }}>
                <Gauge value={r.rentabiliteNette} label="Rentabilité nette" />
              </div>
              <StatRow label="Coût total de l'opération" value={fmtEUR(r.coutTotal)} />
              <StatRow label="Rentabilité brute" value={fmtPct(r.rentabiliteBrute)} />
              <StatRow label="Loyer annuel effectif" value={fmtEUR(r.loyerAnnuelEffectif)} />
              <StatRow label="Emprunt" value={fmtEUR(r.emprunt)} />
              <StatRow label="Mensualité de crédit" value={fmtEUR(r.mensualite)} />
              <StatRow
                label="Cash-flow mensuel"
                value={(r.cashflowMensuel >= 0 ? "+" : "") + fmtEUR(r.cashflowMensuel)}
                strong
                tone={r.cashflowMensuel >= 0 ? "pos" : "neg"}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   ADVANCED SIMULATOR
--------------------------------------------------------- */
const REGIMES = [
  { value: "micro-foncier", label: "Location nue — Micro-foncier" },
  { value: "reel-foncier", label: "Location nue — Régime réel" },
  { value: "lmnp-micro", label: "LMNP — Micro-BIC" },
  { value: "lmnp-reel", label: "LMNP — Régime réel" },
];

function AdvancedSimulator({ onBack }) {
  const [prix, setPrix] = useState(210000);
  const [notairePct, setNotairePct] = useState(7.5);
  const [travaux, setTravaux] = useState(15000);
  const [fraisAgencePct, setFraisAgencePct] = useState(0);

  const [loyer, setLoyer] = useState(880);
  const [vacance, setVacance] = useState(5);

  const [taxeFonciere, setTaxeFonciere] = useState(1100);
  const [chargesCopro, setChargesCopro] = useState(900);
  const [assurancePNO, setAssurancePNO] = useState(150);
  const [gestionPct, setGestionPct] = useState(7);
  const [provisionEntretienPct, setProvisionEntretienPct] = useState(3);

  const [apport, setApport] = useState(25000);
  const [taux, setTaux] = useState(3.5);
  const [duree, setDuree] = useState(20);
  const [assuranceEmpruntPct, setAssuranceEmpruntPct] = useState(0.34);

  const [regime, setRegime] = useState("micro-foncier");
  const [tmi, setTmi] = useState(30);

  const computeResult = () => {
    const coutTotal =
      prix * (1 + notairePct / 100 + fraisAgencePct / 100) + travaux;
    const loyerAnnuelBrut = loyer * 12;
    const loyerAnnuelEffectif = loyerAnnuelBrut * (1 - vacance / 100);

    const fraisGestionAnnuel = loyerAnnuelEffectif * (gestionPct / 100);
    const provisionEntretienAnnuelle = loyerAnnuelBrut * (provisionEntretienPct / 100);

    const chargesCourantes =
      taxeFonciere +
      chargesCopro +
      assurancePNO +
      fraisGestionAnnuel +
      provisionEntretienAnnuelle;

    const emprunt = Math.max(0, coutTotal - apport);
    const mensualiteCredit = loanPayment(emprunt, taux, duree);
    const assuranceEmpruntAnnuelle = emprunt * (assuranceEmpruntPct / 100);
    const mensualiteTotale = mensualiteCredit + assuranceEmpruntAnnuelle / 12;

    const totalInterets =
      mensualiteCredit * duree * 12 - emprunt > 0
        ? mensualiteCredit * duree * 12 - emprunt
        : 0;
    const interetsAnnuelsMoyens = duree > 0 ? totalInterets / duree : 0;

    const rentabiliteBrute = (loyerAnnuelBrut / coutTotal) * 100;
    const rentabiliteNette =
      ((loyerAnnuelEffectif - chargesCourantes) / coutTotal) * 100;

    // ---- Fiscalité (estimation simplifiée) ----
    const chargesDeductiblesFoncier =
      chargesCourantes + interetsAnnuelsMoyens + assuranceEmpruntAnnuelle;
    let revenuImposable = 0;
    let impot = 0;
    const psRate = 0.172;

    if (regime === "micro-foncier") {
      revenuImposable = loyerAnnuelEffectif * (1 - 0.3);
      impot = revenuImposable * (tmi / 100 + psRate);
    } else if (regime === "reel-foncier") {
      revenuImposable = loyerAnnuelEffectif - chargesDeductiblesFoncier;
      if (revenuImposable >= 0) {
        impot = revenuImposable * (tmi / 100 + psRate);
      } else {
        const deficitImputable = Math.min(-revenuImposable, 10700);
        impot = -(deficitImputable * (tmi / 100));
        revenuImposable = 0;
      }
    } else if (regime === "lmnp-micro") {
      revenuImposable = loyerAnnuelEffectif * (1 - 0.5);
      impot = revenuImposable * (tmi / 100 + psRate);
    } else if (regime === "lmnp-reel") {
      const amortissementEstime = prix * 0.025; // approximation hors terrain
      revenuImposable = Math.max(
        0,
        loyerAnnuelEffectif - chargesDeductiblesFoncier - amortissementEstime
      );
      impot = revenuImposable * (tmi / 100 + psRate);
    }

    const cashflowAvantImpotMensuel =
      (loyerAnnuelEffectif - chargesCourantes) / 12 - mensualiteTotale;
    const cashflowApresImpotMensuel = cashflowAvantImpotMensuel - impot / 12;

    const rentabiliteNetteNette =
      ((loyerAnnuelEffectif - chargesCourantes - impot) / coutTotal) * 100;

    return {
      coutTotal,
      loyerAnnuelBrut,
      loyerAnnuelEffectif,
      chargesCourantes,
      emprunt,
      mensualiteTotale,
      rentabiliteBrute,
      rentabiliteNette,
      revenuImposable,
      impot,
      cashflowAvantImpotMensuel,
      cashflowApresImpotMensuel,
      rentabiliteNetteNette,
    };
  };

  const [r, setR] = useState(null);
  const handleCalculer = () => setR(computeResult());

  return (
    <div style={{ minHeight: "100%", background: C.paper }}>
      <ToolHeader title="Simulateur avancé" onBack={onBack} />
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "32px 24px 64px",
          display: "grid",
          gridTemplateColumns: "1.35fr 1fr",
          gap: 28,
        }}
      >
        <div
          className="srl-scroll"
          style={{
            background: C.card,
            border: `1px solid ${C.line}`,
            borderRadius: 4,
            padding: "26px 26px 8px",
          }}
        >
          <Section index="01" title="Acquisition">
            <Field label="Prix d'achat" value={prix} onChange={setPrix} step={1000} />
            <Field label="Frais de notaire" value={notairePct} onChange={setNotairePct} suffix="%" step={0.1} />
            <Field label="Frais d'agence (achat)" value={fraisAgencePct} onChange={setFraisAgencePct} suffix="%" step={0.5} />
            <Field label="Travaux / rénovation" value={travaux} onChange={setTravaux} step={500} />
          </Section>

          <Section index="02" title="Location">
            <Field label="Loyer mensuel (hors charges)" value={loyer} onChange={setLoyer} step={10} />
            <Field label="Vacance locative estimée" value={vacance} onChange={setVacance} suffix="%" step={0.5} />
          </Section>

          <Section index="03" title="Charges propriétaire">
            <Field label="Taxe foncière (annuelle)" value={taxeFonciere} onChange={setTaxeFonciere} step={50} />
            <Field label="Charges de copropriété (annuelles)" value={chargesCopro} onChange={setChargesCopro} step={50} />
            <Field label="Assurance PNO (annuelle)" value={assurancePNO} onChange={setAssurancePNO} step={10} />
            <Field label="Frais de gestion locative" value={gestionPct} onChange={setGestionPct} suffix="%" step={0.5} />
            <Field label="Provision entretien" value={provisionEntretienPct} onChange={setProvisionEntretienPct} suffix="%" step={0.5} />
          </Section>

          <Section index="04" title="Financement">
            <Field label="Apport personnel" value={apport} onChange={setApport} step={1000} />
            <Field label="Taux du crédit" value={taux} onChange={setTaux} suffix="%" step={0.05} />
            <Field label="Durée du crédit" value={duree} onChange={setDuree} suffix="ans" step={1} />
            <Field label="Assurance emprunteur" value={assuranceEmpruntPct} onChange={setAssuranceEmpruntPct} suffix="%/an" step={0.01} />
          </Section>

          <Section index="05" title="Fiscalité">
            <Select label="Régime fiscal" value={regime} onChange={setRegime} options={REGIMES} />
            <Field label="Tranche marginale d'imposition" value={tmi} onChange={setTmi} suffix="%" step={1} />
          </Section>

          <button
            onClick={handleCalculer}
            className="srl-btn"
            style={{
              width: "100%",
              background: C.brass,
              color: "#F7F2E6",
              border: "none",
              borderRadius: 3,
              padding: "13px 0",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.04em",
              cursor: "pointer",
              margin: "6px 0 26px",
            }}
          >
            Calculer
          </button>
        </div>

        <div
          style={{
            background: C.ink,
            borderRadius: 4,
            padding: "28px 26px",
            height: "fit-content",
            position: "sticky",
            top: 20,
          }}
        >
          <div
            className="srl-mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.1em",
              color: C.brassLight,
              marginBottom: 6,
            }}
          >
            RÉSULTAT
          </div>
          {!r ? (
            <p
              style={{
                fontSize: 13,
                color: "rgba(247,242,230,0.62)",
                lineHeight: 1.6,
                marginTop: 18,
              }}
            >
              Renseignez les champs puis cliquez sur « Calculer » pour
              afficher la rentabilité, la fiscalité et le cash-flow.
            </p>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "center", margin: "6px 0 10px" }}>
                <Gauge value={r.rentabiliteNette} label="Rentabilité nette de charges" />
              </div>
              <StatRow label="Coût total de l'opération" value={fmtEUR(r.coutTotal)} />
              <StatRow label="Rentabilité brute" value={fmtPct(r.rentabiliteBrute)} />
              <StatRow label="Charges annuelles totales" value={fmtEUR(r.chargesCourantes)} />
              <StatRow label="Emprunt" value={fmtEUR(r.emprunt)} />
              <StatRow label="Mensualité (crédit + assurance)" value={fmtEUR(r.mensualiteTotale)} />
              <StatRow label="Revenu imposable estimé" value={fmtEUR(r.revenuImposable)} />
              <StatRow
                label="Impôt + prélèvements sociaux (an.)"
                value={fmtEUR(r.impot)}
                tone={r.impot < 0 ? "pos" : undefined}
              />
              <StatRow
                label="Rentabilité nette-nette"
                value={fmtPct(r.rentabiliteNetteNette)}
              />
              <StatRow
                label="Cash-flow mensuel avant impôt"
                value={(r.cashflowAvantImpotMensuel >= 0 ? "+" : "") + fmtEUR(r.cashflowAvantImpotMensuel)}
              />
              <StatRow
                label="Cash-flow mensuel après impôt"
                value={(r.cashflowApresImpotMensuel >= 0 ? "+" : "") + fmtEUR(r.cashflowApresImpotMensuel)}
                strong
                tone={r.cashflowApresImpotMensuel >= 0 ? "pos" : "neg"}
              />
              <p
                style={{
                  fontSize: 10.5,
                  color: "rgba(247,242,230,0.5)",
                  lineHeight: 1.5,
                  marginTop: 16,
                }}
              >
                Estimation simplifiée (intérêts moyennés sur la durée du
                prêt, amortissement LMNP forfaitaire). Ne constitue pas un
                conseil fiscal.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   APP
--------------------------------------------------------- */
export default function App() {
  const [view, setView] = useState("home");

  return (
    <div className="srl-root" style={{ minHeight: "100vh", background: C.paper }}>
      <GlobalStyle />
      {view === "home" && <HomeScreen onPick={setView} />}
      {view === "simple" && <SimpleSimulator onBack={() => setView("home")} />}
      {view === "advanced" && <AdvancedSimulator onBack={() => setView("home")} />}
    </div>
  );
}
