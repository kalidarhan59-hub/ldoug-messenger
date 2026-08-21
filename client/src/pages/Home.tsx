/**
 * WhatsApp-inspired local workspace: dense three-column messenger shell.
 * It reproduces the user-visible layout but never calls WhatsApp or sends network messages.
 */
import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import {
  Archive,
  BellOff,
  Camera,
  CheckCheck,
  ChevronDown,
  CircleUserRound,
  Clock3,
  FileText,
  Image,
  LockKeyhole,
  Menu,
  MessageCircleMore,
  Mic,
  MoreVertical,
  Phone,
  Plus,
  Search,
  SendHorizontal,
  Settings,
  Smile,
  UsersRound,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";

type Message = {
  id: string;
  text: string;
  time: string;
  sender: "me" | "them";
};

type Chat = {
  id: string;
  name: string;
  subtitle?: string;
  initials: string;
  color: string;
  preview: string;
  time: string;
  unread?: number;
  pinned?: boolean;
  messages: Message[];
};

const seedChats: Chat[] = [
  { id: "self", name: "Дқн (Вы)", subtitle: "Сообщение для себя", initials: "Д", color: "#f2dccd", preview: "сдерживаясь", time: "Вчера", pinned: true, messages: [{ id: "seed-self", text: "сдерживаясь", time: "08:20", sender: "me" }] },
  { id: "mom", name: "Мама❤️", initials: "М", color: "#f8ebc9", preview: "Мороженый ды жин", time: "16:16", messages: [{ id: "seed-mom", text: "Мороженый ды жин", time: "16:16", sender: "them" }] },
  { id: "class-a", name: "10 “А” Aqbobek lyceum 🤝", initials: "10", color: "#293d35", preview: "Нұриддин: Стикер", time: "01:08", messages: [{ id: "seed-class-a", text: "Нұриддин: Стикер", time: "01:08", sender: "them" }] },
  { id: "classmates", name: "10ашники", initials: "10", color: "#403c3a", preview: "Карим 157,6: Қазір гугода неге тұрғанын білмейм", time: "00:57", messages: [{ id: "seed-classmates", text: "Карим 157,6: Қазір гугода неге тұрғанын білмейм", time: "00:57", sender: "them" }] },
  { id: "school", name: "МЕКТЕП 2025-2026", initials: "М", color: "#6aa59e", preview: "~Абылай: нурхан", time: "Вчера", messages: [{ id: "seed-school", text: "~Абылай: нурхан", time: "Вчера", sender: "them" }] },
  { id: "brother", name: "Абду інім", initials: "А", color: "#c6eaf4", preview: "Сені сатат", time: "Вчера", messages: [{ id: "seed-brother", text: "Сені сатат", time: "Вчера", sender: "them" }] },
  { id: "karim", name: "Карим 157,6", initials: "К", color: "#161616", preview: "Ок", time: "Вчера", messages: [{ id: "seed-karim", text: "Ок", time: "Вчера", sender: "them" }] },
  { id: "anar", name: "Анар тәтe", initials: "АТ", color: "#f1d7b9", preview: "Молодец!", time: "Вчера", messages: [{ id: "seed-anar", text: "Молодец!", time: "Вчера", sender: "them" }] },
  { id: "apa", name: "Апа", initials: "А", color: "#f3e3d2", preview: "Фото", time: "Вчера", messages: [{ id: "seed-apa", text: "Фото", time: "Вчера", sender: "them" }] },
  { id: "arsen", name: "Арсенчик", initials: "А", color: "#c6d7d3", preview: "Только магазинге колхат пен шығасың", time: "Вчера", messages: [{ id: "seed-arsen", text: "Только магазинге колхат пен шығасың", time: "Вчера", sender: "them" }] },
];

function formatTime() {
  return new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function ChatAvatar({ chat, large = false }: { chat: Chat; large?: boolean }) {
  return (
    <div
      className={`${large ? "h-10 w-10 text-sm" : "h-12 w-12 text-[15px]"} grid shrink-0 place-items-center rounded-full font-semibold text-[#3c3c3c]`}
      style={{ backgroundColor: chat.color }}
      aria-hidden="true"
    >
      {chat.initials}
    </div>
  );
}

export default function Home() {
  const [chats, setChats] = useState<Chat[]>(() => {
    try {
      const stored = window.localStorage.getItem("whatsapp-local-demo-chats");
      return stored ? JSON.parse(stored) : seedChats;
    } catch {
      return seedChats;
    }
  });
  const [activeChatId, setActiveChatId] = useState("self");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [mobileListOpen, setMobileListOpen] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "starred">("all");
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  useEffect(() => {
    window.localStorage.setItem("whatsapp-local-demo-chats", JSON.stringify(chats));
  }, [chats]);

  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? chats[0];
  const filteredChats = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return chats.filter((chat) => {
      const matchesQuery = !needle || `${chat.name} ${chat.preview}`.toLocaleLowerCase().includes(needle);
      const matchesFilter = filter === "all" || (filter === "unread" && Boolean(chat.unread)) || (filter === "starred" && chat.id === "self");
      return matchesQuery && matchesFilter;
    });
  }, [chats, filter, query]);

  function openChat(id: string) {
    setActiveChatId(id);
    setMobileListOpen(false);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = message.trim();
    if (!text || !activeChat) return;
    const time = formatTime();
    const nextMessage: Message = { id: crypto.randomUUID(), text, time, sender: "me" };
    setChats((current) => current.map((chat) => chat.id === activeChat.id
      ? { ...chat, preview: text, time, messages: [...chat.messages, nextMessage] }
      : chat));
    setMessage("");
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  function explainNonNetworkAction(label: string) {
    toast(`${label} доступно только как интерфейсный элемент`, {
      description: "Демо работает локально и не взаимодействует с WhatsApp.",
    });
  }

  if (!activeChat) return null;

  return (
    <main className="min-h-screen bg-[#f0f2f5] font-ui text-[#111b21]">
      <div className="hidden h-[126px] bg-[#00a884] lg:block" />
      <section className="relative mx-auto min-h-screen w-full overflow-hidden bg-white shadow-[0_6px_18px_rgba(11,20,26,0.12)] lg:-mt-[108px] lg:min-h-[calc(100vh-40px)] lg:max-w-[1600px] lg:rounded-sm">
        <div className="flex min-h-screen">
          <aside className="hidden w-[64px] flex-col items-center border-r border-[#e9edef] bg-[#f0f2f5] py-4 md:flex" aria-label="Основные разделы">
            <nav className="flex flex-1 flex-col items-center gap-4">
              <button onClick={() => explainNonNetworkAction("Чаты")} className="relative grid h-10 w-10 place-items-center rounded-lg bg-[#d9fdd3] text-[#00a884]" aria-label="Чаты">
                <MessageCircleMore className="h-[23px] w-[23px] stroke-[1.7]" />
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#25d366] px-1 text-[9px] font-bold text-white">5</span>
              </button>
              <button onClick={() => explainNonNetworkAction("Звонки")} className="grid h-10 w-10 place-items-center rounded-lg text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Звонки"><Phone className="h-5 w-5 stroke-[1.7]" /></button>
              <button onClick={() => explainNonNetworkAction("Статус")} className="grid h-10 w-10 place-items-center rounded-lg text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Статус"><Clock3 className="h-5 w-5 stroke-[1.7]" /></button>
              <button onClick={() => explainNonNetworkAction("Каналы")} className="grid h-10 w-10 place-items-center rounded-lg text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Каналы"><Camera className="h-5 w-5 stroke-[1.7]" /></button>
              <button onClick={() => explainNonNetworkAction("Сообщества")} className="grid h-10 w-10 place-items-center rounded-lg text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Сообщества"><UsersRound className="h-5 w-5 stroke-[1.7]" /></button>
            </nav>
            <div className="flex flex-col gap-3">
              <button onClick={() => explainNonNetworkAction("Настройки")} className="grid h-10 w-10 place-items-center rounded-lg text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Настройки"><Settings className="h-5 w-5 stroke-[1.7]" /></button>
              <button onClick={() => explainNonNetworkAction("Профиль")} className="grid h-10 w-10 place-items-center rounded-lg text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Профиль"><CircleUserRound className="h-6 w-6 stroke-[1.5]" /></button>
            </div>
          </aside>

          <section className={`${mobileListOpen ? "flex" : "hidden"} w-full flex-col border-r border-[#e9edef] bg-white md:flex md:w-[420px]`} aria-label="Список чатов">
            <header className="flex h-[76px] items-center justify-between bg-[#f0f2f5] px-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#25d366] text-white shadow-sm"><MessageCircleMore className="h-5 w-5 fill-current stroke-[#25d366]" /></div>
                <span className="text-[20px] font-bold tracking-[-0.04em] text-[#00a884]">WhatsApp</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => explainNonNetworkAction("Новый чат")} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Новый чат"><Plus className="h-[22px] w-[22px]" /></button>
                <button onClick={() => explainNonNetworkAction("Меню")} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Меню"><MoreVertical className="h-[21px] w-[21px]" /></button>
              </div>
            </header>

            <div className="border-b border-[#e9edef] px-3 pb-3 pt-2">
              <label className="flex h-[38px] items-center gap-4 rounded-lg bg-[#f0f2f5] px-4 text-[#54656f] focus-within:ring-2 focus-within:ring-[#a6e5d4]" htmlFor="chat-search">
                <Search className="h-[18px] w-[18px]" />
                <input id="chat-search" value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#667781]" placeholder="Поиск или новый чат" />
                {query && <button onClick={() => setQuery("")} aria-label="Очистить поиск"><X className="h-4 w-4" /></button>}
              </label>
            </div>

            <div className="flex gap-2 overflow-x-auto border-b border-[#e9edef] px-3 py-2.5 [scrollbar-width:none]">
              {([ ["all", "Все"], ["unread", "Непрочитанное 5"], ["starred", "Избранное"] ] as const).map(([id, label]) => (
                <button key={id} onClick={() => setFilter(id)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] transition ${filter === id ? "bg-[#d9fdd3] font-semibold text-[#008069]" : "border border-[#e0e4e6] bg-white text-[#54656f] hover:bg-[#f0f2f5]"}`}>{label}</button>
              ))}
              <button onClick={() => explainNonNetworkAction("Дополнительные фильтры")} className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#e0e4e6] text-[#54656f]" aria-label="Дополнительные фильтры"><ChevronDown className="h-4 w-4" /></button>
            </div>

            <button onClick={() => explainNonNetworkAction("Закрытые чаты")} className="flex h-[56px] items-center gap-5 border-b border-[#f0f2f5] px-5 text-left text-sm text-[#3b4a54] transition hover:bg-[#f5f6f6]"><LockKeyhole className="h-5 w-5 text-[#54656f]" /> Закрытые чаты</button>
            <button onClick={() => explainNonNetworkAction("Архив")} className="flex h-[56px] items-center gap-5 border-b border-[#f0f2f5] px-5 text-left text-sm text-[#3b4a54] transition hover:bg-[#f5f6f6]"><Archive className="h-5 w-5 text-[#54656f]" /> В архиве <span className="ml-auto pr-1 text-xs text-[#667781]">1</span></button>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {filteredChats.map((chat) => {
                const isActive = chat.id === activeChat.id;
                return (
                  <button key={chat.id} onClick={() => openChat(chat.id)} className={`group flex w-full items-center gap-3 px-3 py-3 text-left transition ${isActive ? "bg-[#f0f2f5]" : "hover:bg-[#f5f6f6]"}`}>
                    <ChatAvatar chat={chat} />
                    <div className="min-w-0 flex-1 border-b border-[#f0f2f5] pb-3 group-last:border-b-0">
                      <div className="flex items-center gap-3">
                        <p className="min-w-0 flex-1 truncate text-[15px] font-medium text-[#111b21]">{chat.name}</p>
                        <span className={`text-[11px] ${chat.unread ? "font-semibold text-[#25d366]" : "text-[#667781]"}`}>{chat.time}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <CheckCheck className="h-4 w-4 shrink-0 text-[#53bdeb]" />
                        <p className="min-w-0 flex-1 truncate text-[13px] text-[#667781]">{chat.preview}</p>
                        {chat.pinned && <span className="text-[12px] text-[#667781]">⌖</span>}
                        {chat.unread && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#25d366] px-1 text-[10px] font-bold text-white">{chat.unread}</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
              {!filteredChats.length && <div className="px-10 py-16 text-center text-sm text-[#667781]">Ничего не найдено</div>}
            </div>
          </section>

          <section className={`${mobileListOpen ? "hidden" : "flex"} relative min-w-0 flex-1 flex-col bg-[#efeae2] md:flex`} aria-label="Открытый чат">
            <div className="absolute inset-0 bg-cover bg-center opacity-[0.27]" style={{ backgroundImage: "url('/manus-storage/chat-demo-wallpaper_84d6a701.jpg')" }} />
            <header className="relative z-10 flex h-[76px] shrink-0 items-center justify-between bg-[#f0f2f5] px-3 sm:px-4">
              <div className="flex min-w-0 items-center gap-3">
                <button onClick={() => setMobileListOpen(true)} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] hover:bg-[#dfe4e7] md:hidden" aria-label="К списку чатов"><Menu className="h-5 w-5" /></button>
                <ChatAvatar chat={activeChat} large />
                <div className="min-w-0">
                  <h1 className="truncate text-[15px] font-medium text-[#111b21]">{activeChat.name}</h1>
                  <p className="truncate text-[12px] text-[#667781]">{activeChat.subtitle ?? "нажмите, чтобы посмотреть информацию"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => explainNonNetworkAction("Видеозвонок")} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Видеозвонок"><Video className="h-5 w-5" /></button>
                <button onClick={() => explainNonNetworkAction("Поиск в чате")} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Поиск"><Search className="h-5 w-5" /></button>
                <button onClick={() => explainNonNetworkAction("Меню чата")} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Меню чата"><MoreVertical className="h-5 w-5" /></button>
              </div>
            </header>

            <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-[7%]">
              <div className="mx-auto mb-6 w-fit rounded-lg bg-[#ffeecd] px-3 py-1.5 text-center text-[11px] leading-4 text-[#54656f] shadow-sm">Сообщения в этом макете сохраняются только в этом браузере.</div>
              <div className="mx-auto mb-5 w-fit rounded-lg bg-white/85 px-3 py-1 text-[11px] text-[#667781] shadow-sm">Вчера</div>
              <div className="space-y-1.5">
                {activeChat.messages.map((item) => (
                  <div key={item.id} className={`flex ${item.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <div className={`${item.sender === "me" ? "bg-[#d9fdd3]" : "bg-white"} max-w-[80%] rounded-lg px-2.5 py-1.5 shadow-[0_1px_1px_rgba(11,20,26,0.13)] sm:max-w-[65%]`}>
                      <p className="whitespace-pre-wrap break-words text-[14px] leading-5 text-[#111b21]">{item.text}</p>
                      <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-[#667781]">{item.time}{item.sender === "me" && <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 flex shrink-0 items-end gap-1 bg-[#f0f2f5] px-2 py-2 sm:px-4">
              <div className="relative">
                <button type="button" onClick={() => setShowAttachmentMenu((value) => !value)} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Прикрепить"><Plus className="h-6 w-6" /></button>
                {showAttachmentMenu && (
                  <div className="absolute bottom-12 left-0 z-30 w-44 overflow-hidden rounded-xl bg-white py-1 shadow-[0_8px_24px_rgba(11,20,26,0.18)]">
                    <button type="button" onClick={() => explainNonNetworkAction("Документ")} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-[#f5f6f6]"><FileText className="h-4 w-4 text-[#7f66ff]" /> Документ</button>
                    <button type="button" onClick={() => explainNonNetworkAction("Фотография")} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-[#f5f6f6]"><Image className="h-4 w-4 text-[#e55980]" /> Фото и видео</button>
                    <button type="button" onClick={() => explainNonNetworkAction("Контакт")} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-[#f5f6f6]"><CircleUserRound className="h-4 w-4 text-[#039be5]" /> Контакт</button>
                  </div>
                )}
              </div>
              <button type="button" onClick={() => explainNonNetworkAction("Смайлики")} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Смайлики"><Smile className="h-[22px] w-[22px]" /></button>
              <textarea value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={handleComposerKeyDown} className="max-h-28 min-h-10 flex-1 resize-none rounded-lg bg-white px-3 py-2.5 text-[14px] leading-5 outline-none placeholder:text-[#667781]" placeholder="Введите сообщение" aria-label="Введите сообщение" rows={1} />
              {message.trim() ? (
                <button type="submit" className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Отправить"><SendHorizontal className="h-5 w-5" /></button>
              ) : (
                <button type="button" onClick={() => explainNonNetworkAction("Голосовое сообщение")} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Голосовое сообщение"><Mic className="h-5 w-5" /></button>
              )}
            </form>
          </section>
        </div>
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-[10px] text-[#667781] shadow-sm backdrop-blur md:flex"><BellOff className="h-3 w-3" /> локальная копия — сообщения не отправляются в WhatsApp</div>
      </section>
    </main>
  );
}
