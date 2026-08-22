/**
 * Local messenger workspace: a WhatsApp-inspired, fully navigable shell.
 * Every view is local-only; no contacts, messages, calls, or profile data are imported from WhatsApp.
 */
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  Bell,
  BellOff,
  Camera,
  CheckCheck,
  ChevronDown,
  CircleUserRound,
  Clock3,
  FileText,
  Image,
  Link2,
  LockKeyhole,
  Menu,
  MessageCircleMore,
  Mic,
  MoreVertical,
  Phone,
  Plus,
  Power,
  Search,
  SendHorizontal,
  Settings,
  ShieldCheck,
  Smile,
  UserRoundPlus,
  UsersRound,
  Video,
  Volume2,
  X,
} from "lucide-react";
import { toast } from "sonner";

type View = "chats" | "calls" | "status" | "camera" | "communities" | "settings" | "profile";

type Message = { id: string; text: string; time: string; sender: "me" | "them" };
type Chat = { id: string; name: string; initials: string; color: string; preview: string; time: string; messages: Message[] };
type CallRecord = { id: string; time: string };
type LocalStatus = { id: string; text: string; time: string };
type Community = { id: string; name: string; initials: string; color: string };

const LOCAL_KEY = "whatsapp-empty-local-chats-v1";
const OLD_KEY = "whatsapp-local-demo-chats";
const VIEW_KEY = "whatsapp-empty-local-view-v1";
const PROFILE_KEY = "whatsapp-empty-local-profile-v1";

const navItems: { id: View; label: string; icon: typeof MessageCircleMore; group: "top" | "bottom" }[] = [
  { id: "chats", label: "Чаты", icon: MessageCircleMore, group: "top" },
  { id: "calls", label: "Звонки", icon: Phone, group: "top" },
  { id: "status", label: "Статус", icon: Clock3, group: "top" },
  { id: "camera", label: "Камера", icon: Camera, group: "top" },
  { id: "communities", label: "Сообщества", icon: UsersRound, group: "top" },
  { id: "settings", label: "Настройки", icon: Settings, group: "bottom" },
  { id: "profile", label: "Профиль", icon: CircleUserRound, group: "bottom" },
];

function formatTime() {
  return new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function makeInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]).join("").toLocaleUpperCase() || "Ч";
}

function avatarColor(name: string) {
  const colors = ["#d7ebe4", "#f2dfcd", "#d9e9f6", "#f3e4bc", "#e4dff3", "#cde9e1"];
  const sum = Array.from(name).reduce((value, letter) => value + letter.charCodeAt(0), 0);
  return colors[sum % colors.length];
}

function ChatAvatar({ chat, large = false }: { chat: Chat; large?: boolean }) {
  return <div className={`${large ? "h-10 w-10 text-sm" : "h-12 w-12 text-[15px]"} grid shrink-0 place-items-center rounded-full font-semibold text-[#3c3c3c]`} style={{ backgroundColor: chat.color }} aria-hidden="true">{chat.initials}</div>;
}

function EmptyIllustration({ title, detail, action, onAction, icon: Icon = MessageCircleMore }: { title: string; detail: string; action?: string; onAction?: () => void; icon?: typeof MessageCircleMore }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-[#e3f5ee] text-[#00a884] shadow-sm"><Icon className="h-8 w-8 stroke-[1.55]" /></div>
      <h1 className="text-[25px] font-light tracking-[-0.025em] text-[#41525d]">{title}</h1>
      <p className="mt-3 max-w-[420px] text-[14px] leading-6 text-[#667781]">{detail}</p>
      {action && onAction && <button onClick={onAction} className="mt-5 rounded-lg bg-[#00a884] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#008f70] active:scale-[0.97]">{action}</button>}
    </div>
  );
}

