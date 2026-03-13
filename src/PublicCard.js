import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const CARD_ID = "main";
const PHIL_DEFAULT = "/phil.jpeg";
const MALOY_DEFAULT = "/maloy.jpeg";

const NAVY = "#1C2B4A";
const GOLD = "#C8A84B";
const CREAM = "#F5F0E8";
const TAN = "#DDD7CD";
const LIGHT_TAN = "#EDE8DE";
const DARK_NAVY = "#152038";
const MID_NAVY = "#203357";
const RED = "#B02A18";
const WHITE = "#FFFFFF";
const DARK_BROWN = "#3A3530";
const MED_BROWN = "#6A5F57";
const GOLD_MUTED = "#E8C86A";
const LIGHT_NAVY_TEXT = "#DDD7CD";
const GOLD_TAG = "#C8A84B";
const LIGHT_BROWN = "#D0C9BC";
const serif = '"Times New Roman", Times, serif';
const body = '"Source Serif 4", "Times New Roman", serif';

const DEFAULT_DATA = {
  header: {
    eyebrow: "2026 Republican Primary",
    title: "Utah\u2019s 3rd Congressional District: Know the Difference",
    tagline: "Who will fight for eastern and southern Utah?",
  },
  left: {
    name: "Phil Lyman",
    role: "Outsider, Our Candidate",
    colHeader: "Phil\u2019s Commitment",
    photo: PHIL_DEFAULT,
  },
  right: {
    name: "Celeste Maloy",
    role: "DC Incumbent, District 2",
    colHeader: "Her Record",
    photo: MALOY_DEFAULT,
  },
  rows: [
    { topic: "Spending", left: { text: "Will demand real cuts, not cosmetic ones. Utah\u2019s 3rd District cannot afford trillion-dollar deficits passed down to our children and grandchildren.", bold: "real cuts, not cosmetic ones" }, right: { text: "Voted to extend the Biden-era spending baseline through multiple continuing resolutions, including a CR that added to the national debt without a single dollar in cuts.", bold: "Biden-era spending baseline" } },
    { topic: "DOGE and Reform", left: { text: "Has championed government accountability and transparency his entire career. Government is too big and unaccountable, full stop.", bold: "government accountability and transparency" }, right: { text: "Publicly signaled concern about DOGE cuts at town halls, drawing applause from frustrated constituents and questioning whether the administration had gone too far.", bold: "concern about DOGE cuts" } },
    { topic: "Social Security", left: { text: "Believes in fiscal responsibility and protecting Social Security\u2019s long-term solvency, not trading short-term popularity for the program\u2019s future.", bold: "fiscal responsibility and protecting Social Security\u2019s long-term solvency" }, right: { text: "Voted YES on the Social Security Fairness Act, a bill the CBO estimates adds $195 billion to the deficit and hastens Social Security insolvency by six months.", bold: "YES on the Social Security Fairness Act" } },
    { topic: "Federal Lands", left: { text: "Led the 2014 Recapture Canyon protest to defend Utah\u2019s right to its own land and paid the price for it. Trump pardoned him. That\u2019s a track record, not a talking point.", bold: "Led the 2014 Recapture Canyon protest" }, right: { text: "Has spoken on federal land issues but built her career inside the DC system: a former congressional staffer hired by Rep. Chris Stewart in 2019.", bold: "a former congressional staffer" } },
    { topic: "Establishment Ties", left: { text: "Not beholden to the DC donor class. Running on volunteer signatures alone, his campaign answers to the voters of the 3rd District, not the establishment.", bold: "Not beholden to the DC donor class" }, right: { text: "Member of the Republican Main Street Caucus, the moderate wing of the party. Endorsed by establishment figures including Reps. Curtis, Moore, and Owens.", bold: "Republican Main Street Caucus" } },
    { topic: "Ballot Access", left: { text: "Wildly popular with Republican delegates, the grassroots activists who know the issues and the candidates. Earning every signature through volunteers.", bold: "Republican delegates" }, right: { text: "Filing through paid signature gathering to bypass the convention process, after losing the 2024 convention to a primary challenger 57% to 43%.", bold: "paid signature gathering" } },
    { topic: "Our District", left: { text: "Born and raised in Blanding: Phil is from this district. He has spent his career fighting for San Juan County and eastern Utah\u2019s way of life.", bold: "Phil is from this district" }, right: { text: "Representing Salt Lake area voters her entire career. The 3rd District\u2019s 17 rural counties are new territory for her.", bold: "are new territory for her" } },
  ],
  footer: "All information sourced from public voting records, GovTrack, Congressional Budget Office analyses, and published news reporting. No claims fabricated or inferred.",
  footerRight: "Phil Lyman for Congress  |  lymanforutah.com",
};

