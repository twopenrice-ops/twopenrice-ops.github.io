"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Lang = "tc" | "en";
type View = "home" | "package" | "checkout" | "done" | "orders" | "admin";
type PayMethod = "card" | "apple";

type Session = {
  id: string;
  date: string;
  time: string;
  t4_total: number;
  t6_total: number;
  t4_sold: number;
  t6_sold: number;
  open: boolean;
};

type Order = {
  no: string;
  sessionId: string;
  date: string;
  time: string;
  t4: number;
  t6: number;
  total: number;
  name: string;
  phone: string;
  email: string;
  aml: string;
  pay: PayMethod;
  createdAt: string;
};

type Database = {
  prices: { t4: number; t6: number };
  sessions: Session[];
  orders: Order[];
};

const STORE_KEY = "goldpig_codex_demo_v1";
const LANG_KEY = "goldpig_codex_lang";

const makeDefaultData = (): Database => ({
  prices: { t4: 9120, t6: 13680 },
  sessions: [
    { id: "s1", date: "2026-08-28", time: "19:30", t4_total: 10, t6_total: 5, t4_sold: 0, t6_sold: 0, open: true },
    { id: "s2", date: "2026-09-25", time: "19:30", t4_total: 10, t6_total: 5, t4_sold: 0, t6_sold: 0, open: true },
    { id: "s3", date: "2026-10-30", time: "19:30", t4_total: 10, t6_total: 5, t4_sold: 0, t6_sold: 0, open: true },
    { id: "s4", date: "2026-11-27", time: "19:30", t4_total: 10, t6_total: 5, t4_sold: 0, t6_sold: 0, open: true },
  ],
  orders: [],
});