function SectionHeader({ title, subtitle, action, actionLabel }: { title: string; subtitle?: string; action?: () => void; actionLabel?: string }) {
  return (
    <header className="flex min-h-[76px] items-center justify-between border-b border-[#e9edef] bg-[#f0f2f5] px-5 sm:px-6">
      <div><h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[#111b21]">{title}</h1>{subtitle && <p className="mt-0.5 text-[12px] text-[#667781]">{subtitle}</p>}</div>
      {action && actionLabel && <button onClick={action} className="rounded-lg bg-[#00a884] px-3.5 py-2 text-[12px] font-semibold text-white transition hover:bg-[#008f70]">{actionLabel}</button>}
    </header>
  );
}

function CallsView() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  function startCall() {
    setCalls((current) => [{ id: crypto.randomUUID(), time: formatTime() }, ...current]);
    toast("Локальный звонок создан", { description: "Это запись интерфейса; соединение с WhatsApp не выполняется." });
  }
  return (
    <section className="flex min-w-0 flex-1 flex-col bg-white">
      <SectionHeader title="Звонки" subtitle="Локальная история звонков" action={startCall} actionLabel="Новый звонок" />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="m-5 flex items-center gap-3 rounded-xl border border-[#d9eee5] bg-[#f4fbf7] p-4"><Link2 className="h-5 w-5 text-[#00a884]" /><div className="flex-1"><p className="text-[13px] font-semibold text-[#263b34]">Создать ссылку на звонок</p><p className="mt-0.5 text-[11px] text-[#667781]">Ссылка существует только в этом локальном макете.</p></div><button onClick={() => toast("Ссылка скопирована", { description: "Скопирована демонстрационная локальная ссылка." })} className="text-[12px] font-semibold text-[#008069]">Создать</button></div>
        {calls.length ? <div className="px-5 pb-5">{calls.map((call) => <div key={call.id} className="flex items-center gap-3 border-b border-[#f0f2f5] py-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#e8f5ef] text-[#00a884]"><Phone className="h-5 w-5" /></div><div className="flex-1"><p className="text-sm font-medium">Локальный звонок</p><p className="mt-0.5 text-[11px] text-[#667781]">Сегодня, {call.time}</p></div><button onClick={() => toast("Звонок не подключён", { description: "В этой версии вызовы не выходят за пределы браузера." })} className="grid h-9 w-9 place-items-center rounded-full text-[#54656f] hover:bg-[#f0f2f5]"><Phone className="h-4 w-4" /></button></div>)}</div> : <EmptyIllustration title="Недавних звонков нет" detail="Нажмите «Новый звонок», чтобы проверить работу локальной истории." action="Начать локальный звонок" onAction={startCall} icon={Phone} />}
      </div>
    </section>
  );
}