function BoldText({ text, bold, color, boldColor }) {
  if (!bold || !text.includes(bold)) return <span style={{ color }}>{text}</span>;
  const idx = text.indexOf(bold);
  return (
    <>
      {idx > 0 && <span style={{ color }}>{text.slice(0, idx)}</span>}
      <span style={{ color: boldColor, fontWeight: 700 }}>{bold}</span>
      {idx + bold.length < text.length && <span style={{ color }}>{text.slice(idx + bold.length)}</span>}
    </>
  );
}

export default function PublicCard() {
  const [data, setData] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!supabase) { setData(DEFAULT_DATA); return; }
    supabase.from("card_data").select("data").eq("id", CARD_ID).single()
      .then(({ data: row, error }) => {
        setData(!error && row?.data ? row.data : DEFAULT_DATA);
      });
    const channel = supabase.channel("public_card_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "card_data", filter: `id=eq.${CARD_ID}` },
        (payload) => { if (payload.new?.data) setData(payload.new.data); })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const download = async (format) => {
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: null });
      if (format === "png" || format === "jpeg") {
        const link = document.createElement("a");
        link.download = `lyman-vs-maloy.${format}`;
        link.href = canvas.toDataURL(`image/${format}`, 0.95);
        link.click();
      } else if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
        pdf.addImage(imgData, "JPEG", 0, 0, canvas.width / 2, canvas.height / 2);
        pdf.save("lyman-vs-maloy.pdf");
      }
    } catch (e) { console.error(e); }
    setDownloading(false);
  };

  if (!data) return (
    <div style={{ minHeight: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "rgba(255,255,255,0.3)", fontFamily: body, fontSize: 14 }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#111", padding: "16px", fontFamily: body, overflowX: "hidden", maxWidth: "100vw" }}>

      <div style={{ maxWidth: 1040, margin: "0 auto 16px", display: "flex", justifyContent: "flex-start", gap: 8, flexWrap: "wrap" }}>
        {["pdf", "png", "jpeg"].map(fmt => (
          <button key={fmt} onClick={() => download(fmt)} disabled={downloading} style={{
            background: downloading ? "#333" : NAVY, color: downloading ? "#666" : GOLD,
            border: `1px solid ${GOLD}`, padding: "6px 14px", borderRadius: 3,
            cursor: downloading ? "not-allowed" : "pointer", fontSize: 12, fontFamily: body,
            fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase",
          }}>
            {downloading ? "..." : `Download ${fmt.toUpperCase()}`}
          </button>
        ))}
      </div>

      <div id="card" ref={cardRef} style={{ maxWidth: 1040, margin: "0 auto", boxShadow: "0 16px 64px rgba(0,0,0,0.6)" }}>

        <div style={{ background: NAVY, borderBottom: `4px solid ${GOLD}`, padding: "14px 20px" }}>
          <div style={{ fontFamily: body, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: GOLD, marginBottom: 4 }}>{data.header.eyebrow}</div>
          <div style={{ fontFamily: serif, fontSize: "clamp(18px, 3vw, 26px)", fontWeight: 700, color: WHITE, lineHeight: 1.2 }}>{data.header.title}</div>
          <div style={{ fontFamily: body, fontStyle: "italic", fontSize: "clamp(11px, 1.8vw, 13px)", color: "rgba(200,168,75,0.8)", marginTop: 4 }}>{data.header.tagline}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `3px solid ${GOLD}`, columnGap: 4, background: NAVY }}>
          <div style={{ background: TAN, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, minWidth: 0, overflow: "hidden" }}>
            <img src={data.left.photo} alt={data.left.name} style={{ width: 56, height: 68, objectFit: "cover", objectPosition: "top center", flexShrink: 0, display: "block" }} />
            <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
              <div style={{ fontFamily: serif, fontSize: "clamp(14px, 4vw, 28px)", fontWeight: 700, color: "#2A2520", lineHeight: 1.1, wordBreak: "break-word" }}>{data.left.name}</div>
              <div style={{ fontFamily: body, fontStyle: "italic", fontSize: "clamp(9px, 1.5vw, 12px)", color: MED_BROWN, marginTop: 3 }}>{data.left.role}</div>
            </div>
          </div>
          <div style={{ background: DARK_NAVY, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, minWidth: 0, overflow: "hidden" }}>
            <img src={data.right.photo} alt={data.right.name} style={{ width: 56, height: 68, objectFit: "cover", objectPosition: "top center", flexShrink: 0, display: "block" }} />
            <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
              <div style={{ fontFamily: serif, fontSize: "clamp(14px, 4vw, 28px)", fontWeight: 700, color: WHITE, lineHeight: 1.1, wordBreak: "break-word" }}>{data.right.name}</div>
              <div style={{ fontFamily: body, fontStyle: "italic", fontSize: "clamp(9px, 1.5vw, 12px)", color: GOLD, marginTop: 3 }}>{data.right.role}</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `2px solid ${GOLD}`, columnGap: 4, background: NAVY }}>
          <div style={{ background: LIGHT_TAN, padding: "6px 12px" }}>
            <div style={{ fontFamily: body, fontSize: "clamp(7px, 1.2vw, 11px)", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: GOLD }}>{data.left.colHeader}</div>
          </div>
          <div style={{ background: NAVY, padding: "6px 12px" }}>
            <div style={{ fontFamily: body, fontSize: "clamp(7px, 1.2vw, 11px)", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A3A2A" }}>{data.right.colHeader}</div>
          </div>
        </div>

        {data.rows.map((row, i) => {
          const even = i % 2 === 0;
          const leftBg = even ? LIGHT_TAN : CREAM;
          const rightBg = even ? MID_NAVY : NAVY;
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${GOLD}`, columnGap: 4, background: NAVY }}>
              <div style={{ background: leftBg, padding: "8px 12px" }}>
                <div style={{ display: "inline-block", fontFamily: body, fontSize: "clamp(7px, 1vw, 9px)", fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", background: LIGHT_BROWN, color: "#5A4F47", padding: "1px 5px", marginBottom: 4, borderRadius: 2 }}>{row.topic}</div>
                <div style={{ fontFamily: body, fontSize: "clamp(10px, 1.5vw, 12px)", lineHeight: 1.5, color: DARK_BROWN }}>
                  <BoldText text={row.left.text} bold={row.left.bold} color={DARK_BROWN} boldColor={RED} />
                </div>
              </div>
              <div style={{ background: rightBg, padding: "8px 12px" }}>
                <div style={{ display: "inline-block", fontFamily: body, fontSize: "clamp(7px, 1vw, 9px)", fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", background: "rgba(200,168,75,0.15)", color: GOLD_TAG, padding: "1px 5px", marginBottom: 4, borderRadius: 2 }}>{row.topic}</div>
                <div style={{ fontFamily: body, fontSize: "clamp(10px, 1.5vw, 12px)", lineHeight: 1.5, color: LIGHT_NAVY_TEXT }}>
                  <BoldText text={row.right.text} bold={row.right.bold} color={LIGHT_NAVY_TEXT} boldColor={GOLD_MUTED} />
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ background: NAVY, borderTop: `4px solid ${GOLD}`, padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontFamily: body, fontStyle: "italic", fontSize: "clamp(9px, 1.2vw, 10px)", color: "rgba(255,255,255,0.35)", flex: 1, minWidth: 0 }}>{data.footer}</div>
          <div style={{ fontFamily: serif, fontSize: "clamp(10px, 1.5vw, 12px)", fontWeight: 700, color: GOLD, whiteSpace: "nowrap" }}>{data.footerRight}</div>
        </div>

      </div>

      <style>{`
        @media print {
          @page { size: 11in 8.5in; margin: 0.25in; }
          html, body { width: 11in; height: 8.5in; margin: 0 !important; padding: 0 !important; background: white !important; overflow: hidden !important; }
          #root { width: 11in; height: 8.5in; overflow: hidden !important; }
          #root > div { padding: 0 !important; background: white !important; height: 8.5in !important; width: 11in !important; overflow: hidden !important; }
          #card { width: 10.5in !important; max-width: 10.5in !important; box-shadow: none !important; margin: 0 auto !important; overflow: hidden !important; transform-origin: top center; transform: scale(0.98); }
          #card * { page-break-inside: avoid !important; break-inside: avoid !important; }
        }
      `}</style>
    </div>
  );
}
