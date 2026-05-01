// 여기에 Apps Script 웹앱 URL을 넣으세요.
// 예: https://script.google.com/macros/s/AKfycbxxxxxx/exec
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwcQrhgmY2N-rN1bVuBK2qkq0jwZHArw6mLHAhIaonorB2tYjIqunghCTR4vV3ToYQY/exec";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

function $(id) {
  return document.getElementById(id);
}

function show(id, msg) {
  const el = $(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
}

function getFormData() {
  return {
    action: "apply",
    store: $("store").value,
    name: $("name").value.trim(),
    phone: $("phone").value.trim(),
    leaveType: $("leaveType").value,
    startDate: $("startDate").value,
    endDate: $("endDate").value,
    days: Number($("days").value),
    reason: $("reason").value.trim()
  };
}

async function postNoCors(data) {
  await fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(data)
  });
}

async function submitLeave() {
  const data = getFormData();

  if (!data.name) return show("result", "이름을 입력하세요.");
  if (!data.phone) return show("result", "연락처를 입력하세요.");
  if (!data.leaveType) return show("result", "휴가 종류를 선택하세요.");
  if (!data.startDate || !data.endDate) return show("result", "날짜를 선택하세요.");
  if (!data.days || data.days <= 0) return show("result", "사용일수를 입력하세요.");

  try {
    await postNoCors(data);
    show("result", "신청이 접수되었습니다. 관리자 승인 후 반영됩니다.");
    ["leaveType", "startDate", "endDate", "days", "reason"].forEach(id => {
      if ($(id)) $(id).value = "";
    });
  } catch (e) {
    show("result", "전송 중 오류가 발생했습니다.");
  }
}

function jsonp(params) {
  return new Promise((resolve, reject) => {
    const callback = "cb_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
    window[callback] = (data) => {
      resolve(data);
      delete window[callback];
      script.remove();
    };

    const query = new URLSearchParams({ ...params, callback });
    const script = document.createElement("script");
    script.src = SCRIPT_URL + "?" + query.toString();
    script.onerror = () => reject(new Error("불러오기 실패"));
    document.body.appendChild(script);
  });
}

async function checkBalance() {
  const name = $("name").value.trim();
  const phone = $("phone").value.trim();

  if (!name || !phone) return show("result", "이름과 연락처를 입력한 뒤 조회하세요.");

  try {
    const data = await jsonp({ action: "balance", name, phone });
    if (!data.ok) return show("result", data.message || "조회 실패");

    const b = data.balance;
    show("result", `기본연차 ${b.base}일 / 사용 ${b.used}일 / 잔여 ${b.remain}일`);
  } catch (e) {
    show("result", "잔여 연차 조회 중 오류가 발생했습니다.");
  }
}

async function loadMyRequests() {
  const name = $("name").value.trim();
  const phone = $("phone").value.trim();
  const list = $("myList");

  if (!name || !phone) return show("result", "이름과 연락처를 입력한 뒤 조회하세요.");

  list.innerHTML = "";

  try {
    const data = await jsonp({ action: "my", name, phone });
    if (!data.ok) {
      list.innerHTML = `<div class="item">${data.message || "조회 실패"}</div>`;
      return;
    }

    if (!data.rows.length) {
      list.innerHTML = `<div class="item">신청 내역이 없습니다.</div>`;
      return;
    }

    list.innerHTML = data.rows.map(renderItem).join("");
  } catch (e) {
    list.innerHTML = `<div class="item">조회 중 오류가 발생했습니다.</div>`;
  }
}

function statusBadge(status) {
  if (status === "승인") return `<span class="badge ok">승인</span>`;
  if (status === "반려") return `<span class="badge no">반려</span>`;
  return `<span class="badge wait">대기</span>`;
}

function renderItem(r) {
  return `
    <div class="item">
      <div class="item-title">${r["휴가종류"]} ${statusBadge(r["상태"])}</div>
      <div class="item-meta">
        신청자: ${r["이름"]}<br>
        기간: ${r["시작일"]} ~ ${r["종료일"]}<br>
        사용일수: ${r["사용일수"]}일<br>
        사유: ${r["사유"] || "-"}<br>
        관리자메모: ${r["관리자메모"] || "-"}
      </div>
    </div>
  `;
}

async function loadAdminList() {
  const password = $("password").value.trim();
  const list = $("adminList");
  const result = $("adminResult");

  if (!password) return show("adminResult", "관리자 비밀번호를 입력하세요.");

  list.innerHTML = "";

  try {
    const data = await jsonp({ action: "list", password });
    if (!data.ok) {
      show("adminResult", data.message || "조회 실패");
      return;
    }

    result.classList.remove("show");
    if (!data.rows.length) {
      list.innerHTML = `<div class="item">신청 내역이 없습니다.</div>`;
      return;
    }

    list.innerHTML = data.rows.map(renderAdminItem).join("");
  } catch (e) {
    show("adminResult", "신청 목록 조회 중 오류가 발생했습니다.");
  }
}

function renderAdminItem(r) {
  const disabled = r["상태"] !== "대기" ? "style='display:none'" : "";
  return `
    <div class="item">
      <div class="item-title">${r["이름"]} / ${r["휴가종류"]} ${statusBadge(r["상태"])}</div>
      <div class="item-meta">
        매장: ${r["매장"]}<br>
        연락처: ${r["연락처"]}<br>
        기간: ${r["시작일"]} ~ ${r["종료일"]}<br>
        사용일수: ${r["사용일수"]}일<br>
        사유: ${r["사유"] || "-"}<br>
        신청일시: ${r["신청일시"] || "-"}
      </div>
      <div class="admin-actions" ${disabled}>
        <button class="primary" onclick="processRequest('${r["ID"]}', 'approve')">승인</button>
        <button class="reject" onclick="processRequest('${r["ID"]}', 'reject')">반려</button>
      </div>
    </div>
  `;
}

async function processRequest(id, action) {
  const password = $("password").value.trim();
  const memo = prompt(action === "approve" ? "승인 메모를 입력하세요." : "반려 사유를 입력하세요.") || "";

  try {
    await postNoCors({
      action,
      id,
      password,
      adminMemo: memo
    });

    show("adminResult", "처리되었습니다. 잠시 후 목록을 다시 불러오세요.");
    setTimeout(loadAdminList, 800);
  } catch (e) {
    show("adminResult", "처리 중 오류가 발생했습니다.");
  }
}
