import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Bookmark,
  Box,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clapperboard,
  Clock3,
  Compass,
  Eye,
  FileVideo,
  Film,
  Flame,
  GraduationCap,
  Hash,
  Heart,
  Home,
  ImageUp,
  Lightbulb,
  LogOut,
  MapPin,
  MessageCircle,
  Mic2,
  MonitorPlay,
  Orbit,
  Pause,
  Play,
  Plus,
  Scan,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trophy,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";
import { activities, categories, dramas, initialMessages, recruitments, resources } from "./data/mockData";
import { readStorage, writeStorage } from "./utils/storage";

const navItems = [
  { id: "home", label: "首页", icon: Home },
  { id: "categories", label: "片库", icon: Compass },
  { id: "create", label: "创作", icon: Plus, primary: true },
  { id: "messages", label: "消息", icon: MessageCircle },
  { id: "profile", label: "我的", icon: User },
];

const featuredProjects = [
  {
    title: "万里北归，只为霓裳耀风华",
    subtitle: "开机大吉",
    image: "covers/wanli-beigui-launch.jpg",
    status: "正式开机",
    producers: "辽宁传媒学院 · 辽宁数字电影产业园有限公司",
    supervisor: "王东辉",
  },
  {
    title: "豹笑一家人",
    subtitle: "家庭喜剧·温情呈现",
    image: "covers/bao-xiao-yijia.jpg",
    status: "前期筹备",
    producers: "辽宁传媒学院 · 校园创作团队",
    supervisor: "王东辉",
  },
];

const resourceIcons = { Clapperboard, Box, Mic2, MonitorPlay, Camera, Orbit, Lightbulb, Scan };

function formatCount(value) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
}

function Toast({ text }) {
  if (!text) return null;
  return <div className="toast"><CheckCircle2 size={18} />{text}</div>;
}

function SectionTitle({ eyebrow, title, action, onAction }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {action && <button className="text-button" onClick={onAction}>{action}<ChevronRight size={16} /></button>}
    </div>
  );
}

function PosterCard({ drama, onOpen, compact = false }) {
  return (
    <button className={`poster-card ${compact ? "poster-card--compact" : ""}`} onClick={() => onOpen(drama)}>
      <div className="poster-card__image">
        <img src={drama.cover} alt={drama.title} />
        <span className="score"><Star size={11} fill="currentColor" />{drama.score}</span>
        <span className="duration">{drama.duration}</span>
      </div>
      <strong>{drama.title}</strong>
      <span>{drama.category} · {drama.creator}</span>
    </button>
  );
}

function Modal({ title, children, onClose, wide = false }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className={`sheet ${wide ? "sheet--wide" : ""}`} onMouseDown={(event) => event.stopPropagation()}>
        <div className="sheet__handle" />
        <div className="sheet__header">
          <h3>{title}</h3>
          <button className="icon-button" aria-label="关闭" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="sheet__body">{children}</div>
      </section>
    </div>
  );
}

