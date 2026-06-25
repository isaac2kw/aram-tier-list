const STORAGE_KEY = "aram-tier-list-v3";
const PREVIOUS_STORAGE_KEY = "aram-tier-list-v2";
const LEGACY_STORAGE_KEY = "aram-tier-list-v1";
const BUILD_STORAGE_KEY = "aram-item-builds-v1";
const RIOT_REALM_URL = "https://ddragon.leagueoflegends.com/realms/kr.json";
const RIOT_CDN_ROOT = "https://ddragon.leagueoflegends.com/cdn";
const SUPABASE_URL = "https://gykwvysmezamqbwcwlqj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_x0t0SwIJP6R4HU48U_YVYA_UQQa4hJH";
const ADMIN_EMAIL = "isaac2kw@gmail.com";
const STATE_TABLE = "aram_tier_state";
const STATE_ROW_ID = 1;
const supabaseClient = globalThis.supabase?.createClient
  ? globalThis.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;
const ROLE_NAMES = ["원딜", "마법사(AP)", "전사", "탱커", "유틸"];
const BUILD_OPTIONS = {
  "원딜": [
    { name: "치명타", purpose: "평타 지속딜링" },
    { name: "방관", purpose: "포킹 / 누킹" },
    { name: "스킬", purpose: "포킹 / 스킬 지속딜링" }
  ],
  "마법사(AP)": [
    { name: "폭딜", purpose: "풀콤보 누킹" },
    { name: "지속딜링", purpose: "스킬 지속딜링" },
    { name: "포킹", purpose: "포킹 / 누킹" }
  ],
  "전사": [
    { name: "지속딜링", purpose: "어그로 / 지속딜링 / 이니시" },
    { name: "암살", purpose: "풀콤보 누킹" }
  ],
  "유틸": [
    { name: "유틸", purpose: "버프" },
    { name: "탱커", purpose: "탱킹 / 딜러 보호" },
    { name: "이니시", purpose: "어그로 / 딜러 보호" }
  ],
  "탱커": [
    { name: "전사", purpose: "탱킹 / 지속딜링" },
    { name: "이니시", purpose: "어그로 / 지속딜링" }
  ]
};

const initialTiers = [
  {
    tier: 0,
    color: "#ff5e63",
    champions: [
      "아트록스", "오로라", "브랜드", "갱플랭크", "흐웨이", "제이스", "진",
      "밀리오", "세나", "시비르", "소나", "스몰더", "제라스", "유미",
      "직스", "자이라", "바루스", "세라핀", "멜", "알리스타", "카르마",
      "모르가나", "노틸러스", "말자하", "럭스", "레오나"
    ]
  },
  {
    tier: 1,
    color: "#ff9f4a",
    champions: [
      "사미라", "쉔", "사이온", "나미", "카이사", "갈리오", "아크샨",
      "아리", "브라움", "잭스", "그라가스", "리산드라", "킨드레드", "아이번",
      "애니비아", "징크스", "마오카이", "니코", "뽀삐", "파이크", "오공",
      "자야", "제리", "제드", "빅토르", "트위치", "티모", "스웨인", "세트",
      "소라카", "오른", "라칸", "벡스", "유나라", "카타리나", "케넨",
      "그웬", "룰루", "미스 포츈", "블라디미르", "자크", "베이가", "질리언",
      "초가스", "말파이트", "카서스", "레나타 글라스크", "트런들", "케이틀린",
      "샤코", "비에고", "아지르", "모데카이저", "세주아니", "오리아나", "이즈리얼",
      "벨코즈", "코그모"
    ]
  },
  {
    tier: 2,
    color: "#ffd35b",
    champions: [
      "자르반 4세", "잔나", "그레이브즈", "피즈", "드레이븐", "아펠리오스", "아칼리",
      "아무무", "피오라", "에코", "카시오페아", "케일", "카직스", "카사딘",
      "나르", "가렌", "신 짜오", "요네", "조이", "베인", "탈리야",
      "스카너", "사일러스", "라이즈", "타릭", "루시안", "마스터 이", "아우렐리온 솔",
      "카밀", "자헨", "애니", "쓰레쉬", "문도 박사", "다이애나", "코르키",
      "트리스타나", "키아나", "람머스", "녹턴", "다리우스", "탐 켄치",
      "신드라", "신지드"
    ]
  },
  {
    tier: 3,
    color: "#7edb81",
    champions: [
      "리븐", "벨베스", "엘리스", "피들스틱", "헤카림", "하이머딩거",
      "일라오이", "크산테", "클레드", "르블랑", "릴리아", "나피리", "나서스",
      "트위스티드 페이트", "우르곳", "렐", "판테온", "니달리", "레넥톤",
      "야스오", "럼블", "바이", "볼리베어", "트린다미어", "이렐리아", "암베사",
      "케인"
    ]
  },
  {
    tier: 4,
    color: "#60b8ff",
    champions: [
      "워윅", "애쉬", "브라이어", "바드", "블리츠크랭크", "칼리스타", "리 신",
      "누누와 윌럼프", "퀸", "탈론", "닐라", "올라프", "렉사이", "우디르",
      "요릭", "이블린", "렝가", "쉬바나"
    ]
  },
  {
    tier: 5,
    color: "#a78bfa",
    champions: []
  }
];