const COPY = {
  tc: {
    demo: "功能展示 DEMO｜不會進行實際扣款",
    orders: "我的訂單",
    lang: "EN",
    heroEyebrow: "ASIA MILES 會員限定｜台北包場",
    heroTitle: "不用飛首爾，也不用排兩小時。",
    heroLead: "Asia Miles 為會員保留金豬食堂台北包場席次。四個週五晚上，選好桌型並付款，這張難訂的桌就為你留下。",
    trustLine: "免下載 App・免註冊 OpenRice 帳號・付款完成即保留桌位",
    book: "選擇包場場次",
    lookup: "查訂單",
    venueLabel: "地點",
    venue: "金豬食堂 台北旗艦店",
    address: "台北市中山區南京東路一段 29 號",
    timeLabel: "時間",
    time: "週五 19:30，19:15 開始報到",
    priceLabel: "套餐",
    price: "4 人桌 NT$9,120｜6 人桌 NT$13,680",
    sessionKicker: "RESERVATION",
    sessionTitle: "先選一個想赴約的晚上",
    sessionIntro: "每場都是 Asia Miles 會員專屬包場。桌數售完即止；每筆訂單最多選 2 桌，可混搭 4 人與 6 人桌。",
    four: "4 人桌",
    six: "6 人桌",
    remaining: "剩餘",
    tables: "桌",
    choose: "選這一場",
    soldOut: "已售完",
    closed: "尚未開放",
    almost: "即將售完",
    available: "可預訂",
    aboutKicker: "THE RESTAURANT",
    aboutTitle: "這不是一般訂位，是整晚為會員保留的金豬食堂。",
    aboutBody: "金豬食堂以厚切熟成豬肉、專人桌邊代烤聞名，連續多年獲《米其林指南》必比登推薦並名列 50 Best Discovery。這次不用現場候位，也不用和一般訂位名額競速；Asia Miles 直接為會員保留完整包場席次。",
    benefitTitle: "你得到的不只是有位",
    benefits: [
      { no: "01", title: "會員專屬席次", body: "一般客人無法購買的完整包場，只有符合資格的 Asia Miles 會員能完成結帳。" },
      { no: "02", title: "套餐一次到位", body: "招牌熟成豬肉、帶骨牛小排、泡菜鍋與主食都已安排，價格包含 10% 服務費。" },
      { no: "03", title: "不用研究 OpenRice", body: "不需下載 App、不需建立 OpenRice 帳號；用 Asia Miles 會員號碼確認資格即可。" },
    ],
    serviceBy: "OpenRice 是本活動指定的線上訂位與付款服務平台。你不需要是 OpenRice 會員。",
    menuTitle: "這桌會吃到",
    menuMeat: "熟成豚梅花、帶骨熟成豚五花、熟成豚松阪、熟成豚霜降、特級帶骨牛小排",
    menuVeg: "季節生菜、金豬特選羅勒、杏鮑菇、大蒜與大蔥",
    menuMain: "金豬經典泡菜鍋、韓國農心 Q 拉麵、越光米飯",
    menuNote: "實際品項依現場提供為準，恕不接受客製調整。",
    howTitle: "從選日期到完成，四步就好",
    steps: ["選包場日期", "選 4 人或 6 人桌", "以會員號碼確認資格並付款", "Email 收到購買證明"],
    noticeTitle: "訂位前先看",
    noticeGroups: [
      { title: "報到方式", items: ["請於場次前 15 分鐘抵達餐廳。", "向服務人員表示為亞洲萬里通訂位貴賓，並出示會員卡及訂位確認。", "無法出示訂位確認者，恕無法入座、退款或改期。"] },
      { title: "訂購須知", items: ["完成訂位後無法修改日期、場次或桌數。", "套餐限對應人數用餐；人數不足不退費，也不提供加人。", "遲到超過 15 分鐘或未報到視同放棄，不退款、不改期。", "如有過敏、素食或不食辣需求，購買前請先確認可接受固定菜單。"] },
      { title: "場地與其他規範", items: ["不提供自備酒水，桌位由餐廳安排。", "除導盲犬外恕不開放寵物入場，餐廳內全面禁菸。", "現場將進行拍攝，影像可能用於活動宣傳。", "不可抗力造成活動取消時，將於活動頁公告後續辦法。"] },
    ],
    selectTitle: "選擇桌型",
    selectSub: "同一場次可混搭 4 人桌與 6 人桌，每筆訂單合計最多 2 桌。",
    includes: "套餐內容相同，價格已含 10% 服務費",
    subtotal: "合計",
    checkout: "前往結帳",
    back: "返回",
    checkoutTitle: "結帳",
    checkoutSub: "不需 OpenRice 帳號。填寫聯絡資料，以 Asia Miles 會員號碼確認活動資格後即可付款。",
    contact: "聯絡資料",
    name: "姓名",
    phone: "手機號碼",
    email: "電子郵件",
    member: "Asia Miles 會員資格",
    memberNo: "Asia Miles 會員號碼",
    verify: "檢核資格",
    verifying: "檢核中",
    verified: "資格已確認（示意）",
    verifyHelp: "輸入你的會員號碼。正式活動會在這一步確認會員及聯名卡活動資格。",
    payment: "付款方式",
    card: "信用卡",
    cardSub: "VISA / Mastercard / JCB",
    apple: "Apple Pay",
    appleSub: "使用 Apple 裝置快速付款",
    summary: "訂單明細",
    pay: "確認付款",
    processing: "正在處理付款",
    processingSub: "示範模式，不會實際扣款",
    required: "請把必要欄位填寫完整。",
    invalidEmail: "電子郵件格式不正確。",
    invalidPhone: "手機號碼格式不正確。",
    needVerify: "請先完成國泰會員資格檢核。",
    needPay: "請選擇付款方式。",
    noStock: "很抱歉，桌數剛被其他訂單買走，請重新選擇。",
    doneTitle: "訂位完成",
    doneSub: "購買證明已寄到你的電子郵件（示意）。報到時請出示下方訂單編號與國泰會員卡。",
    orderNo: "訂單編號",
    dining: "用餐場次",
    items: "訂購內容",
    diner: "訂位人",
    paidBy: "付款方式",
    total: "實付金額",
    proof: "購買證明｜DEMO",
    viewOrders: "查看我的訂單",
    home: "回活動首頁",
    ordersTitle: "我的訂單",
    ordersSub: "輸入購買時使用的電子郵件即可查詢，不用登入。",
    search: "查詢",
    notSearched: "輸入電子郵件後查詢。",
    none: "查無訂單，請確認電子郵件是否正確。",
    admin: "場次管理",
    adminSub: "展示用後台。修改後按儲存，活動頁才會更新。",
    adminNote: "資料只存在這台裝置的瀏覽器。正式版會改用雲端資料庫並加上登入保護。",
    settings: "場次與桌數",
    date: "日期",
    timeField: "時段",
    open4: "4 人桌開放數",
    open6: "6 人桌開放數",
    sold: "已售",
    state: "狀態",
    open: "開放中",
    off: "已關閉",
    remove: "刪除",
    add: "新增場次",
    prices: "套餐價格",
    save: "儲存設定",
    dirty: "尚未儲存",
    saved: "已儲存",
    orderRecords: "訂單紀錄",
    noRecords: "尚無訂單。",
    reset: "重設示範資料",
    leave: "有尚未儲存的變更，確定離開嗎？",
  },
  en: {
    demo: "FUNCTIONAL DEMO | No real payment will be charged",
    orders: "My orders",
    lang: "中文",
    heroEyebrow: "EXCLUSIVE TO ASIA MILES MEMBERS | TAIPEI",
    heroTitle: "Skip the flight. Skip the two-hour queue.",
    heroLead: "Asia Miles has reserved Gold Pig Taipei for four Friday evenings. Choose a table and pay online — one of the city’s hardest bookings is yours.",
    trustLine: "No app download · No OpenRice account · Your table is held after payment",
    book: "Choose a private seating",
    lookup: "Find an order",
    venueLabel: "Venue",
    venue: "Gold Pig, Taipei Flagship",
    address: "No. 29, Sec. 1, Nanjing E. Rd., Taipei",
    timeLabel: "Time",
    time: "Fridays at 7:30 PM; check-in from 7:15 PM",
    priceLabel: "Set menu",
    price: "Table for 4 NT$9,120 | Table for 6 NT$13,680",
    sessionKicker: "RESERVATION",
    sessionTitle: "Choose the night that works for you",
    sessionIntro: "Every date is an Asia Miles members-only buyout. Tables sell out in real time. Mix tables for 4 and 6, up to two per order.",
    four: "Table for 4",
    six: "Table for 6",
    remaining: "Left",
    tables: "tables",
    choose: "Choose",
    soldOut: "Sold out",
    closed: "Not open",
    almost: "Almost full",
    available: "Available",
    aboutKicker: "THE RESTAURANT",
    aboutTitle: "This is not a regular reservation. The restaurant is yours for the night.",
    aboutBody: "Gold Pig is known for thick-cut aged pork and expert tableside grilling, with years of Michelin Bib Gourmand recognition and a place on 50 Best Discovery. There is no walk-in queue and no race for public bookings — Asia Miles has set aside the full seating for eligible members.",
    benefitTitle: "More than simply getting a table",
    benefits: [
      { no: "01", title: "Members-only access", body: "A full private seating not available to the public. Only eligible Asia Miles members can complete checkout." },
      { no: "02", title: "The menu is handled", body: "Signature aged pork, bone-in beef short rib, kimchi stew and staples, with the 10% service charge included." },
      { no: "03", title: "No OpenRice learning curve", body: "No app or OpenRice account is required. Use your Asia Miles membership number to verify eligibility." },
    ],
    serviceBy: "OpenRice is the appointed booking and payment provider for this event. You do not need an OpenRice account.",
    menuTitle: "On the table",
    menuMeat: "Four aged pork cuts and premium bone-in beef short rib",
    menuVeg: "Seasonal greens, Gold Pig basil, mushrooms, garlic and spring onion",
    menuMain: "Gold Pig kimchi stew, Nongshim Q noodles and Koshihikari rice",
    menuNote: "Items may vary on the day. Menu changes are not available.",
    howTitle: "Four clear steps from date to confirmation",
    steps: ["Pick a private dining date", "Choose a table for 4 or 6", "Verify membership and pay", "Receive proof of purchase by email"],
    noticeTitle: "Before you book",
    noticeGroups: [
      { title: "Check-in", items: ["Arrive 15 minutes before your seating.", "Tell staff you are an Asia Miles guest and show your membership card and booking confirmation.", "Guests without confirmation cannot be admitted, refunded or moved."] },
      { title: "Booking policy", items: ["Date, seating and table size cannot be changed after payment.", "Sets are for the listed party size; unused seats are not refundable and extra guests cannot be added.", "Guests over 15 minutes late or absent forfeit the booking without refund.", "Please confirm the fixed menu is suitable for any allergies or dietary needs before purchase."] },
      { title: "Venue policy", items: ["Outside alcohol is not allowed and seating is assigned by the restaurant.", "Only guide dogs are admitted. Smoking is prohibited.", "Photography and filming may take place for event promotion.", "If force majeure affects the event, next steps will be posted on this page."] },
    ],
    selectTitle: "Choose table size",
    selectSub: "Mix tables for 4 and 6 within the same seating. Maximum two tables per order.",
    includes: "Same set menu; price includes 10% service charge",
    subtotal: "Total",
    checkout: "Continue to checkout",
    back: "Back",
    checkoutTitle: "Checkout",
    checkoutSub: "No OpenRice account is required. Enter your details and verify with your Asia Miles membership number to pay.",
    contact: "Contact details",
    name: "Name",
    phone: "Mobile number",
    email: "Email",
    member: "Asia Miles member eligibility",
    memberNo: "Asia Miles membership number",
    verify: "Verify",
    verifying: "Verifying",
    verified: "Eligibility confirmed (demo)",
    verifyHelp: "Enter your membership number. The live event will check member and co-branded card campaign eligibility here.",
    payment: "Payment method",
    card: "Credit card",
    cardSub: "VISA / Mastercard / JCB",
    apple: "Apple Pay",
    appleSub: "Fast payment on Apple devices",
    summary: "Order summary",
    pay: "Confirm payment",
    processing: "Processing payment",
    processingSub: "Demo mode. No real charge will be made.",
    required: "Complete all required fields.",
    invalidEmail: "Enter a valid email address.",
    invalidPhone: "Enter a valid mobile number.",
    needVerify: "Verify your Cathay membership eligibility.",
    needPay: "Choose a payment method.",
    noStock: "Those tables were just taken. Please choose again.",
    doneTitle: "Booking confirmed",
    doneSub: "Your proof of purchase has been emailed (demo). Show the order number and your Cathay membership card at check-in.",
    orderNo: "Order number",
    dining: "Seating",
    items: "Items",
    diner: "Guest",
    paidBy: "Paid with",
    total: "Total paid",
    proof: "PROOF OF PURCHASE | DEMO",
    viewOrders: "View my orders",
    home: "Event home",
    ordersTitle: "My orders",
    ordersSub: "Enter the email used at checkout. No sign-in required.",
    search: "Search",
    notSearched: "Enter your email to search.",
    none: "No orders found. Check that the email is correct.",
    admin: "Session manager",
    adminSub: "Demo organizer view. Changes only go live after you save.",
    adminNote: "Data is stored only in this browser. The live site will use a secured cloud database.",
    settings: "Seatings and capacity",
    date: "Date",
    timeField: "Time",
    open4: "Tables for 4",
    open6: "Tables for 6",
    sold: "Sold",
    state: "Status",
    open: "Open",
    off: "Closed",
    remove: "Delete",
    add: "Add seating",
    prices: "Set menu prices",
    save: "Save settings",
    dirty: "Unsaved changes",
    saved: "Saved",
    orderRecords: "Order records",
    noRecords: "No orders yet.",
    reset: "Reset demo data",
    leave: "You have unsaved changes. Leave anyway?",
  },
} as const;

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