function EmptyState({ icon: Icon = Film, title, text }) {
  return (
    <div className="empty-state">
      <Icon size={28} />
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function Login({ onLogin }) {
  const [mode, setMode] = useState("student");
  const [account, setAccount] = useState("2023120708");
  const [password, setPassword] = useState("liaochuan2026");

  return (
    <main className="login-shell">
      <div className="login-backdrop" />
      <div className="login-brand">
        <span className="brand-mark"><Play size={24} fill="currentColor" /></span>
        <div><strong>斑海豹</strong><span>校园影像创作与展映平台</span></div>
      </div>
      <section className="login-panel">
        <span className="eyebrow">LNCU STORY LAB</span>
        <h1>故事，从校园开机</h1>
        <p>连接作品、主创与实训资源，让每一次灵感都找到片场。</p>
        <div className="segmented">
          <button className={mode === "student" ? "active" : ""} onClick={() => setMode("student")}>学号登录</button>
          <button className={mode === "mobile" ? "active" : ""} onClick={() => setMode("mobile")}>手机号登录</button>
        </div>
        <label className="input-field">
          <span>{mode === "student" ? "学号" : "手机号"}</span>
          <input value={account} onChange={(event) => setAccount(event.target.value)} />
        </label>
        <label className="input-field">
          <span>密码</span>
          <input type="text" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <button className="primary-button login-button" onClick={() => onLogin({ account, name: "林知夏", school: "影视艺术学院", major: "广播电视编导", grade: "2023级" })}>
          登录进入平台 <ChevronRight size={18} />
        </button>
        <div className="login-demo"><Check size={15} />演示账号已填入，点击登录即可进入</div>
      </section>
      <span className="login-footer">辽宁传媒学院 · 课程设计演示</span>
    </main>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => readStorage("liaochuan-user", null));
  const [view, setView] = useState("home");
  const [selectedDrama, setSelectedDrama] = useState(dramas[0]);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [favorites, setFavorites] = useState(() => readStorage("liaochuan-favorites", [1, 4, 6]));
  const [liked, setLiked] = useState(() => readStorage("liaochuan-liked", [3]));
  const [messages, setMessages] = useState(() => readStorage("liaochuan-messages", initialMessages));
  const [submissions, setSubmissions] = useState(() => readStorage("liaochuan-submissions", []));
  const [applications, setApplications] = useState(() => readStorage("liaochuan-applications", []));
  const [bookings, setBookings] = useState(() => readStorage("liaochuan-bookings", []));
  const [comments, setComments] = useState(() => readStorage("liaochuan-comments", {
    1: [{ id: 1, author: "周屿", text: "雨夜外景的声音设计很有压迫感。", time: "2小时前" }],
  }));

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1100);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => writeStorage("liaochuan-user", user), [user]);
  useEffect(() => writeStorage("liaochuan-favorites", favorites), [favorites]);
  useEffect(() => writeStorage("liaochuan-liked", liked), [liked]);
  useEffect(() => writeStorage("liaochuan-messages", messages), [messages]);
  useEffect(() => writeStorage("liaochuan-submissions", submissions), [submissions]);
  useEffect(() => writeStorage("liaochuan-applications", applications), [applications]);
  useEffect(() => writeStorage("liaochuan-bookings", bookings), [bookings]);
  useEffect(() => writeStorage("liaochuan-comments", comments), [comments]);

  const showToast = (text) => {
    setToast(text);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 2200);
  };

  const openDrama = (drama) => {
    setSelectedDrama(drama);
    setView("player");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const switchView = (nextView) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="splash">
        <span className="brand-mark brand-mark--large"><Play size={34} fill="currentColor" /></span>
        <strong>斑海豹</strong>
        <div className="loading-line"><span /></div>
        <small>正在连接校园创作现场</small>
      </div>
    );
  }

  if (!user) return <Login onLogin={(nextUser) => { setUser(nextUser); showToast("登录成功"); }} />;

  const unreadCount = messages.filter((message) => !message.read).length;

  return (
    <div className="desktop-stage">
      <main className="app-shell">
        <div className="phone-status"><span>10:24</span><span>辽传校园网 · 5G</span></div>
        {view === "home" && <HomePage user={user} unreadCount={unreadCount} openDrama={openDrama} setView={switchView} setModal={setModal} />}
        {view === "categories" && <CategoriesPage openDrama={openDrama} />}
        {view === "create" && <CreatePage setSubmissions={setSubmissions} showToast={showToast} setView={switchView} />}
        {view === "messages" && <MessagesPage messages={messages} setMessages={setMessages} setModal={setModal} />}
        {view === "profile" && (
          <ProfilePage
            user={user}
            favorites={favorites}
            submissions={submissions}
            applications={applications}
            bookings={bookings}
            messages={messages}
            setModal={setModal}
            openDrama={openDrama}
            onLogout={() => { localStorage.removeItem("liaochuan-user"); setUser(null); }}
          />
        )}
        {view === "player" && (
          <PlayerPage
            drama={selectedDrama}
            favorites={favorites}
            setFavorites={setFavorites}
            liked={liked}
            setLiked={setLiked}
            comments={comments[selectedDrama.id] || []}
            setComments={setComments}
            onBack={() => switchView("home")}
            openDrama={openDrama}
            setModal={setModal}
            showToast={showToast}
          />
        )}
        {view === "recruit" && <RecruitPage onBack={() => switchView("home")} applications={applications} setApplications={setApplications} setModal={setModal} showToast={showToast} />}
        {view === "resources" && <ResourcesPage onBack={() => switchView("home")} setModal={setModal} />}
        {!["player", "recruit", "resources"].includes(view) && (
          <nav className="bottom-nav">
            {navItems.map(({ id, label, icon: Icon, primary }) => (
              <button key={id} className={`${view === id ? "active" : ""} ${primary ? "nav-primary" : ""}`} onClick={() => switchView(id)}>
                <span className="nav-icon"><Icon size={primary ? 25 : 21} /></span>
                <small>{label}</small>
                {id === "messages" && unreadCount > 0 && <i>{unreadCount}</i>}
              </button>
            ))}
          </nav>
        )}
      </main>
      <Toast text={toast} />
      {modal && (
        <AppModal
          modal={modal}
          setModal={setModal}
          applications={applications}
          setApplications={setApplications}
          bookings={bookings}
          setBookings={setBookings}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function HomePage({ user, unreadCount, openDrama, setView, setModal }) {
  const ranking = [...dramas].sort((a, b) => b.likes - a.likes).slice(0, 4);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselTimer = useRef(null);

  const startCarousel = () => {
    stopCarousel();
    carouselTimer.current = window.setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % featuredProjects.length);
    }, 5000);
  };

  const stopCarousel = () => {
    if (carouselTimer.current) window.clearInterval(carouselTimer.current);
  };

  useEffect(() => {
    startCarousel();
    return stopCarousel;
  }, []);

  const goToSlide = (index) => {
    setCarouselIndex(index);
    stopCarousel();
    startCarousel();
  };

  const swipeState = useRef({ startX: 0, startY: 0, swiped: false });

  const handlePointerDown = (e) => {
    swipeState.current = { startX: e.clientX, startY: e.clientY, swiped: false };
  };

  const handlePointerUp = (e) => {
    const { startX, startY } = swipeState.current;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      swipeState.current.swiped = true;
      if (deltaX < 0) {
        setCarouselIndex((prev) => (prev + 1) % featuredProjects.length);
      } else {
        setCarouselIndex((prev) => (prev - 1 + featuredProjects.length) % featuredProjects.length);
      }
      stopCarousel();
      startCarousel();
    }
  };

  const handleHeroClickCapture = (e) => {
    if (swipeState.current.swiped) {
      e.stopPropagation();
      e.preventDefault();
      swipeState.current.swiped = false;
    }
  };

  const current = featuredProjects[carouselIndex];

  return (
    <div className="page home-page">
      <header className="home-header">
        <button className="avatar-button" onClick={() => setView("profile")}>
          <span>林</span>
          <div><small>上午好，{user.name}</small><strong>今天拍点什么？</strong></div>
        </button>
        <button className="icon-button notification-button" onClick={() => setView("messages")}>
          <Bell size={21} />{unreadCount > 0 && <i>{unreadCount}</i>}
        </button>
      </header>

      <div className="hero-feature launch-feature" style={{ touchAction: "pan-y" }} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onClickCapture={handleHeroClickCapture}>
        <button className="launch-feature__visual" onClick={() => setModal({ type: "featuredProject", data: current })}>
          <img src={current.image} alt={`${current.title}${current.subtitle}`} />
          <span className="launch-feature__badge"><Clapperboard size={13} />重点项目</span>
        </button>
        <div className="launch-feature__body" onClick={() => setModal({ type: "featuredProject", data: current })}>
          <div className="launch-feature__status"><span>{current.status}</span><small>PROJECT SPOTLIGHT</small></div>
          <h1>{current.title}</h1>
          <p>{current.producers}</p>
          <div className="launch-feature__action">
            <span><Film size={16} />校园短剧项目</span>
            <strong>查看详情 <ChevronRight size={16} /></strong>
          </div>
        </div>
        <div className="carousel-dots">
          {featuredProjects.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === carouselIndex ? "active" : ""}`}
              aria-label={`第${index + 1}张`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>

      <div className="quick-actions">
        <button onClick={() => setView("create")}><span className="quick-icon quick-icon--red"><Upload size={22} /></span><strong>投递作品</strong><small>参加展映</small></button>
        <button onClick={() => setView("recruit")}><span className="quick-icon quick-icon--gold"><Users size={22} /></span><strong>加入剧组</strong><small>寻找搭档</small></button>
        <button onClick={() => setView("resources")}><span className="quick-icon quick-icon--cyan"><Camera size={22} /></span><strong>实训资源</strong><small>场地设备</small></button>
      </div>

      <section className="content-section">
        <SectionTitle eyebrow="CAMPUS EVENTS" title="正在发生" action="全部活动" onAction={() => setModal({ type: "activities" })} />
        <div className="activity-scroll">
          {activities.map((activity) => (
            <button className="activity-card" key={activity.id} onClick={() => setModal({ type: "activity", data: activity })}>
              <span className="activity-accent" style={{ background: activity.color }} />
              <small>{activity.status}</small>
              <strong>{activity.title}</strong>
              <span><CalendarDays size={14} />{activity.date}</span>
              <span><MapPin size={14} />{activity.place}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="content-section">
        <SectionTitle eyebrow="TRENDING NOW" title="校园热映" action="完整片库" onAction={() => setView("categories")} />
        <div className="poster-row">{dramas.slice(0, 6).map((drama) => <PosterCard key={drama.id} drama={drama} onOpen={openDrama} />)}</div>
      </section>

      <section className="ranking-section">
        <div className="ranking-title"><div><Trophy size={18} /><span>本周人气榜</span></div><small>实时更新</small></div>
        {ranking.map((drama, index) => (
          <button className="ranking-row" key={drama.id} onClick={() => openDrama(drama)}>
            <b>{String(index + 1).padStart(2, "0")}</b>
            <img src={drama.cover} alt="" />
            <div><strong>{drama.title}</strong><span>{drama.category} · {drama.creator}</span></div>
            <span className="ranking-count"><Flame size={13} />{formatCount(drama.likes)}</span>
          </button>
        ))}
      </section>

      <section className="content-section content-section--last">
        <SectionTitle eyebrow="NEW RELEASES" title="最新投稿" />
        <div className="poster-grid">{dramas.slice(6).map((drama) => <PosterCard compact key={drama.id} drama={drama} onOpen={openDrama} />)}</div>
      </section>
    </div>
  );
}

function CategoriesPage({ openDrama }) {
  const [category, setCategory] = useState("全部");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => dramas.filter((drama) => {
    const categoryMatch = category === "全部" || drama.category === category;
    const queryMatch = drama.title.includes(query) || drama.creator.includes(query) || drama.tags.some((tag) => tag.includes(query));
    return categoryMatch && queryMatch;
  }), [category, query]);

  return (
    <div className="page page-with-nav">
      <header className="page-header">
        <div><span className="eyebrow">DISCOVER</span><h1>校园片库</h1></div>
        <button className="icon-button"><SlidersHorizontal size={20} /></button>
      </header>
      <label className="search-box"><Search size={19} /><input placeholder="搜索作品、主创或标签" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button onClick={() => setQuery("")}><X size={17} /></button>}</label>
      <div className="category-tabs">
        {["全部", ...categories].map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      <div className="library-summary"><span>共找到 <strong>{filtered.length}</strong> 部作品</span><small>按热度排序</small></div>
      {filtered.length ? <div className="library-grid">{filtered.map((drama) => <PosterCard key={drama.id} drama={drama} onOpen={openDrama} />)}</div> : <EmptyState icon={Search} title="没有找到相关作品" text="换一个关键词或分类试试" />}
    </div>
  );
}

function PlayerPage({ drama, favorites, setFavorites, liked, setLiked, comments, setComments, onBack, openDrama, setModal, showToast }) {
  const [playing, setPlaying] = useState(false);
  const [episode, setEpisode] = useState(1);
  const [comment, setComment] = useState("");
  const isFavorite = favorites.includes(drama.id);
  const isLiked = liked.includes(drama.id);
  const related = dramas.filter((item) => item.category === drama.category && item.id !== drama.id).slice(0, 4);

  const submitComment = () => {
    if (!comment.trim()) return;
    setComments((current) => ({
      ...current,
      [drama.id]: [...(current[drama.id] || []), { id: Date.now(), author: "林知夏", text: comment.trim(), time: "刚刚" }],
    }));
    setComment("");
    showToast("评论发布成功");
  };

  return (
    <div className="page player-page">
      <div className={`video-stage ${playing ? "playing" : ""}`}>
        <img src={drama.cover} alt={drama.title} />
        <div className="video-stage__shade" />
        <button className="back-floating" onClick={onBack}><ArrowLeft size={22} /></button>
        <button className="player-control" onClick={() => setPlaying((value) => !value)}>
          {playing ? <Pause size={27} fill="currentColor" /> : <Play size={27} fill="currentColor" />}
        </button>
        <span className="video-time">{playing ? "03:18" : "00:00"} / {drama.duration}</span>
        {playing && <span className="playing-tip">正在播放第 {episode} 集</span>}
      </div>
      <section className="player-info">
        <div className="player-title-row"><div><span className="eyebrow">{drama.category}</span><h1>{drama.title}</h1></div><span className="big-score">{drama.score}<small>评分</small></span></div>
        <p>{drama.intro}</p>
        <div className="meta-row"><span>{drama.year}</span><span>{drama.school}</span><span>{drama.episodes}集</span><span>1080P</span></div>
        <div className="player-actions">
          <button className={isLiked ? "active" : ""} onClick={() => { setLiked(isLiked ? liked.filter((id) => id !== drama.id) : [...liked, drama.id]); showToast(isLiked ? "已取消点赞" : "感谢你的点赞"); }}><Heart size={22} fill={isLiked ? "currentColor" : "none"} /><span>{formatCount(drama.likes + (isLiked ? 1 : 0))}</span></button>
          <button className={isFavorite ? "active" : ""} onClick={() => { setFavorites(isFavorite ? favorites.filter((id) => id !== drama.id) : [...favorites, drama.id]); showToast(isFavorite ? "已取消收藏" : "已加入收藏"); }}><Bookmark size={22} fill={isFavorite ? "currentColor" : "none"} /><span>{isFavorite ? "已收藏" : "收藏"}</span></button>
          <button onClick={() => document.getElementById("comment-input")?.focus()}><MessageCircle size={22} /><span>{comments.length + 36}</span></button>
          <button onClick={() => setModal({ type: "share", data: drama })}><Send size={22} /><span>分享</span></button>
        </div>
      </section>
      <section className="episode-section">
        <SectionTitle title="选集" action={`共 ${drama.episodes} 集`} />
        <div className="episode-list">{Array.from({ length: drama.episodes }, (_, index) => <button className={episode === index + 1 ? "active" : ""} onClick={() => { setEpisode(index + 1); setPlaying(true); }} key={index}>EP.{String(index + 1).padStart(2, "0")}</button>)}</div>
      </section>
      <button className="creator-strip" onClick={() => setModal({ type: "creators", data: drama })}>
        <span className="creator-logo">{drama.creator.slice(0, 1)}</span>
        <div><small>出品团队</small><strong>{drama.creator}</strong></div>
        <span className="creator-school">{drama.school}</span><ChevronRight size={18} />
      </button>
      <section className="comment-section">
        <SectionTitle title={`讨论 ${comments.length + 36}`} />
        <div className="comment-compose">
          <span className="mini-avatar">林</span>
          <input id="comment-input" value={comment} onChange={(event) => setComment(event.target.value)} onKeyDown={(event) => event.key === "Enter" && submitComment()} placeholder="说说这部作品打动你的地方" />
          <button onClick={submitComment}><Send size={18} /></button>
        </div>
        {comments.map((item) => <div className="comment-item" key={item.id}><span className="mini-avatar">{item.author.slice(0, 1)}</span><div><strong>{item.author}<small>{item.time}</small></strong><p>{item.text}</p></div></div>)}
        <div className="comment-item"><span className="mini-avatar mini-avatar--gold">赵</span><div><strong>赵闻舟<small>昨天</small></strong><p>摄影和调色非常完整，结尾留白也处理得很克制。</p></div></div>
      </section>
      {related.length > 0 && <section className="content-section content-section--last"><SectionTitle title="相似作品" /><div className="poster-row">{related.map((item) => <PosterCard key={item.id} drama={item} onOpen={openDrama} />)}</div></section>}
    </div>
  );
}

function CreatePage({ setSubmissions, showToast, setView }) {
  const coverRef = useRef(null);
  const videoRef = useRef(null);
  const [form, setForm] = useState({ title: "", category: "校园青春", intro: "", tags: "", director: "", writer: "", actors: "", teacher: "", activity: "2026 辽传短剧展映周" });
  const [files, setFiles] = useState({ cover: "", video: "" });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const publish = () => {
    if (!form.title.trim()) return showToast("请先填写作品名称");
    const submission = { id: Date.now(), ...form, status: "审核中", createdAt: "刚刚", cover: files.cover || "covers/final-presentation.jpg" };
    setSubmissions((current) => [submission, ...current]);
    setForm({ title: "", category: "校园青春", intro: "", tags: "", director: "", writer: "", actors: "", teacher: "", activity: "2026 辽传短剧展映周" });
    setFiles({ cover: "", video: "" });
    showToast("作品已提交审核");
    window.setTimeout(() => setView("profile"), 700);
  };
  return (
    <div className="page page-with-nav create-page">
      <header className="page-header"><div><span className="eyebrow">CREATOR STUDIO</span><h1>创作中心</h1></div><button className="draft-button" onClick={() => showToast("草稿已保存")}>保存草稿</button></header>
      <div className="creator-banner"><div><Sparkles size={24} /><span>本月创作力</span><strong>68</strong><small>已超过 72% 校园创作者</small></div><div className="progress-ring">68%</div></div>
      <section className="form-section">
        <div className="form-section__title"><span>01</span><div><strong>作品素材</strong><small>上传封面与成片</small></div></div>
        <div className="upload-grid">
          <button className={files.cover ? "uploaded" : ""} onClick={() => coverRef.current?.click()}><ImageUp size={25} /><strong>{files.cover || "作品封面"}</strong><small>建议 3:4 竖图</small>{files.cover && <CheckCircle2 size={18} />}</button>
          <button className={files.video ? "uploaded" : ""} onClick={() => videoRef.current?.click()}><FileVideo size={25} /><strong>{files.video || "短剧视频"}</strong><small>MP4，20分钟内</small>{files.video && <CheckCircle2 size={18} />}</button>
        </div>
        <input ref={coverRef} hidden type="file" accept="image/*" onChange={(event) => setFiles((current) => ({ ...current, cover: event.target.files[0]?.name || "" }))} />
        <input ref={videoRef} hidden type="file" accept="video/*" onChange={(event) => setFiles((current) => ({ ...current, video: event.target.files[0]?.name || "" }))} />
      </section>
      <section className="form-section">
        <div className="form-section__title"><span>02</span><div><strong>作品信息</strong><small>让观众快速了解故事</small></div></div>
        <label className="input-field"><span>作品名称 *</span><input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="输入短剧名称" /></label>
        <label className="input-field"><span>作品类型</span><select value={form.category} onChange={(event) => update("category", event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="input-field"><span>故事简介</span><textarea value={form.intro} onChange={(event) => update("intro", event.target.value)} placeholder="用一两句话介绍核心剧情" /></label>
        <label className="input-field"><span>作品标签</span><div className="input-with-icon"><Hash size={17} /><input value={form.tags} onChange={(event) => update("tags", event.target.value)} placeholder="青春、悬疑、毕业季" /></div></label>
      </section>
      <section className="form-section">
        <div className="form-section__title"><span>03</span><div><strong>主创名单</strong><small>完整记录团队分工</small></div></div>
        <div className="form-two-col">
          <label className="input-field"><span>导演</span><input value={form.director} onChange={(event) => update("director", event.target.value)} placeholder="姓名" /></label>
          <label className="input-field"><span>编剧</span><input value={form.writer} onChange={(event) => update("writer", event.target.value)} placeholder="姓名" /></label>
        </div>
        <label className="input-field"><span>主要演员</span><input value={form.actors} onChange={(event) => update("actors", event.target.value)} placeholder="多人请用顿号分隔" /></label>
        <label className="input-field"><span>指导教师</span><input value={form.teacher} onChange={(event) => update("teacher", event.target.value)} placeholder="选填" /></label>
      </section>
      <section className="form-section">
        <div className="form-section__title"><span>04</span><div><strong>参展设置</strong><small>选择投稿活动</small></div></div>
        <label className="input-field"><span>投稿活动</span><select value={form.activity} onChange={(event) => update("activity", event.target.value)}><option>不参加活动，仅发布作品</option>{activities.map((item) => <option key={item.id}>{item.title}</option>)}</select></label>
      </section>
      <button className="primary-button publish-button" onClick={publish}><Upload size={19} />提交作品审核</button>
    </div>
  );
}

function RecruitPage({ onBack, applications, setApplications, setModal, showToast }) {
  const [role, setRole] = useState("全部");
  const roles = ["全部", "演员", "导演", "摄影", "编剧", "制片", "录音", "美术", "后期"];
  const filtered = role === "全部" ? recruitments : recruitments.filter((item) => item.role === role);
  const apply = (item) => {
    if (applications.some((application) => application.id === item.id)) return showToast("你已经申请过这个岗位");
    setApplications((current) => [...current, { ...item, status: "待沟通", appliedAt: "刚刚" }]);
    showToast("申请已发送给剧组");
  };
  return (
    <div className="page sub-page">
      <header className="sub-header"><button className="icon-button" onClick={onBack}><ArrowLeft size={21} /></button><div><h1>剧组招募</h1><span>找到下一次开机的搭档</span></div><button className="icon-button"><Search size={20} /></button></header>
      <div className="recruit-hero"><div><span className="eyebrow">CREW WANTED</span><strong>8 个剧组正在等你</strong><p>从一个岗位开始，加入真实的校园创作现场。</p></div><Users size={54} /></div>
      <div className="role-tabs">{roles.map((item) => <button key={item} className={role === item ? "active" : ""} onClick={() => setRole(item)}>{item}</button>)}</div>
      <div className="recruit-list">
        {filtered.map((item) => {
          const applied = applications.some((application) => application.id === item.id);
          return (
            <article className="recruit-card" key={item.id}>
              <button className="recruit-card__main" onClick={() => setModal({ type: "recruitment", data: item })}>
                <div className="role-badge">{item.role.slice(0, 1)}</div>
                <div><span>{item.role} · {item.crew}</span><h3>{item.title}</h3><div>{item.tags.map((tag) => <small key={tag}>{tag}</small>)}</div></div>
                <ChevronRight size={18} />
              </button>
              <footer><span><Clock3 size={14} />{item.deadline} 截止</span><span><Users size={14} />招 {item.people} 人</span><button className={applied ? "applied" : ""} onClick={() => apply(item)}>{applied ? "已申请" : "立即申请"}</button></footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function ResourcesPage({ onBack, setModal }) {
  const [type, setType] = useState("全部");
  const filtered = type === "全部" ? resources : resources.filter((item) => item.type === type);
  return (
    <div className="page sub-page">
      <header className="sub-header"><button className="icon-button" onClick={onBack}><ArrowLeft size={21} /></button><div><h1>实训资源</h1><span>场地、设备与实验室预约</span></div><button className="icon-button"><CalendarDays size={20} /></button></header>
      <div className="resource-stats"><div><strong>8</strong><span>开放资源</span></div><div><strong>5</strong><span>今日可约</span></div><div><strong>3</strong><span>我的预约</span></div></div>
      <div className="role-tabs resource-tabs">{["全部", "场地", "设备", "机房", "实验室"].map((item) => <button key={item} className={type === item ? "active" : ""} onClick={() => setType(item)}>{item}</button>)}</div>
      <div className="resource-list">
        {filtered.map((item) => {
          const Icon = resourceIcons[item.icon];
          return (
            <article className="resource-card" key={item.id}>
              <div className={`resource-icon resource-icon--${item.type}`}><Icon size={25} /></div>
              <div className="resource-info"><span>{item.type} · {item.available ? "当前可预约" : "使用中"}</span><h3>{item.name}</h3><small><MapPin size={13} />{item.location}</small><small><Clock3 size={13} />{item.slots.join(" / ")}</small></div>
              <button disabled={!item.available} onClick={() => setModal({ type: "booking", data: item })}>{item.available ? "预约" : "候补"}</button>
            </article>
          );
        })}
      </div>
      <div className="booking-notice"><Building2 size={21} /><div><strong>预约须知</strong><p>场地与设备仅用于教学及校园创作，提交后由实训中心审核。</p></div></div>
    </div>
  );
}

function MessagesPage({ messages, setMessages, setModal }) {
  const unread = messages.filter((item) => !item.read).length;
  const openMessage = (message) => {
    setMessages((current) => current.map((item) => item.id === message.id ? { ...item, read: true } : item));
    setModal({ type: "message", data: message });
  };
  return (
    <div className="page page-with-nav">
      <header className="page-header"><div><span className="eyebrow">INBOX</span><h1>消息中心</h1></div><button className="text-button" onClick={() => setMessages((current) => current.map((item) => ({ ...item, read: true })))}>全部已读</button></header>
      <div className="message-overview"><div><Bell size={22} /><span><strong>{unread}</strong> 条未读消息</span></div><small>通知与互动都在这里</small></div>
      <div className="message-list">
        {messages.map((message) => (
          <button className={`message-row ${message.read ? "" : "unread"}`} key={message.id} onClick={() => openMessage(message)}>
            <span className={`message-type message-type--${message.id % 4}`}><MessageCircle size={19} /></span>
            <div><span><strong>{message.type}</strong><small>{message.time}</small></span><h3>{message.title}</h3><p>{message.body}</p></div>
            {!message.read && <i />}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfilePage({ user, favorites, submissions, applications, bookings, messages, setModal, openDrama, onLogout }) {
  const menu = [
    { icon: Film, label: "我的作品", count: submissions.length, type: "submissions" },
    { icon: Upload, label: "我的投稿", count: submissions.length, type: "submissions" },
    { icon: Bookmark, label: "我的收藏", count: favorites.length, type: "favorites" },
    { icon: Users, label: "我的剧组", count: applications.length, type: "applications" },
    { icon: CalendarDays, label: "我的预约", count: bookings.length, type: "bookings" },
  ];
  return (
    <div className="page page-with-nav profile-page">
      <header className="profile-top"><span className="eyebrow">CREATOR PROFILE</span><button className="icon-button" onClick={() => setModal({ type: "settings" })}><Settings size={20} /></button></header>
      <section className="profile-identity">
        <div className="profile-avatar">林<span /></div>
        <div><h1>{user.name}</h1><p>{user.school} · {user.major}</p><span><GraduationCap size={14} />{user.grade} · 学号 {user.account}</span></div>
      </section>
      <div className="profile-numbers"><button onClick={() => setModal({ type: "submissions" })}><strong>{submissions.length}</strong><span>作品</span></button><button onClick={() => setModal({ type: "favorites" })}><strong>{favorites.length}</strong><span>收藏</span></button><button><strong>126</strong><span>获赞</span></button><button><strong>18</strong><span>关注</span></button></div>
      <section className="creator-level"><div><span><Sparkles size={16} />创作者等级 Lv.3</span><strong>680 / 1000</strong></div><div className="level-track"><span /></div><small>再获得 320 点创作力即可升级</small></section>
      <section className="profile-menu">
        {menu.map(({ icon: Icon, label, count, type }) => <button key={label} onClick={() => setModal({ type })}><span><Icon size={20} /></span><strong>{label}</strong><small>{count || ""}</small><ChevronRight size={18} /></button>)}
      </section>
      <section className="profile-menu profile-menu--secondary">
        <button onClick={() => setModal({ type: "messages", data: messages })}><span><Bell size={20} /></span><strong>消息与通知</strong><ChevronRight size={18} /></button>
        <button onClick={() => setModal({ type: "about" })}><span><CircleUserRound size={20} /></span><strong>关于平台</strong><ChevronRight size={18} /></button>
        <button className="logout-row" onClick={onLogout}><span><LogOut size={20} /></span><strong>退出登录</strong></button>
      </section>
      {favorites.length > 0 && <section className="content-section profile-favorites"><SectionTitle title="最近收藏" /><div className="poster-row">{dramas.filter((item) => favorites.includes(item.id)).map((item) => <PosterCard key={item.id} drama={item} onOpen={openDrama} />)}</div></section>}
    </div>
  );
}

function AppModal({ modal, setModal, applications, setApplications, bookings, setBookings, showToast }) {
  const close = () => setModal(null);
  if (modal.type === "featuredProject") {
    const project = modal.data;
    return (
      <Modal title="重点项目" onClose={close}>
        <div className="project-detail">
          <img src={project.image} alt={`${project.title}${project.subtitle}`} />
          <span className="detail-label">{project.status}</span>
          <h2>{project.title}</h2>
          <strong>{project.subtitle}</strong>
          <div className="credit-list project-credits">
            <div><span>出品单位</span><strong>辽宁传媒学院</strong></div>
            <div><span>联合出品</span><strong>辽宁数字电影产业园有限公司</strong></div>
            <div><span>总监制</span><strong>{project.supervisor}</strong></div>
            <div><span>项目状态</span><strong>已开机</strong></div>
          </div>
          <button className="primary-button" onClick={() => { close(); showToast("已订阅项目后续动态"); }}><Bell size={17} />关注项目动态</button>
        </div>
      </Modal>
    );
  }
  if (modal.type === "activity" || modal.type === "activities") {
    const list = modal.type === "activity" ? [modal.data] : activities;
    return <Modal title={modal.type === "activity" ? "活动详情" : "全部活动"} onClose={close}>{list.map((item) => <div className="detail-block" key={item.id}><span className="detail-label" style={{ color: item.color }}>{item.status}</span><h2>{item.title}</h2><div className="detail-meta"><span><CalendarDays size={15} />{item.date}</span><span><MapPin size={15} />{item.place}</span></div><p>{item.detail}</p><button className="primary-button" onClick={() => { close(); showToast("已加入活动提醒"); }}><Bell size={17} />订阅活动提醒</button></div>)}</Modal>;
  }
  if (modal.type === "recruitment") {
    const item = modal.data;
    const applied = applications.some((application) => application.id === item.id);
    return <Modal title="岗位详情" onClose={close}><div className="detail-block"><span className="detail-label">{item.role} · {item.crew}</span><h2>{item.title}</h2><div className="detail-meta"><span><Clock3 size={15} />{item.deadline} 截止</span><span><Users size={15} />招募 {item.people} 人</span></div><p>{item.detail}</p><h4>岗位关键词</h4><div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><button className="primary-button" disabled={applied} onClick={() => { setApplications((current) => [...current, { ...item, status: "待沟通", appliedAt: "刚刚" }]); close(); showToast("申请已发送给剧组"); }}>{applied ? "已提交申请" : "提交加入申请"}</button></div></Modal>;
  }
  if (modal.type === "booking") return <BookingForm resource={modal.data} close={close} bookings={bookings} setBookings={setBookings} showToast={showToast} />;
  if (modal.type === "creators") {
    const drama = modal.data;
    return <Modal title="主创团队" onClose={close}><div className="team-profile"><span className="creator-logo creator-logo--large">{drama.creator.slice(0, 1)}</span><h2>{drama.creator}</h2><p>{drama.school}</p></div><div className="credit-list"><div><span>导演</span><strong>周屿</strong></div><div><span>编剧</span><strong>许言</strong></div><div><span>摄影</span><strong>陈默</strong></div><div><span>主演</span><strong>林晓、沈川</strong></div><div><span>指导教师</span><strong>王若松</strong></div></div></Modal>;
  }
  if (modal.type === "share") return <Modal title="分享作品" onClose={close}><div className="share-grid"><button onClick={() => { close(); showToast("分享链接已复制"); }}><span>链</span><strong>复制链接</strong></button><button onClick={() => showToast("分享卡片已生成")}><span>卡</span><strong>生成卡片</strong></button><button onClick={() => showToast("已分享到班级群")}><span>群</span><strong>班级群</strong></button></div></Modal>;
  if (modal.type === "message") return <Modal title={modal.data.type} onClose={close}><div className="detail-block"><span className="detail-label">{modal.data.time}</span><h2>{modal.data.title}</h2><p>{modal.data.body}</p><button className="secondary-button" onClick={close}>知道了</button></div></Modal>;
  if (modal.type === "favorites") {
    const list = dramas.filter((item) => readStorage("liaochuan-favorites", []).includes(item.id));
    return <Modal title="我的收藏" onClose={close}>{list.length ? <div className="modal-list">{list.map((item) => <div key={item.id}><img src={item.cover} alt="" /><div><strong>{item.title}</strong><span>{item.creator}</span></div><Star size={16} />{item.score}</div>)}</div> : <EmptyState title="暂时没有收藏" text="在片库中发现喜欢的作品吧" />}</Modal>;
  }
  if (modal.type === "submissions") {
    const list = readStorage("liaochuan-submissions", []);
    return <Modal title="我的投稿" onClose={close}>{list.length ? <div className="record-list">{list.map((item) => <div key={item.id}><span className="record-icon"><Film size={19} /></span><div><strong>{item.title}</strong><span>{item.activity}</span></div><small>{item.status}</small></div>)}</div> : <EmptyState icon={Upload} title="还没有投稿记录" text="完成第一部作品，让故事正式开机" />}</Modal>;
  }
  if (modal.type === "applications") return <Modal title="我的剧组申请" onClose={close}>{applications.length ? <div className="record-list">{applications.map((item) => <div key={item.id}><span className="record-icon"><Users size={19} /></span><div><strong>{item.title}</strong><span>{item.crew} · {item.role}</span></div><small>{item.status}</small></div>)}</div> : <EmptyState icon={Users} title="还没有加入剧组" text="去招募广场寻找合适的岗位" />}</Modal>;
  if (modal.type === "bookings") return <Modal title="我的预约" onClose={close}>{bookings.length ? <div className="record-list">{bookings.map((item) => <div key={item.id}><span className="record-icon"><CalendarDays size={19} /></span><div><strong>{item.resource}</strong><span>{item.date} · {item.time}</span></div><small>待审核</small></div>)}</div> : <EmptyState icon={CalendarDays} title="还没有预约" text="场地与设备均可在线申请" />}</Modal>;
  if (modal.type === "settings") return <Modal title="设置" onClose={close}><div className="settings-list"><button><span>消息推送</span><i className="toggle active" /></button><button><span>移动网络播放</span><i className="toggle" /></button><button onClick={() => { localStorage.clear(); showToast("本地演示数据已清理"); close(); }}><span>清理本地数据</span><small>重置</small></button></div></Modal>;
  if (modal.type === "about") return <Modal title="关于平台" onClose={close}><div className="about-panel"><span className="brand-mark brand-mark--large"><Play size={30} fill="currentColor" /></span><h2>斑海豹</h2><p>面向辽宁传媒学院学生的校园短剧创作、展映、协作与实训资源服务平台。</p><small>Version 1.0.0 · 2026</small></div></Modal>;
  if (modal.type === "messages") return <Modal title="消息记录" onClose={close}><div className="record-list">{modal.data.map((item) => <div key={item.id}><span className="record-icon"><Bell size={18} /></span><div><strong>{item.title}</strong><span>{item.body}</span></div></div>)}</div></Modal>;
  return null;
}

function BookingForm({ resource, close, bookings, setBookings, showToast }) {
  const [form, setForm] = useState({ date: "2026-06-12", time: resource.slots[0], purpose: "", people: "4", contact: "13800001234" });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = () => {
    if (!form.purpose.trim()) return showToast("请填写使用用途");
    setBookings((current) => [{ id: Date.now(), resource: resource.name, ...form }, ...current]);
    close();
    showToast("预约申请已提交");
  };
  return (
    <Modal title="预约申请" onClose={close}>
      <div className="booking-resource"><div className="resource-icon"><CalendarDays size={22} /></div><div><strong>{resource.name}</strong><span>{resource.location}</span></div></div>
      <label className="input-field"><span>使用日期</span><input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} /></label>
      <label className="input-field"><span>时间段</span><select value={form.time} onChange={(event) => update("time", event.target.value)}>{resource.slots.map((slot) => <option key={slot}>{slot}</option>)}</select></label>
      <label className="input-field"><span>使用用途 *</span><textarea value={form.purpose} onChange={(event) => update("purpose", event.target.value)} placeholder="简要说明课程或作品拍摄用途" /></label>
      <div className="form-two-col"><label className="input-field"><span>使用人数</span><input type="number" value={form.people} onChange={(event) => update("people", event.target.value)} /></label><label className="input-field"><span>联系电话</span><input value={form.contact} onChange={(event) => update("contact", event.target.value)} /></label></div>
      <button className="primary-button" onClick={submit}><CheckCircle2 size={18} />提交预约</button>
    </Modal>
  );
}

export default App;