function StatusView() {
  const [statusText, setStatusText] = useState("");
  const [statuses, setStatuses] = useState<LocalStatus[]>([]);
  function addStatus(event: FormEvent) {
    event.preventDefault();
    const text = statusText.trim();
    if (!text) return;
    setStatuses((current) => [{ id: crypto.randomUUID(), text, time: formatTime() }, ...current]);
    setStatusText("");
  }
  return (
    <section className="flex min-w-0 flex-1 flex-col bg-white">
      <SectionHeader title="Статус" subtitle="Публикации видны только в этом браузере" />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6 sm:px-8">
        <form onSubmit={addStatus} className="mx-auto w-full max-w-[600px] rounded-2xl border border-[#dce7e2] bg-[#f7fbf9] p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#d9fdd3] text-[#008069]"><Clock3 className="h-5 w-5" /></div><input value={statusText} onChange={(event) => setStatusText(event.target.value)} className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#88969c]" placeholder="Напишите свой статус" maxLength={140} /><button disabled={!statusText.trim()} className="rounded-lg bg-[#00a884] px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-45">Добавить</button></div></form>
        {statuses.length ? <div className="mx-auto mt-6 w-full max-w-[600px]"><p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.09em] text-[#667781]">Мои обновления</p>{statuses.map((status) => <div key={status.id} className="mb-2 flex items-center gap-3 rounded-xl border border-[#eef1f0] px-4 py-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#d9fdd3] text-[#008069]"><Clock3 className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm text-[#263b34]">{status.text}</p><p className="mt-0.5 text-[11px] text-[#667781]">Сегодня, {status.time}</p></div></div>)}</div> : <EmptyIllustration title="Статусов пока нет" detail="Добавьте текстовый статус, чтобы увидеть его в локальном списке." icon={Clock3} />}
      </div>
    </section>
  );
}

function CameraView() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (videoRef.current) videoRef.current.srcObject = stream; return () => stream?.getTracks().forEach((track) => track.stop()); }, [stream]);
  async function startCamera() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      const nextStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(nextStream);
    } catch {
      toast("Нет доступа к камере", { description: "Разрешите доступ в браузере, чтобы использовать локальный предпросмотр." });
    }
  }
  function stopCamera() { stream?.getTracks().forEach((track) => track.stop()); setStream(null); }
  return (
    <section className="flex min-w-0 flex-1 flex-col bg-[#111b21]">
      <header className="flex min-h-[76px] items-center justify-between border-b border-white/10 px-5 text-white sm:px-6"><div><h1 className="text-[20px] font-semibold">Камера</h1><p className="mt-0.5 text-[12px] text-white/55">Предпросмотр работает только на этом устройстве</p></div>{stream && <button onClick={stopCamera} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-[12px] font-semibold hover:bg-white/15"><Power className="h-4 w-4" /> Остановить</button>}</header>
      <div className="flex flex-1 items-center justify-center p-6"><div className="relative flex aspect-video w-full max-w-[850px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#1e2b32] shadow-2xl">{stream ? <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" /> : <div className="text-center text-white"><Camera className="mx-auto h-12 w-12 text-[#69d6b6]" /><p className="mt-4 text-lg font-medium">Камера выключена</p><p className="mt-2 max-w-[340px] text-sm leading-6 text-white/55">Включите камеру, чтобы получить локальный предпросмотр. Запись и передача изображения не выполняются.</p><button onClick={startCamera} className="mt-6 rounded-lg bg-[#00a884] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#008f70]">Включить камеру</button></div>}</div></div>
    </section>
  );
}

function CommunitiesView() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [name, setName] = useState("");
  function addCommunity(event: FormEvent) { event.preventDefault(); const value = name.trim(); if (!value) return; setCommunities((current) => [{ id: crypto.randomUUID(), name: value, initials: makeInitials(value), color: avatarColor(value) }, ...current]); setName(""); }
  return (
    <section className="flex min-w-0 flex-1 flex-col bg-white"><SectionHeader title="Сообщества" subtitle="Управляйте локальными сообществами" /><div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6 sm:px-8"><form onSubmit={addCommunity} className="mx-auto flex w-full max-w-[600px] gap-2 rounded-2xl border border-[#dce7e2] bg-[#f7fbf9] p-3"><input value={name} onChange={(event) => setName(event.target.value)} className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-[#88969c]" placeholder="Название сообщества" maxLength={64} /><button disabled={!name.trim()} className="inline-flex items-center gap-2 rounded-lg bg-[#00a884] px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-45"><Plus className="h-4 w-4" /> Создать</button></form>{communities.length ? <div className="mx-auto mt-5 w-full max-w-[600px]">{communities.map((community) => <div key={community.id} className="mb-2 flex items-center gap-3 rounded-xl border border-[#eef1f0] p-3"><div className="grid h-11 w-11 place-items-center rounded-xl font-semibold" style={{ backgroundColor: community.color }}>{community.initials}</div><div className="flex-1"><p className="text-sm font-medium">{community.name}</p><p className="mt-0.5 text-[11px] text-[#667781]">Локальное сообщество</p></div><button onClick={() => toast("Сообщество открыто", { description: "Пока в нём нет добавленных участников." })} className="text-[12px] font-semibold text-[#008069]">Открыть</button></div>)}</div> : <EmptyIllustration title="Сообществ пока нет" detail="Создайте локальное сообщество. Участники и данные не импортируются." icon={UsersRound} />}</div></section>
  );
}

function SettingsView() {
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [compact, setCompact] = useState(false);
  const rows = [
    { label: "Уведомления", detail: "Показывать уведомления в интерфейсе", value: notifications, change: setNotifications, icon: Bell },
    { label: "Звуки", detail: "Воспроизводить локальные звуки интерфейса", value: sounds, change: setSounds, icon: Volume2 },
    { label: "Компактный вид", detail: "Уменьшить плотность элементов", value: compact, change: setCompact, icon: Settings },
  ];
  return <section className="flex min-w-0 flex-1 flex-col bg-white"><SectionHeader title="Настройки" subtitle="Параметры сохраняются только в этой вкладке" /><div className="mx-auto w-full max-w-[720px] px-5 py-7">{rows.map((row) => { const Icon = row.icon; return <div key={row.label} className="flex items-center gap-4 border-b border-[#edf0ef] py-4"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0f2f5] text-[#54656f]"><Icon className="h-5 w-5" /></div><div className="flex-1"><p className="text-sm font-medium">{row.label}</p><p className="mt-0.5 text-[12px] text-[#667781]">{row.detail}</p></div><button onClick={() => row.change(!row.value)} role="switch" aria-checked={row.value} className={`relative h-6 w-11 rounded-full transition ${row.value ? "bg-[#00a884]" : "bg-[#cbd3d7]"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${row.value ? "left-6" : "left-1"}`} /></button></div>; })}<div className="mt-8 rounded-xl border border-[#d9eee5] bg-[#f4fbf7] p-4 text-[12px] leading-5 text-[#5a7067]"><ShieldCheck className="mb-2 h-5 w-5 text-[#00a884]" />Эти настройки не передаются в WhatsApp и не изменяют параметры вашего аккаунта.</div></div></section>;
}

function ProfileView() {
  const [profile, setProfile] = useState(() => { try { return JSON.parse(window.localStorage.getItem(PROFILE_KEY) ?? "{\"name\":\"\",\"info\":\"\"}") as { name: string; info: string }; } catch { return { name: "", info: "" }; } });
  const [saved, setSaved] = useState(false);
  function saveProfile(event: FormEvent) { event.preventDefault(); window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); setSaved(true); toast("Профиль сохранён локально", { description: "Эти сведения остаются только в браузере." }); }
  const initials = makeInitials(profile.name || "Профиль");
  return <section className="flex min-w-0 flex-1 flex-col bg-white"><SectionHeader title="Профиль" subtitle="Локальные данные профиля" /><form onSubmit={saveProfile} className="mx-auto w-full max-w-[600px] px-6 py-8"><div className="mx-auto mb-8 grid h-24 w-24 place-items-center rounded-full bg-[#d9fdd3] text-2xl font-semibold text-[#008069]">{initials}</div><label className="block text-[12px] font-medium text-[#3b4a54]">Имя<input value={profile.name} onChange={(event) => { setProfile({ ...profile, name: event.target.value }); setSaved(false); }} className="mt-1.5 h-11 w-full rounded-lg border border-[#d8dee1] px-3 text-sm outline-none focus:border-[#00a884] focus:ring-2 focus:ring-[#c5f4e6]" placeholder="Введите имя" maxLength={64} /></label><label className="mt-5 block text-[12px] font-medium text-[#3b4a54]">О себе<textarea value={profile.info} onChange={(event) => { setProfile({ ...profile, info: event.target.value }); setSaved(false); }} className="mt-1.5 min-h-24 w-full resize-none rounded-lg border border-[#d8dee1] px-3 py-2.5 text-sm outline-none focus:border-[#00a884] focus:ring-2 focus:ring-[#c5f4e6]" placeholder="Добавьте краткое описание" maxLength={160} /></label><div className="mt-6 flex items-center justify-between"><p className="text-[12px] text-[#667781]">{saved ? "Сохранено локально" : "Изменения ещё не сохранены"}</p><button className="rounded-lg bg-[#00a884] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#008f70]">Сохранить</button></div></form></section>;
}

function ChatsView({ chats, setChats }: { chats: Chat[]; setChats: React.Dispatch<React.SetStateAction<Chat[]>> }) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "starred">("all");
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? null;
  const filteredChats = useMemo(() => { const needle = query.trim().toLocaleLowerCase(); return chats.filter((chat) => !needle || `${chat.name} ${chat.preview}`.toLocaleLowerCase().includes(needle)); }, [chats, query, filter]);
  function createChat(event: FormEvent) { event.preventDefault(); const name = newChatName.trim(); if (!name) return; const chat: Chat = { id: crypto.randomUUID(), name, initials: makeInitials(name), color: avatarColor(name), preview: "", time: "", messages: [] }; setChats((current) => [chat, ...current]); setActiveChatId(chat.id); setNewChatName(""); setShowNewChat(false); }
  function handleSubmit(event: FormEvent) { event.preventDefault(); const text = message.trim(); if (!text || !activeChat) return; const time = formatTime(); const nextMessage: Message = { id: crypto.randomUUID(), text, time, sender: "me" }; setChats((current) => current.map((chat) => chat.id === activeChat.id ? { ...chat, preview: text, time, messages: [...chat.messages, nextMessage] } : chat)); setMessage(""); }
  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }
  return (
    <section className="flex min-w-0 flex-1 bg-white">
      <aside className="flex w-full shrink-0 flex-col border-r border-[#e9edef] bg-white md:w-[390px] lg:w-[420px]">
        <header className="flex h-[76px] items-center justify-between bg-[#f0f2f5] px-4"><div className="flex items-center gap-2.5"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#25d366] text-white shadow-sm"><MessageCircleMore className="h-5 w-5 fill-current stroke-[#25d366]" /></div><span className="text-[20px] font-bold tracking-[-0.04em] text-[#00a884]">WhatsApp</span></div><div className="flex gap-1"><button onClick={() => setShowNewChat(true)} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] hover:bg-[#dfe4e7]" aria-label="Новый чат"><Plus className="h-5 w-5" /></button><button onClick={() => toast("Меню открыто", { description: "Дополнительные действия доступны только в локальном интерфейсе." })} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] hover:bg-[#dfe4e7]" aria-label="Меню"><MoreVertical className="h-5 w-5" /></button></div></header>
        <div className="border-b border-[#e9edef] px-3 pb-3 pt-2"><label className="flex h-[38px] items-center gap-4 rounded-lg bg-[#f0f2f5] px-4 text-[#54656f]" htmlFor="chat-search"><Search className="h-[18px] w-[18px]" /><input id="chat-search" value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#667781]" placeholder="Поиск или новый чат" />{query && <button onClick={() => setQuery("")} aria-label="Очистить поиск"><X className="h-4 w-4" /></button>}</label></div>
        <div className="flex gap-2 overflow-x-auto border-b border-[#e9edef] px-3 py-2.5 [scrollbar-width:none]">{([ ["all", "Все"], ["unread", "Непрочитанное"], ["starred", "Избранное"] ] as const).map(([id, label]) => <button key={id} onClick={() => setFilter(id)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] transition ${filter === id ? "bg-[#d9fdd3] font-semibold text-[#008069]" : "border border-[#e0e4e6] bg-white text-[#54656f]"}`}>{label}</button>)}<button className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#e0e4e6] text-[#54656f]" onClick={() => toast("Дополнительные фильтры", { description: "В пустом интерфейсе пока нет новых фильтров." })}><ChevronDown className="h-4 w-4" /></button></div>
        <button onClick={() => toast("Закрытые чаты", { description: "В этой локальной версии закрытых чатов нет." })} className="flex h-[56px] items-center gap-5 border-b border-[#f0f2f5] px-5 text-left text-sm text-[#3b4a54] hover:bg-[#f5f6f6]"><LockKeyhole className="h-5 w-5 text-[#54656f]" /> Закрытые чаты</button><button onClick={() => toast("Архив", { description: "В этой локальной версии архив пуст." })} className="flex h-[56px] items-center gap-5 border-b border-[#f0f2f5] px-5 text-left text-sm text-[#3b4a54] hover:bg-[#f5f6f6]"><Archive className="h-5 w-5 text-[#54656f]" /> В архиве</button>
        <div className="min-h-0 flex-1 overflow-y-auto">{filteredChats.map((chat) => <button key={chat.id} onClick={() => setActiveChatId(chat.id)} className={`group flex w-full items-center gap-3 px-3 py-3 text-left transition ${chat.id === activeChat?.id ? "bg-[#f0f2f5]" : "hover:bg-[#f5f6f6]"}`}><ChatAvatar chat={chat} /><div className="min-w-0 flex-1 border-b border-[#f0f2f5] pb-3"><div className="flex gap-3"><p className="min-w-0 flex-1 truncate text-[15px] font-medium text-[#111b21]">{chat.name}</p><span className="text-[11px] text-[#667781]">{chat.time}</span></div><div className="mt-1 flex gap-1.5"><CheckCheck className="h-4 w-4 shrink-0 text-[#53bdeb]" /><p className="min-w-0 flex-1 truncate text-[13px] text-[#667781]">{chat.preview || "Нет сообщений"}</p></div></div></button>)}{!filteredChats.length && <div className="flex min-h-[280px] flex-col items-center justify-center px-9 text-center"><div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#e8f5ef] text-[#00a884]"><MessageCircleMore className="h-6 w-6" /></div><p className="text-sm font-medium text-[#3b4a54]">{query ? "Ничего не найдено" : "Чатов пока нет"}</p><p className="mt-1.5 max-w-[220px] text-[12px] leading-5 text-[#667781]">{query ? "Попробуйте изменить запрос." : "Создайте первый чат — он останется только в этом браузере."}</p>{!query && <button onClick={() => setShowNewChat(true)} className="mt-4 rounded-lg bg-[#00a884] px-3.5 py-2 text-[12px] font-semibold text-white">Создать чат</button>}</div>}</div>
      </aside>
      <section className="relative hidden min-w-0 flex-1 flex-col bg-[#efeae2] md:flex"><div className="absolute inset-0 bg-cover bg-center opacity-[0.27]" style={{ backgroundImage: "url('/manus-storage/chat-demo-wallpaper_84d6a701.jpg')" }} />{activeChat ? <><header className="relative z-10 flex h-[76px] items-center justify-between bg-[#f0f2f5] px-4"><div className="flex min-w-0 items-center gap-3"><ChatAvatar chat={activeChat} large /><h1 className="truncate text-[15px] font-medium">{activeChat.name}</h1></div><div className="flex gap-1"><button onClick={() => toast("Видеозвонок", { description: "Вызовы остаются в разделе «Звонки»." })} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f]"><Video className="h-5 w-5" /></button><button onClick={() => toast("Поиск", { description: "Поиск сообщений будет добавлен после создания сообщений." })} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f]"><Search className="h-5 w-5" /></button><button className="grid h-10 w-10 place-items-center rounded-full text-[#54656f]"><MoreVertical className="h-5 w-5" /></button></div></header><div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-[7%]"><div className="mx-auto mb-6 w-fit rounded-lg bg-[#ffeecd] px-3 py-1.5 text-[11px] text-[#54656f] shadow-sm">Сообщения сохраняются только в этом браузере.</div>{!activeChat.messages.length && <div className="mt-16 text-center text-sm text-[#667781]">Сообщений пока нет. Напишите первое сообщение самостоятельно.</div>}<div className="space-y-1.5">{activeChat.messages.map((item) => <div key={item.id} className={`flex ${item.sender === "me" ? "justify-end" : "justify-start"}`}><div className={`${item.sender === "me" ? "bg-[#d9fdd3]" : "bg-white"} max-w-[65%] rounded-lg px-2.5 py-1.5 shadow-sm`}><p className="whitespace-pre-wrap break-words text-[14px]">{item.text}</p><div className="mt-0.5 flex justify-end gap-1 text-[10px] text-[#667781]">{item.time}{item.sender === "me" && <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />}</div></div></div>)}</div></div></> : <EmptyIllustration title="Ваши чаты появятся здесь" detail="Создайте первый локальный чат. Контакты и сообщения не импортируются из WhatsApp." action="Создать первый чат" onAction={() => setShowNewChat(true)} />}
        <form onSubmit={handleSubmit} className="relative z-10 flex shrink-0 items-end gap-1 bg-[#f0f2f5] px-4 py-2"><div className="relative"><button type="button" disabled={!activeChat} onClick={() => setShowAttachmentMenu((value) => !value)} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] disabled:opacity-40"><Plus className="h-6 w-6" /></button>{showAttachmentMenu && activeChat && <div className="absolute bottom-12 left-0 z-30 w-44 rounded-xl bg-white py-1 shadow-xl"><button type="button" onClick={() => toast("Документ", { description: "Прикрепление файлов недоступно в локальном макете." })} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-[#f5f6f6]"><FileText className="h-4 w-4 text-[#7f66ff]" /> Документ</button><button type="button" onClick={() => toast("Фото", { description: "Прикрепление фото недоступно в локальном макете." })} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-[#f5f6f6]"><Image className="h-4 w-4 text-[#e55980]" /> Фото и видео</button><button type="button" onClick={() => toast("Контакт", { description: "Контакты не импортируются и не создаются автоматически." })} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-[#f5f6f6]"><CircleUserRound className="h-4 w-4 text-[#039be5]" /> Контакт</button></div>}</div><button type="button" disabled={!activeChat} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] disabled:opacity-40" onClick={() => toast("Смайлики", { description: "Панель смайликов будет добавлена отдельно." })}><Smile className="h-[22px] w-[22px]" /></button><textarea value={message} disabled={!activeChat} onChange={(event) => setMessage(event.target.value)} onKeyDown={onComposerKeyDown} className="max-h-28 min-h-10 flex-1 resize-none rounded-lg bg-white px-3 py-2.5 text-[14px] outline-none disabled:bg-[#e9edef]" placeholder={activeChat ? "Введите сообщение" : "Создайте или выберите чат"} rows={1} />{message.trim() && activeChat ? <button type="submit" className="grid h-10 w-10 place-items-center rounded-full text-[#54656f]"><SendHorizontal className="h-5 w-5" /></button> : <button type="button" disabled={!activeChat} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] disabled:opacity-40"><Mic className="h-5 w-5" /></button>}</form></section>
      {showNewChat && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111b21]/35 p-4 backdrop-blur-[1px]" role="dialog" aria-modal="true"><form onSubmit={createChat} className="w-full max-w-[390px] rounded-xl bg-white p-6 shadow-[0_16px_40px_rgba(11,20,26,0.25)] panel-enter"><div className="flex items-start justify-between gap-4"><div><h2 className="text-[20px] font-medium">Новый чат</h2><p className="mt-1 text-[13px] text-[#667781]">Название останется только в этом браузере.</p></div><button type="button" onClick={() => setShowNewChat(false)} className="grid h-8 w-8 place-items-center rounded-full text-[#54656f] hover:bg-[#f0f2f5]"><X className="h-5 w-5" /></button></div><label className="mt-5 block text-[12px] font-medium text-[#3b4a54]" htmlFor="new-chat-name">Название чата</label><input id="new-chat-name" value={newChatName} onChange={(event) => setNewChatName(event.target.value)} autoFocus className="mt-1.5 h-11 w-full rounded-lg border border-[#d8dee1] px-3 text-sm outline-none focus:border-[#00a884] focus:ring-2 focus:ring-[#c5f4e6]" placeholder="Например, Личный чат" maxLength={64} /><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setShowNewChat(false)} className="rounded-lg px-3 py-2 text-[13px] font-medium text-[#008069]">Отмена</button><button type="submit" disabled={!newChatName.trim()} className="rounded-lg bg-[#00a884] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-45">Создать</button></div></form></div>}
    </section>
  );
}

export default function Home() {
  const [view, setView] = useState<View>(() => { try { const saved = window.localStorage.getItem(VIEW_KEY) as View | null; return navItems.some((item) => item.id === saved) ? saved! : "chats"; } catch { return "chats"; } });
  const [chats, setChats] = useState<Chat[]>(() => { try { window.localStorage.removeItem(OLD_KEY); const stored = window.localStorage.getItem(LOCAL_KEY); return stored ? JSON.parse(stored) : []; } catch { return []; } });
  useEffect(() => { try { window.localStorage.setItem(LOCAL_KEY, JSON.stringify(chats)); } catch { /* storage optional */ } }, [chats]);
  useEffect(() => { try { window.localStorage.setItem(VIEW_KEY, view); } catch { /* storage optional */ } }, [view]);
  const topItems = navItems.filter((item) => item.group === "top");
  const bottomItems = navItems.filter((item) => item.group === "bottom");
  function renderView() { if (view === "chats") return <ChatsView chats={chats} setChats={setChats} />; if (view === "calls") return <CallsView />; if (view === "status") return <StatusView />; if (view === "camera") return <CameraView />; if (view === "communities") return <CommunitiesView />; if (view === "settings") return <SettingsView />; return <ProfileView />; }
  return (
    <main className="min-h-screen bg-[#f0f2f5] font-ui text-[#111b21]"><div className="hidden h-[126px] bg-[#00a884] lg:block" /><section className="relative mx-auto min-h-screen w-full overflow-hidden bg-white shadow-[0_6px_18px_rgba(11,20,26,0.12)] lg:-mt-[108px] lg:min-h-[calc(100vh-40px)] lg:max-w-[1600px] lg:rounded-sm"><div className="flex min-h-screen"><aside className="hidden w-[64px] flex-col items-center border-r border-[#e9edef] bg-[#f0f2f5] py-4 md:flex" aria-label="Основные разделы"><nav className="flex flex-1 flex-col items-center gap-4">{topItems.map((item) => { const Icon = item.icon; const active = view === item.id; return <button key={item.id} onClick={() => setView(item.id)} className={`grid h-10 w-10 place-items-center rounded-lg transition ${active ? "bg-[#d9fdd3] text-[#00a884]" : "text-[#54656f] hover:bg-[#dfe4e7]"}`} aria-label={item.label} aria-current={active ? "page" : undefined}><Icon className="h-[22px] w-[22px] stroke-[1.7]" /></button>; })}</nav><div className="flex flex-col gap-3 pb-10">{bottomItems.map((item) => { const Icon = item.icon; const active = view === item.id; return <button key={item.id} onClick={() => setView(item.id)} className={`grid h-10 w-10 place-items-center rounded-lg transition ${active ? "bg-[#d9fdd3] text-[#00a884]" : "text-[#54656f] hover:bg-[#dfe4e7]"}`} aria-label={item.label} aria-current={active ? "page" : undefined}><Icon className="h-[22px] w-[22px] stroke-[1.7]" /></button>; })}</div></aside><div className="flex min-w-0 flex-1 flex-col"><nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-[#e9edef] bg-[#f0f2f5] px-2 py-2 md:hidden">{navItems.map((item) => { const Icon = item.icon; const active = view === item.id; return <button key={item.id} onClick={() => setView(item.id)} className={`grid h-9 min-w-10 place-items-center rounded-lg transition ${active ? "bg-[#d9fdd3] text-[#00a884]" : "text-[#54656f]"}`} aria-label={item.label}><Icon className="h-5 w-5" /></button>; })}</nav>{renderView()}</div></div><div className="pointer-events-none absolute bottom-3 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-[10px] text-[#667781] shadow-sm backdrop-blur md:flex"><BellOff className="h-3 w-3" /> локальная копия — данные не передаются в WhatsApp</div></section></main>
  );
}