const board = document.querySelector("#tierBoard");
const template = document.querySelector("#championTemplate");
const resetButton = document.querySelector("#resetButton");
const undoButton = document.querySelector("#undoButton");
const redoButton = document.querySelector("#redoButton");
const statsDialog = document.querySelector("#statsDialog");
const closeStatsButton = document.querySelector("#closeStatsButton");
const searchInput = document.querySelector("#championSearchInput");
const searchResults = document.querySelector("#championSearchResults");
const clearSearchButton = document.querySelector("#clearSearchButton");
const connectionStatus = document.querySelector("#connectionStatus");
const adminButton = document.querySelector("#adminButton");
const loginDialog = document.querySelector("#loginDialog");
const loginForm = document.querySelector("#loginForm");
const closeLoginButton = document.querySelector("#closeLoginButton");
const adminEmailInput = document.querySelector("#adminEmailInput");
const adminPasswordInput = document.querySelector("#adminPasswordInput");
const loginMessage = document.querySelector("#loginMessage");

let tiers = [];
let championMetadata = new Map();
let dataDragonVersion = "";
let draggedCard = null;
let dragStartState = null;
let undoStack = [];
let redoStack = [];
let itemBuildSelections = loadBuildSelections();
let activeBuildChampion = "";
let activeBuildRole = "";
let activeSearchName = "";
let currentSession = null;
let isAdmin = false;
let realtimeChannel = null;
let serverStateLoaded = false;
let saveInProgress = false;

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function emptyRoles() {
  return Object.fromEntries(ROLE_NAMES.map((role) => [role, []]));
}

