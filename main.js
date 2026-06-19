const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 8);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuToggle?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks?.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    navLinks.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

const currentPage = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a").forEach((link) => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("is-active");
  }
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const counters = document.querySelectorAll("[data-count]");

const animateCounter = (counter) => {
  const target = Number(counter.dataset.count || "0");
  const duration = 1500;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = Math.round(target * eased);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

if ("IntersectionObserver" in window) {
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.55 }
  );

  counters.forEach((counter) => countObserver.observe(counter));
} else {
  counters.forEach(animateCounter);
}

const contactForm = document.querySelector("#contact-form");
const contactStatus = contactForm?.querySelector(".form-status");

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = Array.from(contactForm.querySelectorAll("input, textarea"));
  const hasEmpty = fields.some((field) => !field.value.trim());

  if (hasEmpty) {
    contactStatus.textContent = "Completa todos los campos para enviar el mensaje.";
    contactStatus.style.color = "var(--danger)";
    return;
  }

  contactStatus.textContent = "Mensaje listo. Conecta este formulario a correo o backend cuando publiques el sitio.";
  contactStatus.style.color = "var(--success)";
  contactForm.reset();
});

const eventCards = document.querySelectorAll(".event-card");

const getLocalDate = (dateText) => {
  const [year, month, day] = dateText.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatIcsDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

const escapeIcsText = (text) =>
  text
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");

const updateEventCountdowns = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  eventCards.forEach((card) => {
    const date = getLocalDate(card.dataset.eventDate);
    const countdown = card.querySelector("[data-countdown]");
    const difference = Math.ceil((date - today) / 86400000);

    countdown.classList.remove("is-today", "is-past");

    if (difference > 1) {
      countdown.textContent = `Faltan ${difference} dias`;
    } else if (difference === 1) {
      countdown.textContent = "Falta 1 dia";
    } else if (difference === 0) {
      countdown.textContent = "Es hoy";
      countdown.classList.add("is-today");
    } else {
      countdown.textContent = "Evento realizado";
      countdown.classList.add("is-past");
    }
  });
};

