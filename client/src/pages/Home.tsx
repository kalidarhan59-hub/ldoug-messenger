/**
 * Empty WhatsApp-inspired local workspace.
 * No personal contacts, previews, or imported message history are stored in this interface.
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
  initials: string;
  color: string;
  preview: string;
  time: string;
  messages: Message[];
};

const LOCAL_KEY = "whatsapp-empty-local-chats-v1";
const OLD_KEY = "whatsapp-local-demo-chats";

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
      window.localStorage.removeItem(OLD_KEY);
      const stored = window.localStorage.getItem(LOCAL_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [mobileListOpen, setMobileListOpen] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "starred">("all");
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatName, setNewChatName] = useState("");

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_KEY, JSON.stringify(chats));
    } catch {
      // The interface remains usable when browser storage is unavailable.
    }
  }, [chats]);

  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? null;
  const filteredChats = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return chats.filter((chat) => {
      const matchesQuery = !needle || `${chat.name} ${chat.preview}`.toLocaleLowerCase().includes(needle);
      const matchesFilter = filter === "all" || (filter === "unread" && false) || (filter === "starred" && false);
      return matchesQuery && matchesFilter;
    });
  }, [chats, filter, query]);

  function openChat(id: string) {
    setActiveChatId(id);
    setMobileListOpen(false);
  }

  function createChat(event: FormEvent) {
    event.preventDefault();
    const name = newChatName.trim();
    if (!name) return;
    const chat: Chat = {
      id: crypto.randomUUID(),
      name,
      initials: makeInitials(name),
      color: avatarColor(name),
      preview: "",
      time: "",
      messages: [],
    };
    setChats((current) => [chat, ...current]);
    setActiveChatId(chat.id);
    setNewChatName("");
    setShowNewChat(false);
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

  return (
    <main className="min-h-screen bg-[#f0f2f5] font-ui text-[#111b21]">
      <div className="hidden h-[126px] bg-[#00a884] lg:block" />
      <section className="relative mx-auto min-h-screen w-full overflow-hidden bg-white shadow-[0_6px_18px_rgba(11,20,26,0.12)] lg:-mt-[108px] lg:min-h-[calc(100vh-40px)] lg:max-w-[1600px] lg:rounded-sm">
        <div className="flex min-h-screen">
          <aside className="hidden w-[64px] flex-col items-center border-r border-[#e9edef] bg-[#f0f2f5] py-4 md:flex" aria-label="Основные разделы">
            <nav className="flex flex-1 flex-col items-center gap-4">
              <button onClick={() => explainNonNetworkAction("Чаты")} className="relative grid h-10 w-10 place-items-center rounded-lg bg-[#d9fdd3] text-[#00a884]" aria-label="Чаты"><MessageCircleMore className="h-[23px] w-[23px] stroke-[1.7]" /></button>
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
                <button onClick={() => setShowNewChat(true)} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Новый чат"><Plus className="h-[22px] w-[22px]" /></button>
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
              {([ ["all", "Все"], ["unread", "Непрочитанное"], ["starred", "Избранное"] ] as const).map(([id, label]) => (
                <button key={id} onClick={() => setFilter(id)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] transition ${filter === id ? "bg-[#d9fdd3] font-semibold text-[#008069]" : "border border-[#e0e4e6] bg-white text-[#54656f] hover:bg-[#f0f2f5]"}`}>{label}</button>
              ))}
              <button onClick={() => explainNonNetworkAction("Дополнительные фильтры")} className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#e0e4e6] text-[#54656f]" aria-label="Дополнительные фильтры"><ChevronDown className="h-4 w-4" /></button>
            </div>

            <button onClick={() => explainNonNetworkAction("Закрытые чаты")} className="flex h-[56px] items-center gap-5 border-b border-[#f0f2f5] px-5 text-left text-sm text-[#3b4a54] transition hover:bg-[#f5f6f6]"><LockKeyhole className="h-5 w-5 text-[#54656f]" /> Закрытые чаты</button>
            <button onClick={() => explainNonNetworkAction("Архив")} className="flex h-[56px] items-center gap-5 border-b border-[#f0f2f5] px-5 text-left text-sm text-[#3b4a54] transition hover:bg-[#f5f6f6]"><Archive className="h-5 w-5 text-[#54656f]" /> В архиве</button>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {filteredChats.map((chat) => {
                const isActive = chat.id === activeChat?.id;
                return (
                  <button key={chat.id} onClick={() => openChat(chat.id)} className={`group flex w-full items-center gap-3 px-3 py-3 text-left transition ${isActive ? "bg-[#f0f2f5]" : "hover:bg-[#f5f6f6]"}`}>
                    <ChatAvatar chat={chat} />
                    <div className="min-w-0 flex-1 border-b border-[#f0f2f5] pb-3 group-last:border-b-0">
                      <div className="flex items-center gap-3"><p className="min-w-0 flex-1 truncate text-[15px] font-medium text-[#111b21]">{chat.name}</p><span className="text-[11px] text-[#667781]">{chat.time}</span></div>
                      <div className="mt-1 flex items-center gap-1.5"><CheckCheck className="h-4 w-4 shrink-0 text-[#53bdeb]" /><p className="min-w-0 flex-1 truncate text-[13px] text-[#667781]">{chat.preview || "Нет сообщений"}</p></div>
                    </div>
                  </button>
                );
              })}
              {!filteredChats.length && (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-9 text-center">
                  <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#e8f5ef] text-[#00a884]"><MessageCircleMore className="h-6 w-6" /></div>
                  <p className="text-sm font-medium text-[#3b4a54]">{query ? "Ничего не найдено" : "Чатов пока нет"}</p>
                  <p className="mt-1.5 max-w-[220px] text-[12px] leading-5 text-[#667781]">{query ? "Попробуйте изменить запрос." : "Создайте первый чат — он останется только в этом браузере."}</p>
                  {!query && <button onClick={() => setShowNewChat(true)} className="mt-4 rounded-lg bg-[#00a884] px-3.5 py-2 text-[12px] font-semibold text-white transition hover:bg-[#008f70] active:scale-[0.97]">Создать чат</button>}
                </div>
              )}
            </div>
          </section>

          <section className={`${mobileListOpen ? "hidden" : "flex"} relative min-w-0 flex-1 flex-col bg-[#efeae2] md:flex`} aria-label="Открытый чат">
            <div className="absolute inset-0 bg-cover bg-center opacity-[0.27]" style={{ backgroundImage: "url('/manus-storage/chat-demo-wallpaper_84d6a701.jpg')" }} />
            {activeChat ? (
              <>
                <header className="relative z-10 flex h-[76px] shrink-0 items-center justify-between bg-[#f0f2f5] px-3 sm:px-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <button onClick={() => setMobileListOpen(true)} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] hover:bg-[#dfe4e7] md:hidden" aria-label="К списку чатов"><Menu className="h-5 w-5" /></button>
                    <ChatAvatar chat={activeChat} large />
                    <h1 className="truncate text-[15px] font-medium text-[#111b21]">{activeChat.name}</h1>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => explainNonNetworkAction("Видеозвонок")} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Видеозвонок"><Video className="h-5 w-5" /></button>
                    <button onClick={() => explainNonNetworkAction("Поиск в чате")} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Поиск"><Search className="h-5 w-5" /></button>
                    <button onClick={() => explainNonNetworkAction("Меню чата")} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Меню чата"><MoreVertical className="h-5 w-5" /></button>
                  </div>
                </header>

                <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-[7%]">
                  <div className="mx-auto mb-6 w-fit rounded-lg bg-[#ffeecd] px-3 py-1.5 text-center text-[11px] leading-4 text-[#54656f] shadow-sm">Сообщения в этом макете сохраняются только в этом браузере.</div>
                  {!activeChat.messages.length && <div className="mx-auto mt-16 max-w-[280px] text-center text-sm leading-6 text-[#667781]">Сообщений пока нет. Напишите первое сообщение самостоятельно.</div>}
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
              </>
            ) : (
              <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
                <img src="/manus-storage/chat-demo-empty-state_43f62d74.png" alt="Абстрактная иллюстрация пустого чата" className="mb-2 w-[190px] object-contain opacity-90" />
                <h1 className="text-[25px] font-light text-[#41525d]">Ваши чаты появятся здесь</h1>
                <p className="mt-3 max-w-[390px] text-[14px] leading-6 text-[#667781]">Создайте первый локальный чат. Контакты и сообщения не импортируются из WhatsApp.</p>
                <button onClick={() => setShowNewChat(true)} className="mt-5 rounded-lg bg-[#00a884] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#008f70] active:scale-[0.97]">Создать первый чат</button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative z-10 flex shrink-0 items-end gap-1 bg-[#f0f2f5] px-2 py-2 sm:px-4">
              <div className="relative">
                <button type="button" disabled={!activeChat} onClick={() => setShowAttachmentMenu((value) => !value)} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] transition hover:bg-[#dfe4e7] disabled:opacity-40" aria-label="Прикрепить"><Plus className="h-6 w-6" /></button>
                {showAttachmentMenu && activeChat && (
                  <div className="absolute bottom-12 left-0 z-30 w-44 overflow-hidden rounded-xl bg-white py-1 shadow-[0_8px_24px_rgba(11,20,26,0.18)]">
                    <button type="button" onClick={() => explainNonNetworkAction("Документ")} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-[#f5f6f6]"><FileText className="h-4 w-4 text-[#7f66ff]" /> Документ</button>
                    <button type="button" onClick={() => explainNonNetworkAction("Фотография")} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-[#f5f6f6]"><Image className="h-4 w-4 text-[#e55980]" /> Фото и видео</button>
                    <button type="button" onClick={() => explainNonNetworkAction("Контакт")} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-[#f5f6f6]"><CircleUserRound className="h-4 w-4 text-[#039be5]" /> Контакт</button>
                  </div>
                )}
              </div>
              <button type="button" disabled={!activeChat} onClick={() => explainNonNetworkAction("Смайлики")} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] transition hover:bg-[#dfe4e7] disabled:opacity-40" aria-label="Смайлики"><Smile className="h-[22px] w-[22px]" /></button>
              <textarea value={message} disabled={!activeChat} onChange={(event) => setMessage(event.target.value)} onKeyDown={handleComposerKeyDown} className="max-h-28 min-h-10 flex-1 resize-none rounded-lg bg-white px-3 py-2.5 text-[14px] leading-5 outline-none placeholder:text-[#667781] disabled:bg-[#e9edef]" placeholder={activeChat ? "Введите сообщение" : "Создайте или выберите чат"} aria-label="Введите сообщение" rows={1} />
              {message.trim() && activeChat ? (
                <button type="submit" className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] transition hover:bg-[#dfe4e7]" aria-label="Отправить"><SendHorizontal className="h-5 w-5" /></button>
              ) : (
                <button type="button" disabled={!activeChat} onClick={() => explainNonNetworkAction("Голосовое сообщение")} className="grid h-10 w-10 place-items-center rounded-full text-[#54656f] transition hover:bg-[#dfe4e7] disabled:opacity-40" aria-label="Голосовое сообщение"><Mic className="h-5 w-5" /></button>
              )}
            </form>
          </section>
        </div>
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-[10px] text-[#667781] shadow-sm backdrop-blur md:flex"><BellOff className="h-3 w-3" /> локальная копия — данные не передаются в WhatsApp</div>
      </section>

      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111b21]/35 p-4 backdrop-blur-[1px]" role="dialog" aria-modal="true" aria-label="Создать локальный чат">
          <form onSubmit={createChat} className="w-full max-w-[390px] rounded-xl bg-white p-6 shadow-[0_16px_40px_rgba(11,20,26,0.25)] panel-enter">
            <div className="flex items-start justify-between gap-4"><div><h2 className="text-[20px] font-medium text-[#111b21]">Новый чат</h2><p className="mt-1 text-[13px] leading-5 text-[#667781]">Название останется только в этом браузере.</p></div><button type="button" onClick={() => setShowNewChat(false)} className="grid h-8 w-8 place-items-center rounded-full text-[#54656f] hover:bg-[#f0f2f5]" aria-label="Закрыть"><X className="h-5 w-5" /></button></div>
            <label className="mt-5 block text-[12px] font-medium text-[#3b4a54]" htmlFor="new-chat-name">Название чата</label>
            <input id="new-chat-name" value={newChatName} onChange={(event) => setNewChatName(event.target.value)} autoFocus className="mt-1.5 h-11 w-full rounded-lg border border-[#d8dee1] px-3 text-sm outline-none transition focus:border-[#00a884] focus:ring-2 focus:ring-[#c5f4e6]" placeholder="Например, Личный чат" maxLength={64} />
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setShowNewChat(false)} className="rounded-lg px-3 py-2 text-[13px] font-medium text-[#008069] hover:bg-[#f0f2f5]">Отмена</button><button type="submit" disabled={!newChatName.trim()} className="rounded-lg bg-[#00a884] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#008f70] disabled:cursor-not-allowed disabled:opacity-45">Создать</button></div>
          </form>
        </div>
      )}
    </main>
  );
}