function money(value: number) {
  return `NT$${value.toLocaleString("en-US")}`;
}

function remaining(session: Session, key: "t4" | "t6") {
  return Math.max(0, session[`${key}_total`] - session[`${key}_sold`]);
}

function QRMock({ value }: { value: string }) {
  const seed = value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const cells = Array.from({ length: 225 }, (_, i) => {
    const row = Math.floor(i / 15);
    const col = i % 15;
    const finder = (row < 5 && col < 5) || (row < 5 && col > 9) || (row > 9 && col < 5);
    return finder || ((i * 17 + seed * 7 + row * col) % 11 < 5);
  });
  return <div className="qr" aria-label="Demo QR code">{cells.map((on, i) => <i key={i} className={on ? "on" : ""} />)}</div>;
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("tc");
  const [view, setView] = useState<View>("home");
  const [db, setDb] = useState<Database>(makeDefaultData);
  const [cart, setCart] = useState({ sessionId: "", t4: 0, t6: 0 });
  const [form, setForm] = useState({ name: "", phone: "", email: "", aml: "" });
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [payMethod, setPayMethod] = useState<PayMethod | "">("");
  const [errors, setErrors] = useState<string[]>([]);
  const [paying, setPaying] = useState(false);
  const payingRef = useRef(false);
  const [lastOrderNo, setLastOrderNo] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [hasLooked, setHasLooked] = useState(false);
  const [adminDraft, setAdminDraft] = useState<Database | null>(null);
  const [adminDirty, setAdminDirty] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const c = COPY[lang];

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORE_KEY);
      if (stored) setDb(JSON.parse(stored));
      else window.localStorage.setItem(STORE_KEY, JSON.stringify(makeDefaultData()));
      const storedLang = window.localStorage.getItem(LANG_KEY);
      if (storedLang === "en" || storedLang === "tc") setLang(storedLang);
    } catch { /* demo can still run without storage */ }
  }, []);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!adminDirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [adminDirty]);

  const persist = (next: Database) => {
    setDb(next);
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch { /* demo fallback */ }
  };

  const navigate = (next: View) => {
    if (view === "admin" && adminDirty && next !== "admin" && !window.confirm(c.leave)) return;
    setView(next);
    setErrors([]);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const toggleLang = () => {
    const next: Lang = lang === "tc" ? "en" : "tc";
    setLang(next);
    try { window.localStorage.setItem(LANG_KEY, next); } catch { /* ignore */ }
  };

  const session = db.sessions.find((item) => item.id === cart.sessionId);
  const orderTotal = cart.t4 * db.prices.t4 + cart.t6 * db.prices.t6;
  const lastOrder = db.orders.find((order) => order.no === lastOrderNo);
  const lookupOrders = useMemo(
    () => db.orders.filter((order) => order.email === lookupEmail.trim().toLowerCase()),
    [db.orders, lookupEmail],
  );

  const formatDate = (date: string) => {
    const value = new Date(`${date}T12:00:00`);
    return new Intl.DateTimeFormat(lang === "tc" ? "zh-TW" : "en-US", {
      month: lang === "tc" ? "numeric" : "short",
      day: "numeric",
      weekday: "short",
      year: lang === "en" ? "numeric" : undefined,
    }).format(value);
  };

  const chooseSession = (item: Session) => {
    setCart({ sessionId: item.id, t4: 0, t6: 0 });
    navigate("package");
  };

  const changeQty = (key: "t4" | "t6", delta: number) => {
    if (!session) return;
    const next = cart[key] + delta;
    if (next < 0 || next > remaining(session, key)) return;
    if (delta > 0 && cart.t4 + cart.t6 >= 2) return;
    setCart({ ...cart, [key]: next });
  };

  const verifyMember = () => {
    if (form.aml.trim().length < 4) {
      setErrors([c.needVerify]);
      return;
    }
    setVerifying(true);
    window.setTimeout(() => {
      setVerified(true);
      setVerifying(false);
      setErrors([]);
    }, 700);
  };

  const submitOrder = (event: FormEvent) => {
    event.preventDefault();
    if (payingRef.current || !session) return;
    const nextErrors: string[] = [];
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.aml.trim()) nextErrors.push(c.required);
    if (form.phone && !/^[0-9+\-\s]{8,}$/.test(form.phone.trim())) nextErrors.push(c.invalidPhone);
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.push(c.invalidEmail);
    if (!verified) nextErrors.push(c.needVerify);
    if (!payMethod) nextErrors.push(c.needPay);
    if (nextErrors.length) {
      setErrors(Array.from(new Set(nextErrors)));
      document.querySelector(".form-error")?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    let live = db;
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) live = JSON.parse(raw);
    } catch { /* use current state */ }
    const liveSession = live.sessions.find((item) => item.id === cart.sessionId);
    if (!liveSession || !liveSession.open || cart.t4 > remaining(liveSession, "t4") || cart.t6 > remaining(liveSession, "t6")) {
      window.alert(c.noStock);
      persist(live);
      navigate("home");
      return;
    }

    payingRef.current = true;
    setPaying(true);
    window.setTimeout(() => {
      let commit = db;
      try {
        const raw = window.localStorage.getItem(STORE_KEY);
        if (raw) commit = JSON.parse(raw);
      } catch { /* use current state */ }
      const commitSession = commit.sessions.find((item) => item.id === cart.sessionId);
      if (!commitSession || !commitSession.open || cart.t4 > remaining(commitSession, "t4") || cart.t6 > remaining(commitSession, "t6")) {
        payingRef.current = false;
        setPaying(false);
        window.alert(c.noStock);
        persist(commit);
        navigate("home");
        return;
      }
      commitSession.t4_sold += cart.t4;
      commitSession.t6_sold += cart.t6;
      const no = `GP${String(Date.now()).slice(-8)}`;
      commit.orders.unshift({
        no,
        sessionId: commitSession.id,
        date: commitSession.date,
        time: commitSession.time,
        t4: cart.t4,
        t6: cart.t6,
        total: cart.t4 * commit.prices.t4 + cart.t6 * commit.prices.t6,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        aml: form.aml.trim(),
        pay: payMethod as PayMethod,
        createdAt: new Date().toISOString(),
      });
      persist(commit);
      setLastOrderNo(no);
      payingRef.current = false;
      setPaying(false);
      setView("done");
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 1200);
  };

  const startAdmin = () => {
    setAdminDraft(clone(db));
    setAdminDirty(false);
    navigate("admin");
  };

  const editAdminSession = (index: number, patch: Partial<Session>) => {
    if (!adminDraft) return;
    const next = clone(adminDraft);
    next.sessions[index] = { ...next.sessions[index], ...patch };
    setAdminDraft(next);
    setAdminDirty(true);
  };

  const saveAdmin = () => {
    if (!adminDraft) return;
    if (adminDraft.sessions.some((item) => !item.date || !item.time)) return window.alert(lang === "tc" ? "請填完每個場次的日期與時段。" : "Complete every seating date and time.");
    let live = db;
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) live = JSON.parse(raw);
    } catch { /* use state */ }
    const merged = clone(adminDraft);
    merged.orders = live.orders;
    for (const draft of merged.sessions) {
      const current = live.sessions.find((item) => item.id === draft.id);
      draft.t4_sold = current?.t4_sold ?? 0;
      draft.t6_sold = current?.t6_sold ?? 0;
      if (draft.t4_total < draft.t4_sold || draft.t6_total < draft.t6_sold) {
        return window.alert(lang === "tc" ? "開放桌數不可低於已售出數量。" : "Capacity cannot be lower than tables already sold.");
      }
    }
    persist(merged);
    setAdminDraft(clone(merged));
    setAdminDirty(false);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1800);
  };

  const resetDemo = () => {
    if (!window.confirm(lang === "tc" ? "確定重設所有場次與示範訂單嗎？" : "Reset all seatings and demo orders?")) return;
    const fresh = makeDefaultData();
    persist(fresh);
    setAdminDraft(clone(fresh));
    setAdminDirty(false);
  };

  const orderItems = (order: Order) => [
    order.t4 ? `${c.four} × ${order.t4}` : "",
    order.t6 ? `${c.six} × ${order.t6}` : "",
  ].filter(Boolean).join(lang === "tc" ? "、" : ", ");

  const BrandLockup = ({ compact = false }: { compact?: boolean }) => (
    <span className={`brandLockup ${compact ? "compact" : ""}`} aria-label="Asia Miles and OpenRice">
      <img className="asiaMilesLogo" src="/assets/asia-miles-logo.png" alt="Asia Miles" />
      <i aria-hidden="true">×</i>
      <img className="openRiceLogo" src="/assets/openrice-logo.svg" alt="OpenRice 開飯喇" />
    </span>
  );

  const Ticket = ({ order }: { order: Order }) => (
    <article className="ticket">
      <div className="ticketHeader">
        <div><small>{c.orderNo}</small><strong>{order.no}</strong></div>
        <BrandLockup compact />
      </div>
      <div className="ticketBody">
        <dl>
          <div><dt>{c.dining}</dt><dd>{formatDate(order.date)} {order.time}</dd></div>
          <div><dt>{c.items}</dt><dd>{orderItems(order)}</dd></div>
          <div><dt>{c.diner}</dt><dd>{order.name}</dd></div>
          <div><dt>{c.paidBy}</dt><dd>{order.pay === "card" ? c.card : c.apple}</dd></div>
          <div><dt>{c.total}</dt><dd className="amount">{money(order.total)}</dd></div>
        </dl>
        <div className="proof"><QRMock value={order.no} /><small>{c.proof}</small></div>
      </div>
    </article>
  );

  const Header = () => (
    <>
      <div className="demoBar">{c.demo}</div>
      <header className="siteHeader">
        <button className="brand" onClick={() => navigate("home")} aria-label="OpenRice event home">
          <BrandLockup />
        </button>
        <nav>
          <button onClick={() => navigate("orders")}>{c.orders}</button>
          <button className="langButton" onClick={toggleLang}>{c.lang}</button>
        </nav>
      </header>
    </>
  );

  const HomeView = () => (
    <main>
      <section className="memberHero">
        <div className="memberHeroCopy">
          <p className="eyebrow">{c.heroEyebrow}</p>
          <h1>{c.heroTitle}</h1>
          <p className="heroLead">{c.heroLead}</p>
          <div className="heroActions">
            <a className="primaryButton" href="#sessions">{c.book}</a>
            <button className="textButton" onClick={() => navigate("orders")}>{c.lookup}</button>
          </div>
          <p className="trustLine">{c.trustLine}</p>
        </div>
        <figure className="memberHeroPhoto">
          <img src="/assets/gold-pig-grill.jpg" alt={lang === "tc" ? "金豬食堂專人桌邊燒烤" : "Gold Pig tableside grilling"} />
          <figcaption><span>GOLD PIG TAIPEI</span><b>{lang === "tc" ? "專人桌邊代烤" : "Expert tableside grilling"}</b></figcaption>
        </figure>
      </section>

      <dl className="factsStrip">
        <div><dt>{c.venueLabel}</dt><dd>{c.venue}<small>{c.address}</small></dd></div>
        <div><dt>{c.timeLabel}</dt><dd>{c.time}</dd></div>
        <div><dt>{c.priceLabel}</dt><dd>{c.price}</dd></div>
      </dl>

      <section className="benefitSection sectionRule">
        <div className="benefitHeading"><p className="eyebrow">MEMBERS ONLY</p><h2>{c.benefitTitle}</h2></div>
        <div className="benefitGrid">{c.benefits.map((benefit) => <article key={benefit.no}><b>{benefit.no}</b><h3>{benefit.title}</h3><p>{benefit.body}</p></article>)}</div>
        <p className="serviceNote">{c.serviceBy}</p>
      </section>

      <section className="sessionsSection" id="sessions">
        <div className="sectionHeading">
          <p className="eyebrow">{c.sessionKicker}</p>
          <h2>{c.sessionTitle}</h2>
          <p>{c.sessionIntro}</p>
        </div>
        <div className="sessionTable">
          {db.sessions.slice().sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).map((item) => {
            const r4 = remaining(item, "t4");
            const r6 = remaining(item, "t6");
            const sold = r4 + r6 === 0;
            const low = r4 + r6 > 0 && r4 + r6 <= 4;
            return (
              <article className="sessionRow" key={item.id}>
                <div className="sessionDate"><strong>{formatDate(item.date)}</strong><span>{item.time}</span></div>
                <div className="sessionStock"><span>{c.four}<b>{r4}</b></span><span>{c.six}<b>{r6}</b></span></div>
                <div className={`statusText ${low ? "low" : ""}`}>{!item.open ? c.closed : sold ? c.soldOut : low ? c.almost : c.available}</div>
                <button disabled={!item.open || sold} onClick={() => chooseSession(item)}>{!item.open ? c.closed : sold ? c.soldOut : c.choose}</button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="storySection sectionRule">
        <div className="storyImage"><img src="/assets/gold-pig-taipei-building.jpg" alt={lang === "tc" ? "金豬食堂台北旗艦店外觀" : "Gold Pig Taipei flagship"} /></div>
        <div className="storyCopy">
          <p className="eyebrow">{c.aboutKicker}</p>
          <h2>{c.aboutTitle}</h2>
          <p>{c.aboutBody}</p>
          <h3>{c.menuTitle}</h3>
          <dl className="menuList">
            <div><dt>01</dt><dd>{c.menuMeat}</dd></div>
            <div><dt>02</dt><dd>{c.menuVeg}</dd></div>
            <div><dt>03</dt><dd>{c.menuMain}</dd></div>
          </dl>
          <small className="menuNote">{c.menuNote}</small>
        </div>
      </section>

      <section className="processSection sectionRule">
        <h2>{c.howTitle}</h2>
        <ol>{c.steps.map((step, index) => <li key={step}><b>0{index + 1}</b><span>{step}</span></li>)}</ol>
      </section>

      <section className="noticeSection sectionRule">
        <h2>{c.noticeTitle}</h2>
        <div className="notices">
          {c.noticeGroups.map((group, index) => (
            <details key={group.title} open={index === 0}>
              <summary>{group.title}<span aria-hidden="true">＋</span></summary>
              <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </details>
          ))}
        </div>
      </section>
    </main>
  );

  const PackageView = () => {
    if (!session) return <HomeView />;
    const totalQty = cart.t4 + cart.t6;
    return (
      <main className="subpage">
        <button className="backLink" onClick={() => navigate("home")}>← {c.back}</button>
        <p className="eyebrow">02 / 04</p>
        <h1>{c.selectTitle}</h1>
        <p className="subLead">{c.selectSub}</p>
        <div className="selectedSession"><strong>{formatDate(session.date)}｜{session.time}</strong><span>{c.venue}</span></div>
        <div className="packageList">
          {(["t4", "t6"] as const).map((key) => {
            const isFour = key === "t4";
            const qty = cart[key];
            const stock = remaining(session, key);
            return (
              <article className={`packageRow ${qty ? "selected" : ""}`} key={key}>
                <img src="/assets/gold-pig-grill.jpg" alt="" />
                <div className="packageCopy">
                  <h2>{isFour ? c.four : c.six}</h2>
                  <strong>{money(db.prices[key])}</strong>
                  <p>{c.includes}</p>
                  <small>{c.remaining} {stock} {c.tables}</small>
                </div>
                <div className="stepper" aria-label={isFour ? c.four : c.six}>
                  <button onClick={() => changeQty(key, -1)} disabled={qty === 0}>−</button>
                  <output>{qty}</output>
                  <button onClick={() => changeQty(key, 1)} disabled={qty >= stock || totalQty >= 2}>＋</button>
                </div>
              </article>
            );
          })}
        </div>
        <div className="stickySummary">
          <div><span>{c.subtotal}</span><strong>{money(orderTotal)}</strong></div>
          <button className="primaryButton" disabled={!totalQty} onClick={() => navigate("checkout")}>{c.checkout}</button>
        </div>
      </main>
    );
  };

  const CheckoutView = () => {
    if (!session || cart.t4 + cart.t6 === 0) return <PackageView />;
    const setFormValue = (key: keyof typeof form, value: string) => {
      setForm({ ...form, [key]: value });
      if (key === "aml") setVerified(false);
    };
    return (
      <main className="subpage checkoutPage">
        <button className="backLink" onClick={() => navigate("package")}>← {c.back}</button>
        <p className="eyebrow">03 / 04</p>
        <h1>{c.checkoutTitle}</h1>
        <p className="subLead">{c.checkoutSub}</p>
        <form onSubmit={submitOrder}>
          <div className="checkoutGrid">
            <div className="formStack">
              {errors.length > 0 && <div className="form-error" role="alert">{errors.map((error) => <p key={error}>{error}</p>)}</div>}
              <section className="formSection">
                <h2>{c.contact}</h2>
                <div className="fieldGrid">
                  <label>{c.name}<input value={form.name} onChange={(e) => setFormValue("name", e.target.value)} autoComplete="name" /></label>
                  <label>{c.phone}<input value={form.phone} onChange={(e) => setFormValue("phone", e.target.value)} autoComplete="tel" inputMode="tel" /></label>
                </div>
                <label>{c.email}<input value={form.email} onChange={(e) => setFormValue("email", e.target.value)} autoComplete="email" type="email" /></label>
              </section>
              <section className="formSection">
                <h2>{c.member}</h2>
                <p className="helpText">{c.verifyHelp}</p>
                <div className="verifyRow">
                  <label>{c.memberNo}<input value={form.aml} onChange={(e) => setFormValue("aml", e.target.value)} /></label>
                  {verified ? <strong className="verifiedText">{c.verified}</strong> : <button type="button" onClick={verifyMember} disabled={verifying}>{verifying ? c.verifying : c.verify}</button>}
                </div>
              </section>
              <section className="formSection">
                <h2>{c.payment}</h2>
                <div className="paymentOptions">
                  <button type="button" className={payMethod === "card" ? "selected" : ""} onClick={() => setPayMethod("card")}><strong>{c.card}</strong><small>{c.cardSub}</small></button>
                  <button type="button" className={payMethod === "apple" ? "selected" : ""} onClick={() => setPayMethod("apple")}><strong>{c.apple}</strong><small>{c.appleSub}</small></button>
                </div>
              </section>
            </div>
            <aside className="orderAside">
              <h2>{c.summary}</h2>
              <div className="asideSession"><strong>{formatDate(session.date)}</strong><span>{session.time}｜{c.venue}</span></div>
              {cart.t4 > 0 && <div className="lineItem"><span>{c.four} × {cart.t4}</span><b>{money(cart.t4 * db.prices.t4)}</b></div>}
              {cart.t6 > 0 && <div className="lineItem"><span>{c.six} × {cart.t6}</span><b>{money(cart.t6 * db.prices.t6)}</b></div>}
              <div className="asideTotal"><span>{c.subtotal}</span><strong>{money(orderTotal)}</strong></div>
              <button className="primaryButton" type="submit">{c.pay}</button>
            </aside>
          </div>
        </form>
      </main>
    );
  };

  const DoneView = () => {
    if (!lastOrder) return <HomeView />;
    return (
      <main className="subpage donePage">
        <p className="eyebrow">04 / 04</p>
        <h1>{c.doneTitle}</h1>
        <p className="subLead">{c.doneSub}</p>
        <Ticket order={lastOrder} />
        <div className="doneActions">
          <button className="secondaryButton" onClick={() => { setLookupEmail(lastOrder.email); setHasLooked(true); navigate("orders"); }}>{c.viewOrders}</button>
          <button className="primaryButton" onClick={() => navigate("home")}>{c.home}</button>
        </div>
      </main>
    );
  };

  const OrdersView = () => (
    <main className="subpage ordersPage">
      <button className="backLink" onClick={() => navigate("home")}>← {c.home}</button>
      <h1>{c.ordersTitle}</h1>
      <p className="subLead">{c.ordersSub}</p>
      <div className="lookupForm">
        <input type="email" value={lookupEmail} onChange={(e) => setLookupEmail(e.target.value)} placeholder="name@example.com" onKeyDown={(e) => { if (e.key === "Enter") setHasLooked(true); }} />
        <button className="primaryButton" onClick={() => setHasLooked(true)}>{c.search}</button>
      </div>
      {!hasLooked ? <div className="emptyState">{c.notSearched}</div> : lookupOrders.length ? lookupOrders.map((order) => <Ticket order={order} key={order.no} />) : <div className="emptyState">{c.none}</div>}
    </main>
  );

  const AdminView = () => {
    if (!adminDraft) return <HomeView />;
    return (
      <main className="subpage adminPage">
        <button className="backLink" onClick={() => navigate("home")}>← {c.home}</button>
        <h1>{c.admin}</h1>
        <p className="subLead">{c.adminSub}</p>
        <div className="adminNote">{c.adminNote}</div>
        <section className="adminSection">
          <h2>{c.settings}</h2>
          <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>{c.date}</th><th>{c.timeField}</th><th>{c.open4}</th><th>{c.open6}</th><th>{c.sold}</th><th>{c.state}</th><th /></tr></thead>
            <tbody>{adminDraft.sessions.map((item, index) => <tr key={item.id}>
              <td><input type="date" value={item.date} onChange={(e) => editAdminSession(index, { date: e.target.value })} /></td>
              <td><input type="time" value={item.time} onChange={(e) => editAdminSession(index, { time: e.target.value })} /></td>
              <td><input type="number" min={item.t4_sold} value={item.t4_total} onChange={(e) => editAdminSession(index, { t4_total: Math.max(0, Number(e.target.value)) })} /></td>
              <td><input type="number" min={item.t6_sold} value={item.t6_total} onChange={(e) => editAdminSession(index, { t6_total: Math.max(0, Number(e.target.value)) })} /></td>
              <td>{item.t4_sold} / {item.t6_sold}</td>
              <td><button className={`stateButton ${item.open ? "on" : ""}`} onClick={() => editAdminSession(index, { open: !item.open })}>{item.open ? c.open : c.off}</button></td>
              <td><button className="dangerLink" onClick={() => { const next = clone(adminDraft); next.sessions.splice(index, 1); setAdminDraft(next); setAdminDirty(true); }}>{c.remove}</button></td>
            </tr>)}</tbody>
          </table></div>
          <button className="secondaryButton" onClick={() => { const next = clone(adminDraft); next.sessions.push({ id: `s${Date.now()}`, date: "", time: "19:30", t4_total: 10, t6_total: 5, t4_sold: 0, t6_sold: 0, open: true }); setAdminDraft(next); setAdminDirty(true); }}>{c.add}</button>
        </section>
        <section className="adminSection">
          <h2>{c.prices}</h2>
          <div className="priceInputs">
            <label>{c.four}<input type="number" min="0" value={adminDraft.prices.t4} onChange={(e) => { const next = clone(adminDraft); next.prices.t4 = Math.max(0, Number(e.target.value)); setAdminDraft(next); setAdminDirty(true); }} /></label>
            <label>{c.six}<input type="number" min="0" value={adminDraft.prices.t6} onChange={(e) => { const next = clone(adminDraft); next.prices.t6 = Math.max(0, Number(e.target.value)); setAdminDraft(next); setAdminDirty(true); }} /></label>
          </div>
          <div className="adminActions"><button className="primaryButton" onClick={saveAdmin}>{c.save}</button><span className={adminDirty ? "dirty" : "saved"}>{savedFlash ? c.saved : adminDirty ? c.dirty : c.saved}</span><button className="dangerLink" onClick={resetDemo}>{c.reset}</button></div>
        </section>
        <section className="adminSection">
          <h2>{c.orderRecords}</h2>
          {!db.orders.length ? <div className="emptyState">{c.noRecords}</div> : <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>{c.orderNo}</th><th>{c.dining}</th><th>{c.items}</th><th>{c.total}</th><th>{c.diner}</th></tr></thead><tbody>{db.orders.map((order) => <tr key={order.no}><td>{order.no}</td><td>{order.date} {order.time}</td><td>{orderItems(order)}</td><td>{money(order.total)}</td><td>{order.name}</td></tr>)}</tbody></table></div>}
        </section>
      </main>
    );
  };

  return (
    <div className="site" lang={lang === "tc" ? "zh-Hant" : "en"}>
      <Header />
      {view === "home" && <HomeView />}
      {view === "package" && <PackageView />}
      {view === "checkout" && <CheckoutView />}
      {view === "done" && <DoneView />}
      {view === "orders" && <OrdersView />}
      {view === "admin" && <AdminView />}
      <footer className="siteFooter">
        <div><BrandLockup /><small>{c.serviceBy}<br />Copyright © OpenRice Group Inc.｜DEMO</small></div>
        <button onClick={startAdmin}>{c.admin}</button>
      </footer>
      {paying && <div className="paymentOverlay" role="status"><div><strong>{c.processing}</strong><span>{c.processingSub}</span><i /></div></div>}
    </div>
  );
}