function loadBuildSelections() {
  try {
    return JSON.parse(localStorage.getItem(BUILD_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveBuildSelections() {
  localStorage.setItem(BUILD_STORAGE_KEY, JSON.stringify(itemBuildSelections));
  persistServerState();
}

function classifyChampion(champion) {
  if (!champion) return "전사";
  const tags = champion.tags || [];
  if (tags.includes("Support")) return "유틸";
  if (tags.includes("Marksman")) return "원딜";
  if (tags[0] === "Tank" || (tags.includes("Tank") && !tags.includes("Mage"))) return "탱커";
  if (tags.includes("Mage")) return "마법사(AP)";
  return "전사";
}

function makeInitialState() {
  return initialTiers.map((tierData) => {
    const roles = emptyRoles();
    tierData.champions.forEach((name) => {
      roles[classifyChampion(championMetadata.get(name))].push(name);
    });
    return { tier: tierData.tier, color: tierData.color, roles };
  });
}

function isValidSavedState(value) {
  return Array.isArray(value)
    && value.length === 6
    && value.every((tierData) =>
      tierData
      && ROLE_NAMES.every((role) => Array.isArray(tierData.roles?.[role]))
    );
}

function loadSavedState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (isValidSavedState(saved)) return saved;

    const previous = JSON.parse(localStorage.getItem(PREVIOUS_STORAGE_KEY));
    if (Array.isArray(previous) && previous.length === 6) {
      const migrated = previous.map((tierData, index) => ({
        tier: tierData.tier,
        color: tierData.color || initialTiers[index].color,
        roles: {
          "원딜": tierData.roles?.AD || [],
          "마법사(AP)": tierData.roles?.AP || [],
          "전사": tierData.roles?.["전사"] || [],
          "탱커": tierData.roles?.["탱커"] || [],
          "유틸": tierData.roles?.["유틸"] || []
        }
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }

    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
    if (Array.isArray(legacy) && legacy.length === 6) {
      const migrated = legacy.map((tierData, index) => {
        const roles = emptyRoles();
        (tierData.champions || []).forEach((name) => {
          roles[classifyChampion(championMetadata.get(name))].push(name);
        });
        return {
          tier: Number.isInteger(tierData.tier) ? tierData.tier : index,
          color: initialTiers[index].color,
          roles
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tiers));
  persistServerState();
}

function stateString() {
  return JSON.stringify(tiers);
}

function updateHistoryButtons() {
  undoButton.disabled = !isAdmin || undoStack.length === 0;
  redoButton.disabled = !isAdmin || redoStack.length === 0;
  resetButton.disabled = !isAdmin;
}

function setConnectionStatus(text, state = "") {
  connectionStatus.textContent = text;
  connectionStatus.dataset.state = state;
}

function updateAdminUi() {
  document.body.classList.toggle("admin-mode", isAdmin);
  adminButton.textContent = isAdmin ? "로그아웃" : "관리자 로그인";
  adminButton.classList.toggle("logged-in", isAdmin);
  document.querySelectorAll(".champion-card").forEach((card) => {
    card.draggable = isAdmin;
    card.classList.toggle("read-only", !isAdmin);
  });
  updateHistoryButtons();
}

function validServerTierData(value) {
  return isValidSavedState(value);
}

async function loadServerState() {
  if (!supabaseClient) {
    setConnectionStatus("연결 모듈 오류", "error");
    return false;
  }
  setConnectionStatus("데이터 불러오는 중", "loading");
  const { data, error } = await supabaseClient
    .from(STATE_TABLE)
    .select("tier_data, build_data, updated_at")
    .eq("id", STATE_ROW_ID)
    .single();

  if (error) {
    console.error("Supabase 데이터 조회 실패:", error);
    setConnectionStatus("연결 오류", "error");
    return false;
  }

  if (validServerTierData(data.tier_data)) {
    tiers = deepClone(data.tier_data);
  } else if (isAdmin) {
    await persistServerState(true);
  }

  if (data.build_data && typeof data.build_data === "object") {
    itemBuildSelections = deepClone(data.build_data);
    localStorage.setItem(BUILD_STORAGE_KEY, JSON.stringify(itemBuildSelections));
  }

  serverStateLoaded = true;
  setConnectionStatus("실시간 연결", "online");
  renderBoard();
  return true;
}

async function persistServerState(force = false) {
  if (!supabaseClient) return;
  if ((!isAdmin || !serverStateLoaded || saveInProgress) && !force) return;
  saveInProgress = true;
  setConnectionStatus("저장 중", "saving");

  const { error } = await supabaseClient
    .from(STATE_TABLE)
    .update({
      tier_data: tiers,
      build_data: itemBuildSelections,
      updated_at: new Date().toISOString()
    })
    .eq("id", STATE_ROW_ID);

  saveInProgress = false;
  if (error) {
    console.error("Supabase 저장 실패:", error);
    setConnectionStatus("저장 실패", "error");
    return;
  }
  setConnectionStatus("저장 완료", "online");
}

function applyRealtimeState(row) {
  if (!row) return;
  if (validServerTierData(row.tier_data)) {
    tiers = deepClone(row.tier_data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tiers));
  }
  if (row.build_data && typeof row.build_data === "object") {
    itemBuildSelections = deepClone(row.build_data);
    localStorage.setItem(BUILD_STORAGE_KEY, JSON.stringify(itemBuildSelections));
  }
  setConnectionStatus("실시간 연결", "online");
  renderBoard();
}

function subscribeToRealtime() {
  if (!supabaseClient) return;
  if (realtimeChannel) supabaseClient.removeChannel(realtimeChannel);
  realtimeChannel = supabaseClient
    .channel("aram-tier-state-live")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: STATE_TABLE,
        filter: `id=eq.${STATE_ROW_ID}`
      },
      (payload) => applyRealtimeState(payload.new)
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") setConnectionStatus("실시간 연결", "online");
      if (status === "CHANNEL_ERROR") setConnectionStatus("실시간 연결 오류", "error");
    });
}

async function updateSession(session) {
  currentSession = session;
  isAdmin = session?.user?.email?.toLocaleLowerCase() === ADMIN_EMAIL.toLocaleLowerCase();
  updateAdminUi();
  if (isAdmin && !serverStateLoaded) await loadServerState();
}

function allChampionLocations() {
  const locations = [];
  tiers.forEach((tierData) => {
    ROLE_NAMES.forEach((role) => {
      tierData.roles[role].forEach((name) => {
        locations.push({ name, tier: tierData.tier, role });
      });
    });
  });
  return locations;
}

function normalizeSearchText(value) {
  return value.trim().toLocaleLowerCase("ko-KR").replace(/\s+/g, "");
}

function findSearchMatches(query) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];
  return allChampionLocations()
    .filter((item) => normalizeSearchText(item.name).includes(normalized))
    .slice(0, 8);
}

function renderSearchResults(query) {
  const matches = findSearchMatches(query);
  searchResults.replaceChildren();

  if (!query.trim()) {
    searchResults.hidden = true;
    clearSearchHighlight();
    return;
  }

  searchResults.hidden = false;
  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "search-empty";
    empty.textContent = "검색 결과가 없습니다.";
    searchResults.append(empty);
    applySearchDimming([]);
    return;
  }

  matches.forEach((match) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result";
    button.setAttribute("role", "option");
    button.innerHTML = `
      <strong>${match.name}</strong>
      <span>${match.tier}티어 · ${match.role}</span>
    `;
    button.addEventListener("click", () => selectSearchResult(match.name));
    searchResults.append(button);
  });

  applySearchDimming(matches.map((match) => match.name));
}

