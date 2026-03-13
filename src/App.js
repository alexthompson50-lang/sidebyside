import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "./supabase";

const CARD_ID = "main";
const EDIT_PASSWORD = process.env.REACT_APP_EDIT_PASSWORD || "";
const SESSION_KEY = "lyman_editor_unlocked";
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

function PhotoSlot({ src, onUpload, editMode }) {
  const inputRef = useRef(null);
  const [hover, setHover] = useState(false);
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpload(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div
      style={{ position: "relative", width: 80, height: 96, flexShrink: 0, cursor: editMode ? "pointer" : "default" }}
      onClick={editMode ? () => inputRef.current.click() : undefined}
      onMouseEnter={() => editMode && setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }} />
      {editMode && hover && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontFamily: body }}>
          Click to replace
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
    </div>
  );
}

function PasswordGate({ onUnlock }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const attempt = () => {
    if (input === EDIT_PASSWORD) { sessionStorage.setItem(SESSION_KEY, "1"); onUnlock(); }
    else { setError(true); setInput(""); setTimeout(() => setError(false), 2000); }
  };
  return (
    <div style={{ minHeight: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: body }}>
      <div style={{ background: NAVY, padding: "48px 40px", borderRadius: 6, boxShadow: "0 16px 64px rgba(0,0,0,0.6)", border: `2px solid ${GOLD}`, width: 360, textAlign: "center" }}>
        <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Editor Access</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 28 }}>Enter the edit password to continue.</div>
        <input type="password" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && attempt()} placeholder="Password" autoFocus
          style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 3, border: error ? "2px solid #e06060" : `2px solid ${GOLD}`, background: "#0d1829", color: "#fff", outline: "none", fontFamily: body, boxSizing: "border-box", marginBottom: 12 }} />
        {error && <div style={{ color: "#e06060", fontSize: 12, marginBottom: 10 }}>Incorrect password.</div>}
        <button onClick={attempt} style={{ width: "100%", padding: "10px", background: GOLD, color: NAVY, border: "none", borderRadius: 3, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: body }}>Unlock Editor</button>
      </div>
    </div>
  );
}

