"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Lang = "tc" | "en";
type View = "home" | "package" | "checkout" | "done" | "admin";
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
  lineBindUrl?: string;
  lineSetupError?: boolean;
};

type Database = {
  prices: { t4: number; t6: number };
  sessions: Session[];
  orders: Order[];
};

const STORE_KEY = "goldpig_codex_demo_v1";
const LANG_KEY = "goldpig_codex_lang";
const LINE_CRM_ORIGIN = "https://openrice-line-crm.netlify.app";

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
    lang: "EN",
    heroEyebrow: "ASIA MILES 會員限定｜OPENRICE 專屬保留位",
    heroTitle: "不用飛首爾，台北就能吃到金豬經典。",
    heroLead: "OpenRice 為 Asia Miles 會員保留四個週五晚間席次。選擇日期與桌型，完成付款即可確認訂位。",
    trustLine: "Asia Miles 會員限定・四個週五晚上・付款完成即確認訂位",
    book: "查看專屬保留場次",
    venueLabel: "地點",
    venue: "金豬食堂 台北旗艦店",
    address: "台北市中山區南京東路一段 29 號",
    timeLabel: "時間",
    time: "週五 19:30，19:15 開始報到",
    priceLabel: "套餐",
    price: "4 人桌 NT$9,120｜6 人桌 NT$13,680",
    sessionKicker: "OPENRICE RESERVED",
    sessionTitle: "把想吃的這一晚，先留給自己",
    sessionIntro: "厚切熟成豬肉上桌後由專人代烤，接著是牛小排與熱騰騰泡菜鍋。選一個週五，OpenRice 已替 Asia Miles 會員保留席次。",
    sessionPhotoCaption: "熟成肉品現烤上桌",
    sessionExperience: "專人桌邊代烤・五款肉品完整套餐",
    sessionPrice: "每位 NT$2,280｜已含 10% 服務費",
    four: "4 人桌",
    six: "6 人桌",
    remaining: "剩餘",
    tables: "桌",
    choose: "選這一晚",
    soldOut: "已售完",
    closed: "尚未開放",
    almost: "即將售完",
    available: "尚有席次",
    aboutKicker: "THE RESTAURANT",
    aboutTitle: "經典韓式燒肉，由專人替你烤到剛好。",
    aboutBody: "金豬食堂以厚切熟成豬肉與專人桌邊代烤聞名，連續多年獲《米其林指南》必比登推薦並名列 50 Best Discovery。這次不必現場候位，OpenRice 已先為 Asia Miles 會員保留席次。",
    experienceTitle: "從選肉到代烤，每一桌都有專人照顧。",
    experienceCaptions: ["每日現切熟成肉品", "專人掌握每一塊肉的火候", "由韓台主廚團隊呈現首爾本店風味"],
    benefitTitle: "一張真正難得的桌",
    benefits: [
      { no: "01", title: "OpenRice 專屬保留位", body: "不用現場排隊，也不用等待一般訂位釋出；符合資格的 Asia Miles 會員可直接選位付款。" },
      { no: "02", title: "金豬經典一次到位", body: "招牌熟成豬肉、帶骨牛小排、泡菜鍋與主食都已安排，價格包含 10% 服務費。" },
      { no: "03", title: "直接付款，立即確認", body: "不必先下載 App 或申請帳號。以 Asia Miles 會員號碼確認資格後，即可完成訂位。" },
    ],
    serviceBy: "本活動由 OpenRice 提供訂位與付款服務。完成付款後，將訂位綁定至 OpenRice LINE，即可查詢、申請取消並接收行前通知。",
    menuKicker: "THE FULL SET MENU",
    menuTitle: "完整套餐內容",
    menuIntro: "五款肉品由專人桌邊代烤，搭配季節蔬菜、金豬經典泡菜鍋、韓國拉麵與越光米飯。",
    menuGroups: [
      { no: "01", label: "肉品", items: ["熟成豚梅花肉", "帶骨熟成豚五花", "熟成豚松阪", "熟成豚霜降", "特級帶骨牛小排"] },
      { no: "02", label: "蔬菜", items: ["季節生菜盤", "金豬特選羅勒", "調味蔬菜組（杏鮑菇、大蒜、大蔥）"] },
      { no: "03", label: "鍋物與主食", items: ["金豬經典泡菜鍋（含韓國農心 Q 拉麵、越光米飯）"] },
    ],
    menuPriceNote: "4 人桌與 6 人桌享用相同菜色；份量依桌型調整，價格已含 10% 服務費。",
    menuCta: "先看完整菜單",
    menuPreview: "五款肉品、季節蔬菜、金豬經典泡菜鍋、韓國農心 Q 拉麵與越光米飯。",
    menuNote: "實際品項依現場提供為準，恕不接受客製調整。",
    howTitle: "選好日期，四步完成訂位",
    steps: ["選擇專屬保留日期", "選 4 人或 6 人桌", "以會員號碼確認資格並付款", "將訂位綁定至 OpenRice LINE"],
    noticeTitle: "訂位前先看",
    noticeGroups: [
      { title: "報到方式", items: ["請於場次前 15 分鐘抵達餐廳。", "向服務人員表示為亞洲萬里通訂位貴賓，並出示會員卡及訂位確認。", "無法出示訂位確認者，恕無法入座、退款或改期。"] },
      { title: "訂購須知", items: ["完成訂位後無法修改日期、場次或桌數。", "訂位查詢與取消申請僅透過 OpenRice LINE 官方帳號辦理；退款方式與期限依正式活動規則為準。", "套餐限對應人數用餐；人數不足不退費，也不提供加人。", "遲到超過 15 分鐘或未報到視同放棄，不退款、不改期。", "如有過敏、素食或不食辣需求，購買前請先確認可接受固定菜單。"] },
      { title: "場地與其他規範", items: ["不提供自備酒水，桌位由餐廳安排。", "除導盲犬外恕不開放寵物入場，餐廳內全面禁菸。", "現場將進行拍攝，影像可能用於活動宣傳。", "不可抗力造成活動取消時，將於活動頁公告後續辦法。"] },
    ],
    selectTitle: "選擇桌型",
    selectSub: "同一場次可混搭 4 人桌與 6 人桌，每筆訂單合計最多 2 桌。",
    includes: "套餐內容相同，價格已含 10% 服務費",
    subtotal: "合計",
    checkout: "前往結帳",
    back: "返回",
    checkoutTitle: "結帳",
    checkoutSub: "填寫聯絡資料，以 Asia Miles 會員號碼確認活動資格後即可付款。",
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
    doneStatus: "付款成功",
    doneTitle: "訂位已成立",
    doneSub: "確認信已寄至你的電子郵件（示意）。下一步請先綁定 OpenRice LINE；之後的查詢、取消申請與提醒都會在 LINE 辦理。",
    lineEyebrow: "下一步｜管理這筆訂位",
    lineTitle: "現在綁定 OpenRice LINE",
    lineBody: "此活動頁不提供網站查單。綁定後，可直接在 OpenRice LINE 查詢訂位、提出取消申請並接收通知。",
    lineBenefits: ["隨時查詢訂位編號、日期與桌型", "依活動規則提出取消申請", "接收用餐提醒、地址導航與臨時異動"],
    lineActionLabel: "訂位管理入口",
    lineActionNote: "約 10 秒完成｜不需下載 OpenRice App",
    lineButton: "立即綁定這筆訂位",
    lineUnavailable: "訂位已成立，但 LINE 綁定連結暫時無法產生。請保留訂位編號並聯絡 OpenRice 客服。",
    linePrivacy: "LINE 僅用於本次訂位管理與必要服務通知；你可以隨時關閉通知。",
    orderNo: "訂單編號",
    dining: "用餐場次",
    items: "訂購內容",
    diner: "訂位人",
    paidBy: "付款方式",
    total: "實付金額",
    bookingStatusLabel: "訂位狀態",
    bookingStatus: "已付款・已成立",
    arrivalProof: "用餐當日請出示訂位編號與 Asia Miles 會員卡。",
    home: "回活動首頁",
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
    lang: "中文",
    heroEyebrow: "EXCLUSIVE TO ASIA MILES MEMBERS | RESERVED BY OPENRICE",
    heroTitle: "Taipei’s hard-to-book table, reserved for you.",
    heroLead: "OpenRice has secured selected Friday evening seats at Gold Pig for Asia Miles members. Choose a date and table, then pay to confirm.",
    trustLine: "Asia Miles members only · Four Friday evenings · Confirmed after payment",
    book: "View reserved dates",
    venueLabel: "Venue",
    venue: "Gold Pig, Taipei Flagship",
    address: "No. 29, Sec. 1, Nanjing E. Rd., Taipei",
    timeLabel: "Time",
    time: "Fridays at 7:30 PM; check-in from 7:15 PM",
    priceLabel: "Set menu",
    price: "Table for 4 NT$9,120 | Table for 6 NT$13,680",
    sessionKicker: "OPENRICE RESERVED",
    sessionTitle: "Save a Friday night for something delicious",
    sessionIntro: "Thick-cut aged pork is grilled for you at the table, followed by bone-in beef short rib and bubbling kimchi stew. Choose your Friday; OpenRice has reserved the seats for Asia Miles members.",
    sessionPhotoCaption: "Aged cuts, grilled at your table",
    sessionExperience: "Tableside grilling · Five-cut complete set menu",
    sessionPrice: "NT$2,280 per guest | 10% service included",
    four: "Table for 4",
    six: "Table for 6",
    remaining: "Left",
    tables: "tables",
    choose: "Choose this night",
    soldOut: "Sold out",
    closed: "Not open",
    almost: "Almost full",
    available: "Seats available",
    aboutKicker: "THE RESTAURANT",
    aboutTitle: "Classic Korean barbecue, grilled for you at the table.",
    aboutBody: "Gold Pig is known for thick-cut aged pork and expert tableside grilling, with years of Michelin Bib Gourmand recognition and a place on 50 Best Discovery. No walk-in wait is needed: OpenRice has already reserved selected seats for Asia Miles members.",
    experienceTitle: "From hand-cut meat to tableside grilling, every detail is looked after.",
    experienceCaptions: ["Aged cuts prepared fresh each day", "Every cut grilled to its best finish", "The Seoul experience delivered by Korean and Taiwanese chefs"],
    benefitTitle: "A table worth making plans for",
    benefits: [
      { no: "01", title: "Reserved by OpenRice", body: "No walk-in queue and no wait for public availability. Eligible Asia Miles members can select and pay directly." },
      { no: "02", title: "Gold Pig classics included", body: "Signature aged pork, bone-in beef short rib, kimchi stew and staples, with the 10% service charge included." },
      { no: "03", title: "One clear checkout", body: "There is no need to download an app or create an account first. Verify with your Asia Miles membership number and confirm." },
    ],
    serviceBy: "OpenRice provides booking and payment for this event. After payment, link the booking to OpenRice LINE to view it, request cancellation and receive service updates.",
    menuKicker: "THE FULL SET MENU",
    menuTitle: "The complete set menu",
    menuIntro: "Five premium cuts are grilled for you at the table, with seasonal vegetables, Gold Pig kimchi stew, Korean noodles and Koshihikari rice.",
    menuGroups: [
      { no: "01", label: "Meats", items: ["Aged pork collar", "Bone-in aged pork belly", "Aged pork jowl", "Aged marbled pork", "Premium bone-in beef short rib"] },
      { no: "02", label: "Vegetables", items: ["Seasonal lettuce platter", "Gold Pig selected basil", "Seasoned vegetables (king oyster mushroom, garlic and spring onion)"] },
      { no: "03", label: "Stew & staples", items: ["Gold Pig kimchi stew with Nongshim Q noodles and Koshihikari rice"] },
    ],
    menuPriceNote: "Tables for 4 and 6 enjoy the same menu, with portions adjusted by table size. Prices include the 10% service charge.",
    menuCta: "See the full menu",
    menuPreview: "Five premium cuts, seasonal vegetables, Gold Pig kimchi stew, Nongshim Q noodles and Koshihikari rice.",
    menuNote: "Items may vary on the day. Menu changes are not available.",
    howTitle: "Four steps from date to confirmation",
    steps: ["Choose a reserved date", "Choose a table for 4 or 6", "Verify membership and pay", "Link the booking to OpenRice LINE"],
    noticeTitle: "Before you book",
    noticeGroups: [
      { title: "Check-in", items: ["Arrive 15 minutes before your seating.", "Tell staff you are an Asia Miles guest and show your membership card and booking confirmation.", "Guests without confirmation cannot be admitted, refunded or moved."] },
      { title: "Booking policy", items: ["Date, seating and table size cannot be changed after payment.", "Booking enquiries and cancellation requests are handled only through the OpenRice LINE Official Account. Refund method and deadlines follow the final event policy.", "Sets are for the listed party size; unused seats are not refundable and extra guests cannot be added.", "Guests over 15 minutes late or absent forfeit the booking without refund.", "Please confirm the fixed menu is suitable for any allergies or dietary needs before purchase."] },
      { title: "Venue policy", items: ["Outside alcohol is not allowed and seating is assigned by the restaurant.", "Only guide dogs are admitted. Smoking is prohibited.", "Photography and filming may take place for event promotion.", "If force majeure affects the event, next steps will be posted on this page."] },
    ],
    selectTitle: "Choose table size",
    selectSub: "Mix tables for 4 and 6 within the same seating. Maximum two tables per order.",
    includes: "Same set menu; price includes 10% service charge",
    subtotal: "Total",
    checkout: "Continue to checkout",
    back: "Back",
    checkoutTitle: "Checkout",
    checkoutSub: "Enter your details and verify with your Asia Miles membership number to pay.",
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
    doneStatus: "Payment successful",
    doneTitle: "Your booking is confirmed",
    doneSub: "A confirmation has been emailed to you (demo). Next, link OpenRice LINE for future booking enquiries, cancellation requests and reminders.",
    lineEyebrow: "NEXT｜MANAGE THIS BOOKING",
    lineTitle: "Link OpenRice LINE now",
    lineBody: "This campaign page does not provide online order lookup. Link LINE to view this booking, request cancellation and receive updates.",
    lineBenefits: ["View the booking number, date and table size anytime", "Request cancellation under the event policy", "Receive reminders, directions and important updates"],
    lineActionLabel: "BOOKING MANAGEMENT",
    lineActionNote: "Takes about 10 seconds · No OpenRice app required",
    lineButton: "Link this booking now",
    lineUnavailable: "Your booking is confirmed, but the LINE link is temporarily unavailable. Keep your booking number and contact OpenRice support.",
    linePrivacy: "LINE is used only for this booking and essential service notices. You can turn notifications off at any time.",
    orderNo: "Order number",
    dining: "Seating",
    items: "Items",
    diner: "Guest",
    paidBy: "Paid with",
    total: "Total paid",
    bookingStatusLabel: "Booking status",
    bookingStatus: "Paid · Confirmed",
    arrivalProof: "Show your booking number and Asia Miles membership card on arrival.",
    home: "Event home",
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

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [view]);

  const persist = (next: Database) => {
    setDb(next);
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch { /* demo fallback */ }
  };

  const navigate = (next: View) => {
    if (view === "admin" && adminDirty && next !== "admin" && !window.confirm(c.leave)) return;
    setView(next);
    setErrors([]);
  };

  const toggleLang = () => {
    const next: Lang = lang === "tc" ? "en" : "tc";
    setLang(next);
    try { window.localStorage.setItem(LANG_KEY, next); } catch { /* ignore */ }
  };

  const session = db.sessions.find((item) => item.id === cart.sessionId);
  const orderTotal = cart.t4 * db.prices.t4 + cart.t6 * db.prices.t6;
  const lastOrder = db.orders.find((order) => order.no === lastOrderNo);
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
    window.setTimeout(async () => {
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
      let no = `GP${String(Date.now()).slice(-8)}`;
      let lineBindUrl = "";
      let lineSetupError = false;
      try {
        const response = await fetch(`${LINE_CRM_ORIGIN}/api/gold-pig/demo-bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            date: commitSession.date,
            time: commitSession.time,
            tables4: cart.t4,
            tables6: cart.t6,
            totalAmount: cart.t4 * commit.prices.t4 + cart.t6 * commit.prices.t6,
            paymentMethod: payMethod,
          }),
        });
        const result = await response.json();
        if (!response.ok || !result.ok || !result.booking?.bookingNo || !result.bindUrl) throw new Error("line_setup_failed");
        no = result.booking.bookingNo;
        lineBindUrl = result.bindUrl;
      } catch {
        lineSetupError = true;
      }
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
        lineBindUrl,
        lineSetupError,
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
      <img className="asiaMilesLogo" src="./assets/asia-miles-logo-transparent.png" alt="Asia Miles" />
      <i aria-hidden="true">×</i>
      <img className="openRiceLogo" src="./assets/openrice-logo.svg" alt="OpenRice 開飯喇" />
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
        <aside className="bookingStatusPanel">
          <small>{c.bookingStatusLabel}</small>
          <strong>{c.bookingStatus}</strong>
          <p>{c.arrivalProof}</p>
        </aside>
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
          <a className="headerCta" href="#sessions">{c.book}</a>
          <button className="langButton" onClick={toggleLang}>{c.lang}</button>
        </nav>
      </header>
    </>
  );

  const renderHome = () => (
    <main>
      <section className="campaignMasthead" aria-label={lang === "tc" ? "金豬食堂活動主視覺" : "Gold Pig campaign visual"}>
        <img src="./assets/gold-pig-hero.jpg" alt={lang === "tc" ? "國泰航空服務人員與金豬食堂活動主視覺" : "Cathay service ambassador with the Gold Pig campaign"} />
      </section>

      <section className="memberHero">
        <div className="memberHeroCopy">
          <p className="eyebrow">{c.heroEyebrow}</p>
          <h1>{c.heroTitle}</h1>
          <p className="heroLead">{c.heroLead}</p>
          <div className="heroActions">
            <a className="primaryButton" href="#sessions">{c.book}</a>
            <a className="menuTextLink" href="#menu">{c.menuCta} ↓</a>
          </div>
          <p className="trustLine">{c.trustLine}</p>
        </div>
        <figure className="memberHeroPhoto">
          <img src="./assets/gold-pig-grilled-pork-highres.jpg" alt={lang === "tc" ? "金豬食堂桌邊代烤熟成燒肉" : "Gold Pig aged barbecue grilled at the table"} />
          <figcaption><span>TABLESIDE GRILLING</span><b>{lang === "tc" ? "桌邊代烤實景" : "Grilled at your table"}</b></figcaption>
        </figure>
      </section>

      <dl className="factsStrip">
        <div><dt>{c.venueLabel}</dt><dd>{c.venue}<small>{c.address}</small></dd></div>
        <div><dt>{c.timeLabel}</dt><dd>{c.time}</dd></div>
        <div><dt>{c.priceLabel}</dt><dd>{c.price}</dd></div>
      </dl>

      <section className="menuSection" id="menu">
        <div className="menuShowcase">
          <figure className="menuHeroPhoto">
            <img loading="lazy" src="./assets/gold-pig-table-spread-highres.jpg" alt={lang === "tc" ? "熟成豬肉、牛小排、泡菜鍋與配菜完整套餐" : "Complete set with aged pork, beef short rib, kimchi stew and sides"} />
            <figcaption>{lang === "tc" ? "金豬食堂經典套餐實拍" : "Gold Pig signature set menu"}</figcaption>
          </figure>
          <div className="menuShowcaseCopy">
            <p className="eyebrow">{c.menuKicker}</p>
            <h2>{c.menuTitle}</h2>
            <p className="menuIntro">{c.menuIntro}</p>
            <div className="menuGroups">
              {c.menuGroups.map((group) => (
                <section className="menuGroup" key={group.no}>
                  <header><span>{group.no}</span><h3>{group.label}</h3></header>
                  <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
              ))}
            </div>
            <p className="menuPriceNote">{c.menuPriceNote}</p>
            <small className="menuNote">{c.menuNote}</small>
          </div>
        </div>
      </section>

      <section className="experienceSection sectionRule">
        <div className="experienceHeading">
          <p className="eyebrow">THE GOLD PIG EXPERIENCE</p>
          <h2>{c.experienceTitle}</h2>
        </div>
        <div className="photoMosaic">
          <figure className="photoMosaicLead"><img loading="lazy" src="./assets/gold-pig-meat-prep.jpg" alt={c.experienceCaptions[0]} /><figcaption>{c.experienceCaptions[0]}</figcaption></figure>
          <figure><img loading="lazy" src="./assets/gold-pig-grilled-pork-highres.jpg" alt={c.experienceCaptions[1]} /><figcaption>{c.experienceCaptions[1]}</figcaption></figure>
          <figure><img loading="lazy" src="./assets/gold-pig-chefs.jpg" alt={c.experienceCaptions[2]} /><figcaption>{c.experienceCaptions[2]}</figcaption></figure>
        </div>
      </section>

      <section className="benefitSection sectionRule">
        <div className="benefitHeading"><p className="eyebrow">MEMBERS ONLY</p><h2>{c.benefitTitle}</h2></div>
        <div className="benefitGrid">{c.benefits.map((benefit) => <article key={benefit.no}><b>{benefit.no}</b><h3>{benefit.title}</h3><p>{benefit.body}</p></article>)}</div>
        <p className="serviceNote">{c.serviceBy}</p>
      </section>

      <section className="sessionsSection" id="sessions">
        <div className="sessionsInner">
          <div className="sessionLead">
            <div className="sessionLeadCopy">
              <p className="eyebrow">{c.sessionKicker}</p>
              <h2>{c.sessionTitle}</h2>
              <p>{c.sessionIntro}</p>
              <span className="sessionPrice">{c.sessionPrice}</span>
            </div>
            <figure className="sessionFeaturePhoto">
              <img loading="lazy" src="./assets/gold-pig-grilled-pork-highres.jpg" alt={lang === "tc" ? "金豬食堂熟成肉品桌邊現烤" : "Gold Pig aged cuts grilled at the table"} />
              <figcaption>{c.sessionPhotoCaption}</figcaption>
            </figure>
          </div>
          <div className="sessionGrid">
            {db.sessions.slice().sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).map((item) => {
              const r4 = remaining(item, "t4");
              const r6 = remaining(item, "t6");
              const sold = r4 + r6 === 0;
              const low = r4 + r6 > 0 && r4 + r6 <= 4;
              const statusClass = !item.open || sold ? "closed" : low ? "low" : "";
              return (
                <article className="sessionCard" key={item.id}>
                  <header>
                    <div className="sessionDate"><strong>{formatDate(item.date)}</strong><span>{item.time}</span></div>
                    <div className={`statusText ${statusClass}`}>{!item.open ? c.closed : sold ? c.soldOut : low ? c.almost : c.available}</div>
                  </header>
                  <p className="sessionExperience">{c.sessionExperience}</p>
                  <footer>
                    <div className="sessionStock"><span>{c.four}<b>{r4}<small>{c.tables}</small></b></span><span>{c.six}<b>{r6}<small>{c.tables}</small></b></span></div>
                    <button disabled={!item.open || sold} onClick={() => chooseSession(item)}>{!item.open ? c.closed : sold ? c.soldOut : c.choose}</button>
                  </footer>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="storySection sectionRule">
        <div className="storyImage"><img src="./assets/gold-pig-taipei-building.jpg" alt={lang === "tc" ? "金豬食堂台北旗艦店外觀" : "Gold Pig Taipei flagship"} /></div>
        <div className="storyCopy">
          <p className="eyebrow">{c.aboutKicker}</p>
          <h2>{c.aboutTitle}</h2>
          <p>{c.aboutBody}</p>
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

  const renderPackage = () => {
    if (!session) return renderHome();
    const totalQty = cart.t4 + cart.t6;
    return (
      <main className="subpage packagePage">
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
                <img src={isFour ? "./assets/gold-pig-meat-prep.jpg" : "./assets/gold-pig-grilled-pork-highres.jpg"} alt="" />
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
        <aside className="packageMenuPreview">
          <img loading="lazy" src="./assets/gold-pig-table-spread-highres.jpg" alt="" />
          <div><b>{c.menuTitle}</b><p>{c.menuPreview}</p><small>{c.menuNote}</small></div>
        </aside>
        <div className="stickySummary">
          <div><span>{c.subtotal}</span><strong>{money(orderTotal)}</strong></div>
          <button className="primaryButton" disabled={!totalQty} onClick={() => navigate("checkout")}>{c.checkout}</button>
        </div>
      </main>
    );
  };

  const renderCheckout = () => {
    if (!session || cart.t4 + cart.t6 === 0) return renderPackage();
    const setFormValue = (key: keyof typeof form, value: string) => {
      setForm((current) => ({ ...current, [key]: value }));
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
              <div className="mobileCheckoutSubmit">
                <div><span>{c.subtotal}</span><strong>{money(orderTotal)}</strong></div>
                <button className="primaryButton" type="submit">{c.pay}</button>
              </div>
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

  const renderDone = () => {
    if (!lastOrder) return renderHome();
    return (
      <main className="subpage donePage">
        <p className="doneStatus"><span aria-hidden="true">✓</span>{c.doneStatus}</p>
        <h1>{c.doneTitle}</h1>
        <p className="subLead">{c.doneSub}</p>
        <section className="lineHandoff">
          <div className="lineHandoffCopy">
            <p className="eyebrow">{c.lineEyebrow}</p>
            <h2>{c.lineTitle}</h2>
            <p>{c.lineBody}</p>
          </div>
          <div className="lineHandoffAction">
            <b className="lineActionLabel">{c.lineActionLabel}</b>
            {lastOrder.lineBindUrl ? (
              <a className="lineButton" href={lastOrder.lineBindUrl}>
                <span className="lineMark" aria-hidden="true">LINE</span>
                {c.lineButton}
              </a>
            ) : (
              <p className="lineUnavailable" role="status">{c.lineUnavailable}</p>
            )}
            {lastOrder.lineBindUrl && <small className="lineActionNote">{c.lineActionNote}</small>}
          </div>
          <div className="lineHandoffDetails">
            <ul>{c.lineBenefits.map((item) => <li key={item}>{item}</li>)}</ul>
            <small>{c.linePrivacy}</small>
          </div>
        </section>
        <Ticket order={lastOrder} />
        <div className="doneActions">
          <button className="secondaryButton" onClick={() => navigate("home")}>{c.home}</button>
        </div>
      </main>
    );
  };

  const renderAdmin = () => {
    if (!adminDraft) return renderHome();
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
      {view === "home" && renderHome()}
      {view === "package" && renderPackage()}
      {view === "checkout" && renderCheckout()}
      {view === "done" && renderDone()}
      {view === "admin" && renderAdmin()}
      <footer className="siteFooter">
        <div><BrandLockup /><small>{c.serviceBy}<br />Copyright © OpenRice Group Inc.｜DEMO</small></div>
      </footer>
      {paying && <div className="paymentOverlay" role="status"><div><strong>{c.processing}</strong><span>{c.processingSub}</span><i /></div></div>}
    </div>
  );
}