function selectSearchResult(name) {
  activeSearchName = name;
  searchInput.value = name;
  searchResults.hidden = true;
  applySearchDimming([name]);

  const card = [...document.querySelectorAll(".champion-card")]
    .find((item) => item.dataset.name === name);
  if (!card) return;
  card.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  card.classList.remove("search-pulse");
  requestAnimationFrame(() => card.classList.add("search-pulse"));
}

function applySearchDimming(highlightNames) {
  const hasQuery = searchInput.value.trim().length > 0;
  const matchedNames = new Set(highlightNames);
  document.querySelectorAll(".champion-card").forEach((card) => {
    const matched = matchedNames.has(card.dataset.name);
    card.classList.toggle("search-match", Boolean(matched));
    card.classList.toggle("search-dimmed", hasQuery && !matched);
  });
}

function clearSearchHighlight() {
  activeSearchName = "";
  document.querySelectorAll(".champion-card").forEach((card) => {
    card.classList.remove("search-match", "search-dimmed", "search-pulse");
  });
}

function clearSearch() {
  searchInput.value = "";
  searchResults.hidden = true;
  clearSearchHighlight();
  searchInput.focus();
}

async function loadChampionMetadata() {
  try {
    const realmResponse = await fetch(RIOT_REALM_URL);
    if (!realmResponse.ok) throw new Error("한국 서버 버전 정보를 불러오지 못했습니다.");
    const realm = await realmResponse.json();
    dataDragonVersion = realm.n?.champion || realm.v;

    const dataResponse = await fetch(
      `${RIOT_CDN_ROOT}/${dataDragonVersion}/data/ko_KR/champion.json`
    );
    if (!dataResponse.ok) throw new Error("한국어 챔피언 정보를 불러오지 못했습니다.");
    const championData = await dataResponse.json();
    championMetadata = new Map(
      Object.values(championData.data).map((champion) => [champion.name, champion])
    );
  } catch (error) {
    console.warn("라이엇 공식 챔피언 데이터 로딩 실패:", error);
    championMetadata = new Map();
  }
}

function imageUrlFor(champion) {
  if (!champion || !dataDragonVersion) return "";
  return `${RIOT_CDN_ROOT}/${dataDragonVersion}/img/champion/${champion.image.full}`;
}

function renderBoard() {
  board.replaceChildren();

  tiers.forEach((tierData) => {
    const row = document.createElement("section");
    row.className = "tier-row";
    row.style.setProperty("--tier-color", tierData.color);
    row.dataset.tier = String(tierData.tier);

    const total = ROLE_NAMES.reduce((sum, role) => sum + tierData.roles[role].length, 0);
    const label = document.createElement("header");
    label.className = "tier-label";
    label.innerHTML = `
      <span class="tier-number">${tierData.tier}</span>
      <span class="tier-word">티어</span>
      <span class="tier-count">${total}명</span>
    `;

    const roleColumns = document.createElement("div");
    roleColumns.className = "role-columns";

    ROLE_NAMES.forEach((role) => {
      const column = document.createElement("section");
      column.className = "role-column";

      const heading = document.createElement("header");
      heading.className = "role-heading";
    heading.innerHTML = `<strong>${role}</strong><span>${tierData.roles[role].length}</span>`;

      const list = document.createElement("div");
      list.className = "champion-list";
      list.dataset.tier = String(tierData.tier);
      list.dataset.role = role;
      tierData.roles[role].forEach((name) => list.append(createChampionCard(name)));
      registerDropZone(list);

      column.append(heading, list);
      roleColumns.append(column);
    });

    row.append(label, roleColumns);
    board.append(row);
  });

  updateHistoryButtons();
  updateAdminUi();
  if (activeSearchName) applySearchDimming([activeSearchName]);
}

