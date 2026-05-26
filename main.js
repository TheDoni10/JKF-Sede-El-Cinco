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

const googleNewsList = document.querySelector("#google-news-list");

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const cleanNewsTitle = (title) => title.replace(/\s+-\s+[^-]+$/, "").trim();

const formatNewsDate = (dateText) => {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return "Fecha reciente";
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
};

const renderGoogleNews = (items) => {
  googleNewsList.innerHTML = "";

  items.slice(0, 5).forEach((item) => {
    const card = document.createElement("article");
    card.className = "live-news-card";

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = "Google News";

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

    card.append(tag, time, title, source, link);
    googleNewsList.appendChild(card);
  });
};

const renderGoogleNewsError = () => {
  googleNewsList.innerHTML = `
    <article class="live-news-card">
      <span class="tag">Google News</span>
      <h3>No se pudieron cargar las noticias automaticas.</h3>
      <p>Puede ser un bloqueo temporal del proxy RSS. Usa el boton "Ver en Google News" para consultar las noticias actuales.</p>
      <a href="https://news.google.com/search?q=educacion%20Colombia&hl=es-419&gl=CO&ceid=CO:es-419" target="_blank" rel="noopener">Abrir Google News</a>
    </article>
  `;
};

const loadGoogleEducationNews = async () => {
  if (!googleNewsList) return;

  const cacheKey = "jfk-google-news-cache";
  const today = getTodayKey();
  let cached = null;

  try {
    cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
  } catch (error) {
    localStorage.removeItem(cacheKey);
  }

  if (cached?.date === today && Array.isArray(cached.items)) {
    renderGoogleNews(cached.items);
    return;
  }

  const googleRss = "https://news.google.com/rss/search?q=educacion%20Colombia&hl=es-419&gl=CO&ceid=CO:es-419";
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(googleRss)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("No se pudo leer Google News.");

    const xmlText = await response.text();
    const xml = new DOMParser().parseFromString(xmlText, "application/xml");
    const items = Array.from(xml.querySelectorAll("item")).slice(0, 5).map((item) => ({
      title: item.querySelector("title")?.textContent || "Noticia educativa",
      link: item.querySelector("link")?.textContent || "https://news.google.com/",
      pubDate: item.querySelector("pubDate")?.textContent || "",
      isoDate: "",
      source: item.querySelector("source")?.textContent || ""
    })).map((item) => {
      const date = new Date(item.pubDate);
      return {
        ...item,
        isoDate: Number.isNaN(date.getTime()) ? "" : date.toISOString()
      };
    });

    if (!items.length) throw new Error("Google News no devolvio noticias.");

    localStorage.setItem(cacheKey, JSON.stringify({ date: today, items }));
    renderGoogleNews(items);
  } catch (error) {
    renderGoogleNewsError();
  }
};

loadGoogleEducationNews();

const lightbox = document.querySelector("#lightbox");
const lightboxCaption = document.querySelector(".lightbox-caption");
const lightboxClose = document.querySelector(".lightbox-close");

document.querySelectorAll("[data-lightbox]").forEach((item) => {
  item.addEventListener("click", () => {
    lightboxCaption.textContent = item.dataset.lightbox;
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

const loginForm = document.querySelector("#login-form");
const loginPanel = document.querySelector("#login-panel");
const dashboard = document.querySelector("#dashboard");
const logoutButton = document.querySelector("#logout-button");

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = loginForm.email.value.trim();
  const password = loginForm.password.value.trim();
  const status = loginForm.querySelector(".form-status");

  if (!email || !password) {
    status.textContent = "Ingresa correo y contrasena.";
    status.style.color = "var(--danger)";
    return;
  }

  loginPanel.classList.add("is-hidden");
  dashboard.classList.remove("is-hidden");
});

logoutButton?.addEventListener("click", () => {
  dashboard.classList.add("is-hidden");
  loginPanel.classList.remove("is-hidden");
  loginForm.reset();
});

document.querySelectorAll(".tab-button").forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;

    document.querySelectorAll(".tab-button").forEach((button) => {
      button.classList.toggle("is-active", button === tab);
    });

    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("is-hidden", panel.dataset.panel !== target);
    });
  });
});

/*
  Configuracion Anthropic:
  Reemplaza ANTHROPIC_API_KEY con tu clave.
  En produccion no expongas esta clave en el navegador; usa un backend proxy seguro.
*/
const ANTHROPIC_API_KEY = "REEMPLAZA_AQUI_TU_API_KEY";
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const chatMessages = document.querySelector("#chat-messages");

const systemPrompt = `Eres el asistente academico e informativo de la Institucion Educativa John F Kennedy - Sede El Cinco, ubicada en la Vereda El Cinco, Vegachi, Antioquia. Respondes en espanol claro y amable. Ayudas con dudas academicas, orientacion escolar, informacion institucional, horarios, matriculas, personero estudiantil 2025-2026 y contacto. Correo institucional: redes.johnfkennedy@gmail.com. Si no tienes un dato confirmado, dilo y sugiere contactar a la sede.`;
const chatHistory = [];

const addMessage = (text, type = "bot") => {
  const message = document.createElement("div");
  message.className = `message ${type}`;
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return message;
};

chatForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  chatHistory.push({ role: "user", content: text });
  chatInput.value = "";

  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY.includes("REEMPLAZA")) {
    addMessage("Configura tu API key de Anthropic en main.js para activar respuestas reales. Mientras tanto, puedo mostrarte la interfaz lista para conectar.", "bot");
    return;
  }

  const pending = addMessage("Pensando...", "bot");

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 700,
        system: systemPrompt,
        messages: chatHistory.slice(-10)
      })
    });

    if (!response.ok) {
      throw new Error("No se pudo conectar con Anthropic.");
    }

    const data = await response.json();
    const answer = data.content?.map((part) => part.text).join("\n").trim() || "No recibi una respuesta valida.";
    pending.textContent = answer;
    chatHistory.push({ role: "assistant", content: answer });
  } catch (error) {
    pending.textContent = "Hubo un problema al consultar la IA. Revisa la API key, CORS o usa un backend proxy.";
  }
});