function EditModal({ field, value, multiline, onSave, onClose }) {
  const [draft, setDraft] = useState(value);
  const ref = useRef(null);
  useEffect(() => { ref.current && ref.current.focus(); }, []);
  const save = () => { onSave(draft); onClose(); };
  const onKey = (e) => {
    if (!multiline && e.key === "Enter") { e.preventDefault(); save(); }
    if (e.key === "Escape") onClose();
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: NAVY, border: `2px solid ${GOLD}`, borderRadius: 6, padding: 24, width: 520, boxShadow: "0 16px 64px rgba(0,0,0,0.8)" }}>
        <div style={{ fontFamily: body, fontSize: 11, color: GOLD, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>Editing: {field}</div>
        {multiline ? (
          <textarea ref={ref} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={onKey} rows={5}
            style={{ width: "100%", background: "#0d1829", color: "#fff", border: `1px solid ${GOLD}`, borderRadius: 3, padding: "10px", fontSize: 13, fontFamily: body, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
        ) : (
          <input ref={ref} type="text" value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={onKey}
            style={{ width: "100%", background: "#0d1829", color: "#fff", border: `1px solid ${GOLD}`, borderRadius: 3, padding: "10px", fontSize: 13, fontFamily: body, outline: "none", boxSizing: "border-box" }} />
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "7px 18px", background: "transparent", color: "#aaa", border: "1px solid #555", borderRadius: 3, cursor: "pointer", fontFamily: body, fontSize: 12 }}>Cancel</button>
          <button onClick={save} style={{ padding: "7px 18px", background: GOLD, color: NAVY, border: "none", borderRadius: 3, cursor: "pointer", fontFamily: body, fontSize: 12, fontWeight: 700 }}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(() => !EDIT_PASSWORD || sessionStorage.getItem(SESSION_KEY) === "1");
  const [data, setData] = useState(DEFAULT_DATA);
  const [editMode, setEditMode] = useState(true);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [modal, setModal] = useState(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("card_data").select("data").eq("id", CARD_ID).single()
      .then(({ data: row, error }) => { if (!error && row?.data) setData(row.data); });
    const channel = supabase.channel("card_data_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "card_data", filter: `id=eq.${CARD_ID}` },
        (payload) => { if (payload.new?.data) setData(payload.new.data); })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const saveToSupabase = useCallback((newData) => {
    if (!supabase) return;
    clearTimeout(saveTimer.current);
    setSyncStatus("saving");
    saveTimer.current = setTimeout(async () => {
      const { error } = await supabase.from("card_data").upsert({ id: CARD_ID, data: newData, updated_at: new Date().toISOString() });
      setSyncStatus(error ? "error" : "saved");
      setTimeout(() => setSyncStatus("idle"), 2000);
    }, 800);
  }, []);

  const set = useCallback((path, value) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      saveToSupabase(next);
      return next;
    });
  }, [saveToSupabase]);

  const setRow = useCallback((i, side, field, value) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.rows[i][side][field] = value;
      saveToSupabase(next);
      return next;
    });
  }, [saveToSupabase]);

  const openModal = (label, value, onSave, multiline = false) => {
    setModal({ label, value, multiline, onSave });
  };

  const E = (label, value, onSave, multiline = false) => {
    if (!editMode) return <span>{value}</span>;
    return (
      <span onClick={() => openModal(label, value, onSave, multiline)} title="Click to edit"
        style={{ cursor: "pointer", borderBottom: "1px dashed rgba(200,168,75,0.5)" }}>
        {value}
      </span>
    );
  };

  const addRow = () => {
    setData(prev => {
      const next = { ...prev, rows: [...prev.rows, { topic: "New Topic", left: { text: "Enter commitment here.", bold: "" }, right: { text: "Enter record here.", bold: "" } }] };
      saveToSupabase(next);
      return next;
    });
  };

  const removeRow = (i) => {
    setData(prev => {
      const next = { ...prev, rows: prev.rows.filter((_, idx) => idx !== i) };
      saveToSupabase(next);
      return next;
    });
  };

  const btnStyle = (bg, color) => ({ background: bg, color, border: `1px solid ${color}`, padding: "6px 16px", borderRadius: 3, cursor: "pointer", fontSize: 12, fontFamily: body, fontWeight: 600, letterSpacing: "0.5px" });

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#111", padding: "24px 16px", fontFamily: body }}>

      {modal && (
        <EditModal field={modal.label} value={modal.value} multiline={modal.multiline}
          onSave={modal.onSave} onClose={() => setModal(null)} />
      )}

      <div style={{ maxWidth: 1040, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
            {editMode ? "Click any text to edit it." : "Preview mode."}
          </div>
          {supabase && (
            <div style={{
              fontSize: 11, fontFamily: body, padding: "3px 10px", borderRadius: 3,
              background: syncStatus === "saved" ? "rgba(50,180,100,0.2)" : syncStatus === "saving" ? "rgba(200,168,75,0.2)" : syncStatus === "error" ? "rgba(180,50,50,0.2)" : "transparent",
              color: syncStatus === "saved" ? "#4fc87a" : syncStatus === "saving" ? GOLD : syncStatus === "error" ? "#e06060" : "transparent",
              transition: "all 0.3s",
            }}>
              {syncStatus === "saving" ? "Saving..." : syncStatus === "saved" ? "Saved" : syncStatus === "error" ? "Save failed" : ""}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setEditMode(m => !m)} style={btnStyle("#333", "#aaa")}>{editMode ? "Preview" : "Edit"}</button>
          <button onClick={addRow} style={btnStyle(NAVY, GOLD)}>+ Add Row</button>
          <button onClick={() => window.print()} style={btnStyle(GOLD, NAVY)}>Print / Save PDF</button>
        </div>
      </div>

      <div id="card" style={{ maxWidth: 1040, margin: "0 auto", boxShadow: "0 16px 64px rgba(0,0,0,0.6)" }}>

        <div style={{ background: NAVY, borderBottom: `4px solid ${GOLD}`, padding: "14px 28px" }}>
          <div style={{ fontFamily: body, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: GOLD, marginBottom: 4 }}>
            {E("Eyebrow", data.header.eyebrow, v => set("header.eyebrow", v))}
          </div>
          <div style={{ fontFamily: serif, fontSize: 26, fontWeight: 700, color: WHITE, lineHeight: 1.2 }}>
            {E("Title", data.header.title, v => set("header.title", v))}
          </div>
          <div style={{ fontFamily: body, fontStyle: "italic", fontSize: 13, color: "rgba(200,168,75,0.8)", marginTop: 4 }}>
            {E("Tagline", data.header.tagline, v => set("header.tagline", v))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `3px solid ${GOLD}`, columnGap: 4, background: NAVY }}>
          <div style={{ background: TAN, padding: "14px 20px", display: "flex", alignItems: "center", gap: 18 }}>
            <PhotoSlot src={data.left.photo} onUpload={v => set("left.photo", v)} editMode={editMode} />
            <div style={{ paddingLeft: 8 }}>
              <div style={{ fontFamily: serif, fontSize: 32, fontWeight: 700, color: "#2A2520", lineHeight: 1.1 }}>
                {E("Phil's Name", data.left.name, v => set("left.name", v))}
              </div>
              <div style={{ fontFamily: body, fontStyle: "italic", fontSize: 12, color: MED_BROWN, marginTop: 4 }}>
                {E("Phil's Role", data.left.role, v => set("left.role", v))}
              </div>
            </div>
          </div>
          <div style={{ background: DARK_NAVY, padding: "14px 20px", display: "flex", alignItems: "center", gap: 18 }}>
            <PhotoSlot src={data.right.photo} onUpload={v => set("right.photo", v)} editMode={editMode} />
            <div style={{ paddingLeft: 8 }}>
              <div style={{ fontFamily: serif, fontSize: 32, fontWeight: 700, color: WHITE, lineHeight: 1.1 }}>
                {E("Maloy's Name", data.right.name, v => set("right.name", v))}
              </div>
              <div style={{ fontFamily: body, fontStyle: "italic", fontSize: 12, color: GOLD, marginTop: 4 }}>
                {E("Maloy's Role", data.right.role, v => set("right.role", v))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `2px solid ${GOLD}`, columnGap: 4, background: NAVY }}>
          <div style={{ background: LIGHT_TAN, padding: "7px 20px" }}>
            <div style={{ fontFamily: body, fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: GOLD }}>
              {E("Left Column Header", data.left.colHeader, v => set("left.colHeader", v))}
            </div>
          </div>
          <div style={{ background: NAVY, padding: "7px 20px" }}>
            <div style={{ fontFamily: body, fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#8A3A2A" }}>
              {E("Right Column Header", data.right.colHeader, v => set("right.colHeader", v))}
            </div>
          </div>
        </div>

        {data.rows.map((row, i) => {
          const even = i % 2 === 0;
          const leftBg = even ? LIGHT_TAN : CREAM;
          const rightBg = even ? MID_NAVY : NAVY;
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", position: "relative", borderBottom: `1px solid ${GOLD}`, columnGap: 4, background: NAVY }}>
              <div style={{ background: leftBg, padding: "9px 20px" }}>
                <div style={{ display: "inline-block", fontFamily: body, fontSize: 9, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", background: LIGHT_BROWN, color: "#5A4F47", padding: "1px 6px", marginBottom: 5, borderRadius: 2 }}>
                  {E(`Row ${i+1} Topic`, row.topic, v => setRow(i, "topic", "topic", v))}
                </div>
                <div style={{ fontFamily: body, fontSize: 12, lineHeight: 1.5, color: DARK_BROWN }}>
                  {editMode ? (
                    <span onClick={() => openModal(`Row ${i+1} Left Text`, row.left.text, v => setRow(i, "left", "text", v), true)}
                      style={{ cursor: "pointer", borderBottom: "1px dashed rgba(200,168,75,0.5)" }}>
                      {row.left.text}
                    </span>
                  ) : (
                    <BoldText text={row.left.text} bold={row.left.bold} color={DARK_BROWN} boldColor={RED} />
                  )}
                </div>
                {editMode && (
                  <div style={{ marginTop: 4 }}>
                    <span style={{ fontFamily: body, fontSize: 10, color: MED_BROWN }}>Bold: </span>
                    <span onClick={() => openModal(`Row ${i+1} Left Bold Phrase`, row.left.bold, v => setRow(i, "left", "bold", v))}
                      style={{ fontFamily: body, fontSize: 10, color: RED, fontWeight: 700, cursor: "pointer", borderBottom: "1px dashed rgba(176,42,24,0.5)" }}>
                      {row.left.bold || "(none)"}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ background: rightBg, padding: "9px 20px" }}>
                <div style={{ display: "inline-block", fontFamily: body, fontSize: 9, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", background: "rgba(200,168,75,0.15)", color: GOLD_TAG, padding: "1px 6px", marginBottom: 5, borderRadius: 2 }}>
                  {row.topic}
                </div>
                <div style={{ fontFamily: body, fontSize: 12, lineHeight: 1.5, color: LIGHT_NAVY_TEXT }}>
                  {editMode ? (
                    <span onClick={() => openModal(`Row ${i+1} Right Text`, row.right.text, v => setRow(i, "right", "text", v), true)}
                      style={{ cursor: "pointer", borderBottom: "1px dashed rgba(200,168,75,0.5)" }}>
                      {row.right.text}
                    </span>
                  ) : (
                    <BoldText text={row.right.text} bold={row.right.bold} color={LIGHT_NAVY_TEXT} boldColor={GOLD_MUTED} />
                  )}
                </div>
                {editMode && (
                  <div style={{ marginTop: 4 }}>
                    <span style={{ fontFamily: body, fontSize: 10, color: "rgba(200,168,75,0.5)" }}>Bold: </span>
                    <span onClick={() => openModal(`Row ${i+1} Right Bold Phrase`, row.right.bold, v => setRow(i, "right", "bold", v))}
                      style={{ fontFamily: body, fontSize: 10, color: GOLD_MUTED, fontWeight: 700, cursor: "pointer", borderBottom: "1px dashed rgba(232,200,106,0.5)" }}>
                      {row.right.bold || "(none)"}
                    </span>
                  </div>
                )}
              </div>
              {editMode && (
                <button onClick={() => removeRow(i)}
                  style={{ position: "absolute", top: 6, right: 6, background: "rgba(176,42,24,0.85)", color: "#fff", border: "none", borderRadius: 3, cursor: "pointer", fontSize: 10, padding: "1px 6px", lineHeight: 1.6, zIndex: 10 }}>
                  remove
                </button>
              )}
            </div>
          );
        })}

        <div style={{ background: NAVY, borderTop: `4px solid ${GOLD}`, padding: "10px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
          <div style={{ fontFamily: body, fontStyle: "italic", fontSize: 10, color: "rgba(255,255,255,0.35)", flex: 1 }}>
            {E("Footer Disclaimer", data.footer, v => set("footer", v), true)}
          </div>
          <div style={{ fontFamily: serif, fontSize: 12, fontWeight: 700, color: GOLD, textAlign: "right", whiteSpace: "nowrap" }}>
            {E("Footer Right", data.footerRight, v => set("footerRight", v))}
          </div>
        </div>

      </div>

      <style>{`
        @media print {
          @page { size: 11in 8.5in; margin: 0.25in; }
          html, body { width: 11in; height: 8.5in; margin: 0 !important; padding: 0 !important; background: white !important; overflow: hidden !important; }
          #root { width: 11in; height: 8.5in; overflow: hidden !important; }
          #root > div { padding: 0 !important; background: white !important; height: 8.5in !important; width: 11in !important; overflow: hidden !important; }
          #root > div > div:first-child { display: none !important; }
          #card { width: 10.5in !important; max-width: 10.5in !important; box-shadow: none !important; margin: 0 auto !important; overflow: hidden !important; transform-origin: top center; transform: scale(0.98); }
          #card * { page-break-inside: avoid !important; break-inside: avoid !important; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}