function createChampionCard(name) {
  const card = template.content.firstElementChild.cloneNode(true);
  const champion = championMetadata.get(name);
  const imageUrl = imageUrlFor(champion);
  const image = card.querySelector(".champion-image");

  card.dataset.name = name;
  card.querySelector(".champion-name").textContent = name;
  card.setAttribute("aria-label", `${name} 챔피언 카드`);
  card.draggable = isAdmin;
  card.classList.toggle("read-only", !isAdmin);
  image.alt = `${name} 공식 챔피언 이미지`;

  if (imageUrl) {
    image.addEventListener("load", () => image.classList.add("loaded"), { once: true });
    image.addEventListener("error", () => image.removeAttribute("src"), { once: true });
    image.src = imageUrl;
  }

  card.querySelector(".portrait-placeholder").addEventListener("dblclick", (event) => {
    event.preventDefault();
    const role = card.closest(".champion-list")?.dataset.role || classifyChampion(champion);
    showItemBuild(name, role);
  });

  card.addEventListener("dragstart", (event) => {
    if (!isAdmin) {
      event.preventDefault();
      return;
    }
    draggedCard = card;
    dragStartState = stateString();
    card.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", name);
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
    document.querySelectorAll(".drag-over").forEach((zone) => zone.classList.remove("drag-over"));
    syncStateFromDom();

    if (dragStartState && dragStartState !== stateString()) {
      undoStack.push(JSON.parse(dragStartState));
      redoStack = [];
    }

    dragStartState = null;
    draggedCard = null;
    saveState();
    renderBoard();
  });

  return card;
}

function registerDropZone(list) {
  list.addEventListener("dragover", (event) => {
    if (!isAdmin) return;
    event.preventDefault();
    if (!draggedCard) return;
    list.classList.add("drag-over");
    const insertBefore = getInsertionTarget(list, event.clientX, event.clientY);
    list.insertBefore(draggedCard, insertBefore);
  });

  list.addEventListener("dragleave", (event) => {
    if (!list.contains(event.relatedTarget)) list.classList.remove("drag-over");
  });

  list.addEventListener("drop", (event) => {
    event.preventDefault();
    list.classList.remove("drag-over");
  });
}

function getInsertionTarget(container, pointerX, pointerY) {
  const cards = [...container.querySelectorAll(".champion-card:not(.dragging)")];
  if (!cards.length) return null;

  let closest = { distance: Number.POSITIVE_INFINITY, element: null };
  cards.forEach((card) => {
    const box = card.getBoundingClientRect();
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;
    const verticalWeight = Math.abs(pointerY - centerY) * 3;
    const horizontalDistance = pointerX - centerX;
    const distance = verticalWeight + Math.abs(horizontalDistance);

    if (distance < closest.distance) {
      closest = {
        distance,
        element: horizontalDistance < 0 ? card : card.nextElementSibling
      };
    }
  });
  return closest.element;
}

function syncStateFromDom() {
  tiers = [...document.querySelectorAll(".tier-row")].map((row) => {
    const tierNumber = Number(row.dataset.tier);
    const original = initialTiers.find((item) => item.tier === tierNumber);
    const roles = emptyRoles();

    row.querySelectorAll(".champion-list").forEach((list) => {
      roles[list.dataset.role] = [...list.querySelectorAll(".champion-card")]
        .map((card) => card.dataset.name);
    });

    return { tier: tierNumber, color: original.color, roles };
  });
}

function restoreState(nextState) {
  tiers = deepClone(nextState);
  saveState();
  renderBoard();
}