const downloadCalendarEvent = (card) => {
  const startDate = getLocalDate(card.dataset.eventDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  const title = card.dataset.eventTitle || "Evento institucional";
  const description = card.dataset.eventDescription || "";
  const location = "R878+W6 Vegachi, Antioquia, Colombia";
  const fileName = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "evento";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JFK Sede El Cinco//Calendario Escolar//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${card.dataset.eventDate}-${fileName}@jfk-sede-el-cinco`,
    `DTSTAMP:${formatIcsDate(new Date())}T120000Z`,
    `DTSTART;VALUE=DATE:${formatIcsDate(startDate)}`,
    `DTEND;VALUE=DATE:${formatIcsDate(endDate)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

eventCards.forEach((card) => {
  card.querySelector("[data-calendar]")?.addEventListener("click", () => {
    downloadCalendarEvent(card);
  });
});

updateEventCountdowns();

// ─────────────────────────────────────────────────────────────────────────────
// NOTICIAS — reemplaza desde "const googleNewsList" hasta el final de
// "loadGoogleEducationNews();" en tu main.js actual
// ─────────────────────────────────────────────────────────────────────────────

const googleNewsList = document.querySelector("#google-news-list");

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const cleanNewsTitle = (title) => title.replace(/\s+-\s+[^-]+$/, "").trim();

const googleNewsUrl =
  "https://news.google.com/search?q=educacion%20Colombia&hl=es-419&gl=CO&ceid=CO:es-419";

const formatNewsDate = (dateText) => {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return "Fecha reciente";
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

// ── Skeleton loader ────────────────────────────────────────────────────────────

const renderSkeletons = () => {
  if (!googleNewsList) return;
  googleNewsList.innerHTML = Array.from({ length: 5 })
    .map(
      () => `
    <article class="live-news-card live-news-skeleton" aria-hidden="true">
      <div class="skeleton-preview"></div>
      <div class="skeleton-tag"></div>
      <div class="skeleton-title"></div>
      <div class="skeleton-title skeleton-title--short"></div>
      <div class="skeleton-source"></div>
      <div class="skeleton-link"></div>
    </article>`
    )
    .join("");
};

// ── Render de noticias reales ──────────────────────────────────────────────────

const renderGoogleNews = (items) => {
  if (!googleNewsList) return;
  googleNewsList.innerHTML = "";

  items.slice(0, 5).forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "live-news-card";

    const preview = document.createElement("a");
    preview.className = "live-news-preview";
    preview.href = item.link;
    preview.target = "_blank";
    preview.rel = "noopener";
    preview.setAttribute("aria-label", `Abrir noticia: ${cleanNewsTitle(item.title)}`);
    preview.dataset.variant = String((index % 5) + 1);

    const previewSource = document.createElement("span");
    previewSource.textContent = item.source || "Google News";

    const previewTitle = document.createElement("strong");
    previewTitle.textContent = "Educacion";

    preview.append(previewSource, previewTitle);

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = item.source === "groq" ? "IA Educativa" : "Google News";

    const time = document.createElement("time");
    time.dateTime = item.isoDate || "";
    time.textContent = formatNewsDate(item.pubDate);

    const title = document.createElement("h3");
    title.textContent = cleanNewsTitle(item.title);

    const source = document.createElement("p");
    source.textContent = item.source || "Educacion Colombia";

    const link = document.createElement("a");
    link.href = item.link;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Leer noticia";

    card.append(preview, tag, time, title, source, link);
    googleNewsList.appendChild(card);
  });
};

// ── Render de error ────────────────────────────────────────────────────────────

const renderGoogleNewsError = () => {
  if (!googleNewsList) return;
  googleNewsList.innerHTML = `
    <article class="live-news-card">
      <a class="live-news-preview" data-variant="1" href="${googleNewsUrl}"
         target="_blank" rel="noopener" aria-label="Abrir Google News">
        <span>Google News</span>
        <strong>Educacion</strong>
      </a>
      <span class="tag">Google News</span>
      <h3>No se pudieron cargar las noticias automaticas.</h3>
      <p>Puede ser un bloqueo temporal. Usa el boton "Ver en Google News" para consultar las noticias actuales.</p>
      <a href="${googleNewsUrl}" target="_blank" rel="noopener">Abrir Google News</a>
    </article>
  `;
};

// ── Carga principal con cache diario ──────────────────────────────────────────

const loadGoogleEducationNews = async () => {
  if (!googleNewsList) return;

  const cacheKey = "jfk-google-news-cache";
  const today = getTodayKey();

  // 1. Intentar cache local del dia
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
    if (cached?.date === today && Array.isArray(cached.items) && cached.items.length) {
      renderGoogleNews(cached.items);
      return;
    }
  } catch {
    localStorage.removeItem(cacheKey);
  }

  // 2. Mostrar skeletons mientras carga
  renderSkeletons();

  // 3. Llamar al endpoint /api/news (RSS primero, Groq como fallback)
  try {
    const apiResponse = await fetch("/api/news");

    if (!apiResponse.ok) throw new Error(`/api/news respondio ${apiResponse.status}`);

    const data = await apiResponse.json();
    const items = Array.isArray(data.items) ? data.items : [];

    if (!items.length) throw new Error("Sin items en la respuesta");

    // Guardar en cache con la fuente para el tag visual
    const itemsWithSource = items.map((item) => ({
      ...item,
      source: data.source === "groq" ? "groq" : item.source,
    }));

    localStorage.setItem(cacheKey, JSON.stringify({ date: today, items: itemsWithSource }));
    renderGoogleNews(itemsWithSource);
  } catch (error) {
    console.warn("[news] Error cargando noticias:", error.message);
    renderGoogleNewsError();
  }
};

loadGoogleEducationNews();

const lightbox = document.querySelector("#lightbox");
const lightboxCaption = document.querySelector(".lightbox-caption");
const lightboxFrame = document.querySelector(".lightbox-frame");
const lightboxClose = document.querySelector(".lightbox-close");

document.querySelectorAll("[data-lightbox]").forEach((item) => {
  item.addEventListener("click", () => {
    const image = item.querySelector("img");
    lightboxCaption.textContent = item.dataset.lightbox;

    if (lightboxFrame) {
      lightboxFrame.textContent = "";

      if (image) {
        const largeImage = document.createElement("img");
        largeImage.src = image.currentSrc || image.src;
        largeImage.alt = image.alt || item.dataset.lightbox || "Imagen de galeria";
        lightboxFrame.appendChild(largeImage);
      } else {
        lightboxFrame.textContent = "Imagen ampliada";
      }
    }

    lightbox.classList.add("is-open");
    document.body.classList.add("no-scroll");
  });
});

const closeLightbox = () => {
  lightbox?.classList.remove("is-open");
  document.body.classList.remove("no-scroll");
};

lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});

const portalRoot = document.querySelector("[data-portal]");
const loginForm = document.querySelector("#login-form");
const loginPanel = document.querySelector("#login-panel");
const dashboard = document.querySelector("#dashboard");
const logoutButton = document.querySelector("#logout-button");

if (portalRoot && loginForm && loginPanel && dashboard) {
  const portalState = {
    client: null,
    user: null,
    profile: null,
    students: [],
    grades: [],
  };

  const portalEls = {
    loginStatus: document.querySelector("[data-login-status]"),
    alert: document.querySelector("[data-portal-alert]"),
    roleLabel: document.querySelector("[data-role-label]"),
    profileName: document.querySelector("[data-profile-name]"),
    profileEmail: document.querySelector("[data-profile-email]"),
    averageScore: document.querySelector("[data-average-score]"),
    subjectCount: document.querySelector("[data-subject-count]"),
    gradeCount: document.querySelector("[data-grade-count]"),
    studentGradesBody: document.querySelector("[data-student-grades-body]"),
    studentList: document.querySelector("[data-student-list]"),
    studentSelect: document.querySelector("[data-student-select]"),
    teacherGradesBody: document.querySelector("[data-teacher-grades-body]"),
    studentStatus: document.querySelector("[data-student-status]"),
    gradeStatus: document.querySelector("[data-grade-status]"),
    subjectChart: document.querySelector("#subject-chart"),
    periodChart: document.querySelector("#period-chart"),
  };

  const escapeHtml = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const setStatus = (element, message, type = "info") => {
    if (!element) return;
    element.textContent = message;
    element.style.color = type === "error" ? "var(--danger)" : "var(--success)";
  };

  const showPortalAlert = (message, type = "info") => {
    if (!portalEls.alert) return;
    portalEls.alert.textContent = message;
    portalEls.alert.dataset.type = type;
    portalEls.alert.classList.toggle("is-hidden", !message);
  };

  const setActiveTab = (target) => {
    document.querySelectorAll(".tab-button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.tab === target);
    });

    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("is-hidden", panel.dataset.panel !== target);
    });
  };

  const loadPortalConfig = async () => {
    if (window.JFK_SUPABASE_CONFIG?.supabaseUrl && window.JFK_SUPABASE_CONFIG?.supabaseAnonKey) {
      return window.JFK_SUPABASE_CONFIG;
    }

    const response = await fetch("/api/portal-config");
    if (!response.ok) {
      throw new Error("No se encontro /api/portal-config. Ejecuta el sitio en Vercel y configura Supabase.");
    }

    const config = await response.json();
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      throw new Error("Faltan SUPABASE_URL o SUPABASE_ANON_KEY en Vercel.");
    }

    return config;
  };

  const initSupabaseClient = async () => {
    if (!window.supabase?.createClient) {
      throw new Error("No se cargo la libreria de Supabase desde el CDN.");
    }

    const config = await loadPortalConfig();
    return window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  };

  const requireClient = () => {
    if (!portalState.client) {
      throw new Error("Supabase no esta inicializado.");
    }

    return portalState.client;
  };

  const fetchProfile = async (userId) => {
    const { data, error } = await requireClient()
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", userId)
      .single();

    if (error) throw new Error("Tu usuario no tiene perfil en la tabla profiles.");
    return data;
  };

  const applyRoleVisibility = (role) => {
    document.querySelectorAll("[data-role-tab]").forEach((tab) => {
      tab.classList.toggle("is-hidden", tab.dataset.roleTab !== role);
    });

    document.querySelectorAll("[data-role-panel]").forEach((panel) => {
      panel.classList.toggle("is-hidden", panel.dataset.rolePanel !== role);
    });

    setActiveTab(role === "teacher" ? "teacher-students" : "student-summary");
  };

  const showLogin = () => {
    portalState.user = null;
    portalState.profile = null;
    portalState.students = [];
    portalState.grades = [];
    dashboard.classList.add("is-hidden");
    loginPanel.classList.remove("is-hidden");
    showPortalAlert("");
  };

  const showDashboard = () => {
    loginPanel.classList.add("is-hidden");
    dashboard.classList.remove("is-hidden");
  };

  const formatScore = (score) => Number(score || 0).toFixed(1);

  const getSubjectName = (grade) => grade.subjects?.name || grade.subject_name || "Asignatura";

  const average = (values) => {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
  };

  const groupAverages = (grades, keyGetter) => {
    const groups = new Map();

    grades.forEach((grade) => {
      const key = keyGetter(grade);
      const current = groups.get(key) || [];
      current.push(Number(grade.score || 0));
      groups.set(key, current);
    });

    return Array.from(groups.entries()).map(([label, scores]) => ({
      label,
      value: average(scores),
    }));
  };

  const drawBarChart = (canvas, data, emptyMessage) => {
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#101a31";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(255,255,255,0.14)";
    context.strokeRect(0.5, 0.5, width - 1, height - 1);

    if (!data.length) {
      context.fillStyle = "#9eacc7";
      context.font = "18px DM Sans, Arial";
      context.fillText(emptyMessage, 28, height / 2);
      return;
    }

    const padding = 44;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barGap = 18;
    const barWidth = Math.max(28, (chartWidth - barGap * (data.length - 1)) / data.length);

    context.strokeStyle = "rgba(255,255,255,0.18)";
    context.beginPath();
    context.moveTo(padding, padding);
    context.lineTo(padding, height - padding);
    context.lineTo(width - padding, height - padding);
    context.stroke();

    data.forEach((item, index) => {
      const x = padding + index * (barWidth + barGap);
      const barHeight = Math.max(4, (Math.min(item.value, 5) / 5) * chartHeight);
      const y = height - padding - barHeight;

      const gradient = context.createLinearGradient(0, y, 0, height - padding);
      gradient.addColorStop(0, "#5ee4ff");
      gradient.addColorStop(1, "#1847c8");

      context.fillStyle = gradient;
      context.fillRect(x, y, barWidth, barHeight);
      context.fillStyle = "#eef4ff";
      context.font = "700 15px DM Sans, Arial";
      context.fillText(formatScore(item.value), x, y - 8);
      context.fillStyle = "#9eacc7";
      context.font = "12px DM Sans, Arial";
      context.fillText(String(item.label).slice(0, 12), x, height - 16);
    });
  };

  const renderStudentCharts = (grades) => {
    const subjectData = groupAverages(grades, getSubjectName);
    const periodData = groupAverages(grades, (grade) => `P${grade.period}`).sort((a, b) =>
      a.label.localeCompare(b.label)
    );

    drawBarChart(portalEls.subjectChart, subjectData, "Aun no hay notas por asignatura.");
    drawBarChart(portalEls.periodChart, periodData, "Aun no hay notas por periodo.");
  };

  const renderStudentGrades = (grades) => {
    if (!portalEls.studentGradesBody) return;

    if (!grades.length) {
      portalEls.studentGradesBody.innerHTML = `<tr><td colspan="4">Aun no hay notas registradas.</td></tr>`;
      return;
    }

    portalEls.studentGradesBody.innerHTML = grades
      .map(
        (grade) => `
          <tr>
            <td>${escapeHtml(getSubjectName(grade))}</td>
            <td>Periodo ${escapeHtml(grade.period)}</td>
            <td><strong>${formatScore(grade.score)}</strong></td>
            <td>${escapeHtml(grade.observation || "Sin observacion")}</td>
          </tr>`
      )
      .join("");
  };

  const loadStudentDashboard = async () => {
    const { data: student, error: studentError } = await requireClient()
      .from("students")
      .select("id, full_name, grade_level, group_name")
      .eq("profile_id", portalState.user.id)
      .eq("active", true)
      .maybeSingle();

    if (studentError) throw studentError;

    if (!student) {
      showPortalAlert("Tu cuenta aun no esta vinculada a un estudiante. Pide al colegio que relacione tu usuario en Supabase.", "error");
      renderStudentGrades([]);
      renderStudentCharts([]);
      return;
    }

    const { data: grades, error: gradesError } = await requireClient()
      .from("grades")
      .select("id, period, score, observation, subjects(name)")
      .eq("student_id", student.id)
      .order("period", { ascending: true });

    if (gradesError) throw gradesError;

    portalState.grades = grades || [];
    const scores = portalState.grades.map((grade) => Number(grade.score || 0));
    portalEls.averageScore.textContent = formatScore(average(scores));
    portalEls.subjectCount.textContent = String(new Set(portalState.grades.map(getSubjectName)).size);
    portalEls.gradeCount.textContent = String(portalState.grades.length);

    renderStudentGrades(portalState.grades);
    renderStudentCharts(portalState.grades);
  };

  const renderTeacherStudents = () => {
    if (portalEls.studentSelect) {
      portalEls.studentSelect.innerHTML = portalState.students.length
        ? portalState.students
            .map((student) => `<option value="${student.id}">${escapeHtml(student.full_name)} - ${escapeHtml(student.grade_level || "Sin grado")}</option>`)
            .join("")
        : `<option value="">No hay estudiantes activos</option>`;
    }

    if (!portalEls.studentList) return;

    if (!portalState.students.length) {
      portalEls.studentList.innerHTML = `<p class="muted">Aun no hay estudiantes activos.</p>`;
      return;
    }

    portalEls.studentList.innerHTML = portalState.students
      .map(
        (student) => `
          <article class="student-row">
            <div>
              <strong>${escapeHtml(student.full_name)}</strong>
              <span>${escapeHtml(student.document_id || "Sin documento")} · Grado ${escapeHtml(student.grade_level || "-")} ${escapeHtml(student.group_name || "")}</span>
            </div>
            <button type="button" class="calendar-button" data-delete-student="${student.id}">Eliminar</button>
          </article>`
      )
      .join("");
  };

  const renderTeacherGrades = () => {
    if (!portalEls.teacherGradesBody) return;

    if (!portalState.grades.length) {
      portalEls.teacherGradesBody.innerHTML = `<tr><td colspan="5">Aun no hay notas registradas.</td></tr>`;
      return;
    }

    portalEls.teacherGradesBody.innerHTML = portalState.grades
      .map(
        (grade) => `
          <tr>
            <td>${escapeHtml(grade.students?.full_name || "Estudiante")}</td>
            <td>${escapeHtml(getSubjectName(grade))}</td>
            <td>Periodo ${escapeHtml(grade.period)}</td>
            <td><strong>${formatScore(grade.score)}</strong></td>
            <td><button type="button" class="calendar-button" data-delete-grade="${grade.id}">Eliminar</button></td>
          </tr>`
      )
      .join("");
  };

  const loadTeacherDashboard = async () => {
    const { data: students, error: studentsError } = await requireClient()
      .from("students")
      .select("id, full_name, document_id, grade_level, group_name")
      .eq("active", true)
      .order("full_name", { ascending: true });

    if (studentsError) throw studentsError;

    const { data: grades, error: gradesError } = await requireClient()
      .from("grades")
      .select("id, period, score, observation, students(full_name), subjects(name)")
      .order("created_at", { ascending: false });

    if (gradesError) throw gradesError;

    portalState.students = students || [];
    portalState.grades = grades || [];
    renderTeacherStudents();
    renderTeacherGrades();
  };

  const loadDashboardData = async () => {
    showPortalAlert("");

    if (portalState.profile.role === "student") {
      await loadStudentDashboard();
      return;
    }

    if (portalState.profile.role === "teacher") {
      await loadTeacherDashboard();
      return;
    }

    showPortalAlert("Rol no permitido. Usa 'student' o 'teacher' en profiles.role.", "error");
  };

  const renderAuthenticatedPortal = async (session) => {
    portalState.user = session.user;
    portalState.profile = await fetchProfile(session.user.id);

    portalEls.profileName.textContent = portalState.profile.full_name || "Usuario";
    portalEls.profileEmail.textContent = session.user.email || "";
    portalEls.roleLabel.textContent = portalState.profile.role === "teacher" ? "Portal profesor" : "Portal estudiante";

    applyRoleVisibility(portalState.profile.role);
    showDashboard();
    await loadDashboardData();
  };

  const handlePortalError = (error) => {
    const message = error?.message || "No se pudo completar la accion.";
    showPortalAlert(message, "error");
    setStatus(portalEls.loginStatus, message, "error");
  };

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();

    if (!email || !password) {
      setStatus(portalEls.loginStatus, "Ingresa correo y contrasena.", "error");
      return;
    }

    setStatus(portalEls.loginStatus, "Validando acceso...");

    try {
      const { data, error } = await requireClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.session) await renderAuthenticatedPortal(data.session);
      setStatus(portalEls.loginStatus, "");
    } catch (error) {
      handlePortalError(error);
    }
  });

  logoutButton?.addEventListener("click", async () => {
    await requireClient().auth.signOut();
    loginForm.reset();
    showLogin();
  });

  document.querySelectorAll(".tab-button").forEach((tab) => {
    tab.addEventListener("click", () => {
      if (!tab.classList.contains("is-hidden")) setActiveTab(tab.dataset.tab);
    });
  });

  document.querySelector("#student-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      full_name: String(formData.get("full_name") || "").trim(),
      document_id: String(formData.get("document_id") || "").trim(),
      grade_level: String(formData.get("grade_level") || "").trim(),
      group_name: String(formData.get("group_name") || "").trim() || null,
      created_by: portalState.profile.id,
    };

    if (!payload.full_name || !payload.document_id || !payload.grade_level) {
      setStatus(portalEls.studentStatus, "Completa nombre, documento y grado.", "error");
      return;
    }

    try {
      const { error } = await requireClient().from("students").insert(payload);
      if (error) throw error;
      setStatus(portalEls.studentStatus, "Estudiante anadido.");
      form.reset();
      await loadTeacherDashboard();
    } catch (error) {
      setStatus(portalEls.studentStatus, error.message, "error");
    }
  });

  document.querySelector("#grade-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const subjectName = String(formData.get("subject_name") || "").trim();
    const studentId = String(formData.get("student_id") || "");
    const score = Number(formData.get("score"));

    if (!studentId || !subjectName || Number.isNaN(score) || score < 0 || score > 5) {
      setStatus(portalEls.gradeStatus, "Selecciona estudiante, asignatura y nota entre 0.0 y 5.0.", "error");
      return;
    }

    try {
      const { data: subject, error: subjectError } = await requireClient()
        .from("subjects")
        .upsert({ name: subjectName }, { onConflict: "name" })
        .select("id")
        .single();

      if (subjectError) throw subjectError;

      const payload = {
        student_id: studentId,
        subject_id: subject.id,
        teacher_id: portalState.profile.id,
        period: Number(formData.get("period")),
        score,
        observation: String(formData.get("observation") || "").trim() || null,
      };

      const { error } = await requireClient()
        .from("grades")
        .upsert(payload, { onConflict: "student_id,subject_id,period" });

      if (error) throw error;
      setStatus(portalEls.gradeStatus, "Nota guardada.");
      form.reset();
      await loadTeacherDashboard();
    } catch (error) {
      setStatus(portalEls.gradeStatus, error.message, "error");
    }
  });

  portalEls.studentList?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-student]");
    if (!button) return;

    try {
      const { error } = await requireClient()
        .from("students")
        .update({ active: false })
        .eq("id", button.dataset.deleteStudent);

      if (error) throw error;
      await loadTeacherDashboard();
    } catch (error) {
      showPortalAlert(error.message, "error");
    }
  });

  portalEls.teacherGradesBody?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-grade]");
    if (!button) return;

    try {
      const { error } = await requireClient().from("grades").delete().eq("id", button.dataset.deleteGrade);
      if (error) throw error;
      await loadTeacherDashboard();
    } catch (error) {
      showPortalAlert(error.message, "error");
    }
  });

  document.querySelector("[data-refresh-students]")?.addEventListener("click", loadTeacherDashboard);
  document.querySelector("[data-refresh-grades]")?.addEventListener("click", loadTeacherDashboard);

  const initPortal = async () => {
    try {
      portalState.client = await initSupabaseClient();
      const { data } = await portalState.client.auth.getSession();

      if (data.session) {
        await renderAuthenticatedPortal(data.session);
      }

      portalState.client.auth.onAuthStateChange(async (_event, session) => {
        if (!session) {
          showLogin();
          return;
        }

        await renderAuthenticatedPortal(session);
      });
    } catch (error) {
      setStatus(portalEls.loginStatus, error.message, "error");
      showPortalAlert(error.message, "error");
    }
  };

  initPortal();
}

const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const chatMessages = document.querySelector("#chat-messages");
const quickQuestions = document.querySelectorAll("[data-question]");
const chatImage = document.querySelector("#chat-image");
const imagePreview = document.querySelector("#image-preview");
const imagePreviewImg = document.querySelector("#image-preview-img");
const imagePreviewName = document.querySelector("#image-preview-name");
const removeImageButton = document.querySelector("#remove-image");

const chatKnowledge = {
  saludo: "Hola. Soy el asistente educativo de la Institucion Educativa John F Kennedy - Sede El Cinco. Puedo orientarte sobre informacion del colegio y tambien ayudarte a estudiar con explicaciones claras. Dime que necesitas y lo resolvemos paso a paso.",
  horario: "El horario de referencia de la sede es de lunes a viernes, de 8:00 a.m. a 2:00 p.m.\n\nSi preguntas por una reunion, salida pedagogica, festivo o cambio de jornada, es mejor confirmarlo directamente con la institucion, porque esos datos pueden variar.",
  matricula: "La matricula en la sede es gratuita y normalmente se realiza al inicio y al final del ano escolar.\n\nDocumentos sugeridos:\n- Recibo de servicio de energia.\n- Documento del estudiante.\n- Documento del acudiente o responsable.\n\nPara fechas exactas, cupos o casos especiales, comunicate con el colegio.",
  contacto: "Puedes contactar a la sede por estos medios:\n\nCorreo: redes.johnfkennedy@gmail.com\nTelefono o WhatsApp: +57 312 7400098\n\nPara tramites formales, lo mas recomendable es escribir o llamar en horario escolar.",
  ubicacion: "La Institucion Educativa John F Kennedy - Sede El Cinco esta ubicada en la Vereda El Cinco, municipio de Vegachi, Antioquia.\n\nSi necesitas indicaciones para llegar, comunicate con la sede para recibir una orientacion mas precisa.",
  grados: "La sede ofrece formacion desde preescolar hasta media academica:\n\n- Preescolar.\n- Basica primaria.\n- Basica secundaria.\n- Media academica.\n\nPara confirmar disponibilidad de cupos por grado, consulta directamente con la institucion.",
  docentes: "Docentes mencionados para la sede:\n\n- Azael Renteria.\n- Hugo Contreras.\n- Jesenia.\n- Humberto Quinto.\n- Edwin Castelar.\n\nSi necesitas contactar a un docente especifico, comunicate con el colegio.",
  personero: "El personero estudiantil representa a los estudiantes, promueve sus derechos y participa en el gobierno escolar.\n\nDato disponible: Felipe Rua. Si necesitas confirmar periodo, propuestas o actividades actuales, consulta directamente con la sede.",
  restaurante: "La sede cuenta con restaurante escolar durante la jornada de clases. La organizacion puede hacerse por grados, segun la dinamica interna del colegio.\n\nPara informacion sobre menu, horarios o novedades del servicio, confirma con la institucion.",
  transporte: "Sobre transporte, se menciona que algunos estudiantes llegan caminando, en transporte particular o en bicicleta. Tambien puede haber prestamo de bicicletas segun disponibilidad.\n\nComo esto puede cambiar, confirma directamente con la sede.",
  noticias: "Para ver actividades, eventos y novedades institucionales, entra a la seccion Noticias del sitio. Alli se publican actualizaciones del colegio y temas educativos.",
  galeria: "La seccion Galeria muestra fotos y momentos de la sede. Puedes entrar desde el menu principal en la opcion Galeria.",
  desconocido: "No tengo informacion institucional confirmada sobre eso todavia. Puedes contactar al colegio por correo: redes.johnfkennedy@gmail.com o preguntar de otra forma para intentar ayudarte."
};

const keywordMap = [
  { keys: ["hola", "buenas", "saludos", "hey"], answer: "saludo" },
  { keys: ["horario", "hora", "clases", "jornada", "entrada", "salida"], answer: "horario" },
  { keys: ["matricula", "inscripcion", "documentos", "cupo"], answer: "matricula" },
  { keys: ["contacto", "telefono", "whatsapp", "llamar", "numero", "correo", "email"], answer: "contacto" },
  { keys: ["ubicacion", "direccion", "donde", "queda", "vereda", "llegar"], answer: "ubicacion" },
  { keys: ["grado", "grados", "preescolar", "primaria", "secundaria", "bachillerato", "once"], answer: "grados" },
  { keys: ["docente", "docentes", "profesor", "profesores", "maestro", "maestros"], answer: "docentes" },
  { keys: ["personero", "representante", "gobierno escolar", "voto"], answer: "personero" },
  { keys: ["restaurante", "almuerzo", "comida", "refrigerio"], answer: "restaurante" },
  { keys: ["transporte", "ruta", "bicicleta", "bici"], answer: "transporte" },
  { keys: ["noticias", "actividad", "actividades", "evento", "calendario"], answer: "noticias" },
  { keys: ["galeria", "fotos", "imagenes"], answer: "galeria" }
];

const directAnswers = [
  {
    keys: ["capital de colombia", "capital colombia"],
    answer: "La capital de Colombia es Bogota."
  },
  {
    keys: ["presidente de colombia"],
    answer: "No tengo confirmado el dato actualizado del presidente. Para informacion politica actual, consulta una fuente oficial o una noticia reciente."
  },
  {
    keys: ["departamento de vegachi", "departamento vegachi"],
    answer: "Vegachi pertenece al departamento de Antioquia, Colombia."
  },
  {
    keys: ["municipio de la sede", "municipio sede el cinco"],
    answer: "La Sede El Cinco esta en el municipio de Vegachi, Antioquia."
  }
];

const chatHistory = [];
let selectedImage = null;

const normalizeText = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();

const getLocalAnswer = (text) => {
  const normalized = normalizeText(text);
  const directMatch = directAnswers.find((item) => item.keys.some((key) => normalized.includes(normalizeText(key))));
  if (directMatch) return directMatch.answer;

  const isGeneralQuestion = /^(que|cual|quien|cuando|donde|como|por que|cuanto|cuantos)\b/.test(normalized);
  const schoolWords = ["colegio", "sede", "john", "kennedy", "matricula", "horario", "docente", "personero", "restaurante", "transporte", "vereda", "contacto", "correo", "telefono", "grado", "galeria", "noticias"];

  if (isGeneralQuestion && !schoolWords.some((word) => normalized.includes(word))) {
    return null;
  }

  const match = keywordMap.find((item) => item.keys.some((key) => normalized.includes(normalizeText(key))));
  return match ? chatKnowledge[match.answer] : null;
};

const addMessage = (text, type = "bot") => {
  const message = document.createElement("div");
  message.className = `message ${type}`;
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return message;
};

const addThinkingMessage = () => {
  const message = document.createElement("div");
  message.className = "message bot thinking";
  message.setAttribute("aria-label", "Pensando");

  ["", "", ""].forEach(() => {
    const dot = document.createElement("span");
    message.appendChild(dot);
  });

  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return message;
};

const setChatDisabled = (disabled) => {
  if (chatInput) chatInput.disabled = disabled;
  if (chatImage) chatImage.disabled = disabled;
  chatForm?.querySelector("button")?.toggleAttribute("disabled", disabled);
};

const askGroqAssistant = async (text, imageDataUrl = null) => {
  let serverResponse;

  try {
    serverResponse = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: text,
        history: chatHistory.slice(0, -1).slice(-8),
        image: imageDataUrl
      })
    });
  } catch (error) {
    throw new Error("El servidor del chat no esta disponible. Publica el sitio en Vercel y configura GROQ_API_KEY.");
  }

  let data = null;

  try {
    data = await serverResponse.json();
  } catch (error) {
    data = null;
  }

  if (serverResponse.status === 404) {
    throw new Error("El endpoint /api/chat no existe en este hosting. GitHub Pages no ejecuta funciones de API; usa Vercel.");
  }

  if (!serverResponse.ok) {
    throw new Error(data?.error || "No se pudo consultar Groq.");
  }

  return data?.answer || chatKnowledge.desconocido;
};

const getExternalAiErrorMessage = (error) => {
  const detail = error?.message || "La IA externa no esta disponible en este momento.";

  if (location.protocol === "file:") {
    return "La IA externa no funciona abriendo el archivo directamente. Debes publicar el sitio en Vercel y configurar GROQ_API_KEY.";
  }

  if (location.hostname.endsWith("github.io")) {
    return "La IA externa no funciona en GitHub Pages porque GitHub Pages no ejecuta /api/chat. Publica el sitio en Vercel y configura GROQ_API_KEY.";
  }

  return `${chatKnowledge.desconocido}\n\n${detail}`;
};

const resizeImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxSize = 1400;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };

      image.onerror = () => reject(new Error("No se pudo leer la imagen."));
      image.src = reader.result;
    };

    reader.onerror = () => reject(new Error("No se pudo cargar la imagen."));
    reader.readAsDataURL(file);
  });

const clearSelectedImage = () => {
  selectedImage = null;
  if (chatImage) chatImage.value = "";
  imagePreview?.classList.add("is-hidden");
  if (imagePreviewImg) imagePreviewImg.removeAttribute("src");
};

const updateImagePreview = (file, dataUrl) => {
  selectedImage = {
    name: file.name,
    dataUrl
  };

  if (imagePreviewImg) imagePreviewImg.src = dataUrl;
  if (imagePreviewName) imagePreviewName.textContent = file.name;
  imagePreview?.classList.remove("is-hidden");
};

const sendLocalMessage = (text) => {
  const imageDataUrl = selectedImage?.dataUrl || null;
  const imageName = selectedImage?.name || "";
  const cleanText = text.trim().slice(0, 500);
  if ((!cleanText && !imageDataUrl) || !chatMessages) return;

  const userText = imageDataUrl
    ? `${cleanText || "Resuelve el ejercicio de la foto paso a paso."}\n[Imagen adjunta: ${imageName}]`
    : cleanText;

  addMessage(userText, "user");
  chatHistory.push({ role: "user", content: cleanText || "Resuelve el ejercicio de la foto paso a paso." });
  setChatDisabled(true);
  clearSelectedImage();

  const pending = addThinkingMessage();
  const delay = 450 + Math.random() * 450;

  window.setTimeout(async () => {
    try {
      const localAnswer = imageDataUrl ? null : getLocalAnswer(cleanText);
      const answer = localAnswer || await askGroqAssistant(cleanText, imageDataUrl);
      pending.textContent = answer;
      chatHistory.push({ role: "assistant", content: answer });
    } catch (error) {
      pending.textContent = getExternalAiErrorMessage(error);
    } finally {
      setChatDisabled(false);
      chatInput?.focus();
    }
  }, delay);
};

chatForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = chatInput.value.trim();
  if (!text && !selectedImage) return;

  chatInput.value = "";
  sendLocalMessage(text);
});

quickQuestions.forEach((button) => {
  button.addEventListener("click", () => {
    sendLocalMessage(button.dataset.question || button.textContent || "");
  });
});

chatImage?.addEventListener("change", async () => {
  const file = chatImage.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    addMessage("Selecciona una imagen valida del ejercicio.", "bot");
    clearSelectedImage();
    return;
  }

  try {
    const dataUrl = await resizeImage(file);
    updateImagePreview(file, dataUrl);
    if (!chatInput.value.trim()) {
      chatInput.placeholder = "Ejemplo: resuelve este problema paso a paso...";
    }
  } catch (error) {
    addMessage("No pude preparar la imagen. Intenta con una foto mas pequena o mas nitida.", "bot");
    clearSelectedImage();
  }
});

removeImageButton?.addEventListener("click", clearSelectedImage);