function showItemBuild(name, role) {
  const champion = championMetadata.get(name);
  if (!champion) {
    window.alert("챔피언 정보를 불러오지 못했습니다. 인터넷 연결을 확인해 주십시오.");
    return;
  }

  activeBuildChampion = name;
  activeBuildRole = role;
  document.querySelector("#statsChampionName").textContent = champion.name;
  document.querySelector("#statsChampionTags").textContent = role;

  const dialogImage = document.querySelector("#statsChampionImage");
  dialogImage.src = imageUrlFor(champion);
  dialogImage.alt = `${champion.name} 공식 챔피언 이미지`;

  const statsGrid = document.querySelector("#statsGrid");
  statsGrid.replaceChildren();
  const selected = new Set(itemBuildSelections[name] || []);
  (BUILD_OPTIONS[role] || BUILD_OPTIONS["전사"]).forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "build-option";
    button.disabled = !isAdmin;
    button.title = isAdmin ? "눌러서 선택 또는 해제" : "관리자만 변경할 수 있습니다.";
    button.dataset.build = option.name;
    button.setAttribute("aria-pressed", String(selected.has(option.name)));
    button.classList.toggle("selected", selected.has(option.name));
    button.innerHTML = `
      <span class="build-check" aria-hidden="true">✓</span>
      <strong>${option.name}</strong>
      <span>${option.purpose}</span>
    `;
    button.addEventListener("click", () => toggleBuildOption(button));
    statsGrid.append(button);
  });

  statsDialog.showModal();
}

function toggleBuildOption(button) {
  if (!isAdmin) return;
  const selected = new Set(itemBuildSelections[activeBuildChampion] || []);
  const buildName = button.dataset.build;
  if (selected.has(buildName)) selected.delete(buildName);
  else selected.add(buildName);

  itemBuildSelections[activeBuildChampion] = [...selected];
  saveBuildSelections();
  button.classList.toggle("selected", selected.has(buildName));
  button.setAttribute("aria-pressed", String(selected.has(buildName)));
}

undoButton.addEventListener("click", () => {
  if (!isAdmin) return;
  if (!undoStack.length) return;
  redoStack.push(deepClone(tiers));
  restoreState(undoStack.pop());
});

redoButton.addEventListener("click", () => {
  if (!isAdmin) return;
  if (!redoStack.length) return;
  undoStack.push(deepClone(tiers));
  restoreState(redoStack.pop());
});

resetButton.addEventListener("click", () => {
  if (!isAdmin) return;
  if (!window.confirm("모든 티어, 역할, 순서를 초기화하시겠습니까?")) return;
  undoStack.push(deepClone(tiers));
  redoStack = [];
  restoreState(makeInitialState());
});

closeStatsButton.addEventListener("click", () => statsDialog.close());
statsDialog.addEventListener("click", (event) => {
  if (event.target === statsDialog) statsDialog.close();
});

searchInput.addEventListener("input", () => {
  activeSearchName = "";
  renderSearchResults(searchInput.value);
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearSearch();
    return;
  }
  if (event.key !== "Enter") return;
  const matches = findSearchMatches(searchInput.value);
  if (matches.length) selectSearchResult(matches[0].name);
});

searchInput.addEventListener("focus", () => {
  if (searchInput.value.trim()) renderSearchResults(searchInput.value);
});

clearSearchButton.addEventListener("click", clearSearch);

document.addEventListener("click", (event) => {
  if (!event.target.closest(".champion-search")) searchResults.hidden = true;
});

adminButton.addEventListener("click", async () => {
  if (!supabaseClient) {
    window.alert("Supabase 연결 모듈을 불러오지 못했습니다. 새로고침 후 다시 시도해 주십시오.");
    return;
  }
  if (isAdmin) {
    await supabaseClient.auth.signOut();
    return;
  }
  adminEmailInput.value = ADMIN_EMAIL;
  adminPasswordInput.value = "";
  loginMessage.textContent = "";
  loginDialog.showModal();
  adminPasswordInput.focus();
});

closeLoginButton.addEventListener("click", () => loginDialog.close());

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "로그인 확인 중";
  const { error } = await supabaseClient.auth.signInWithPassword({
    email: adminEmailInput.value.trim(),
    password: adminPasswordInput.value
  });

  if (error) {
    loginMessage.textContent = "이메일 또는 비밀번호를 확인해 주십시오.";
    return;
  }
  adminPasswordInput.value = "";
  loginDialog.close();
});

async function initialize() {
  await loadChampionMetadata();
  tiers = loadSavedState() || makeInitialState();
  renderBoard();
  if (!supabaseClient) {
    setConnectionStatus("연결 모듈 오류", "error");
    return;
  }
  const { data } = await supabaseClient.auth.getSession();
  await updateSession(data.session);
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    setTimeout(() => updateSession(session), 0);
  });
  if (!serverStateLoaded) await loadServerState();
  subscribeToRealtime();
}

initialize();
