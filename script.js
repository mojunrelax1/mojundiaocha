// ====== Supabase 配置 ======
const SUPABASE_URL = "https://kmligkbqmvpmmdpvdvhn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbGlna2JxbXZwbW1kcHZkdmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMjM4NjQsImV4cCI6MjEwNjU5OTg2NH0.kV3PlSOT_OPJNmtyVX7c8kVI9ddQEJjEBEdOIFo9ZGA";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById("surveyForm");
const btn = document.getElementById("submitBtn");
const msg = document.getElementById("msg");
const progressBar = document.getElementById("progressBar");

const SUBMIT_FLAG = "mojun_survey_submitted";

// 已提交过则锁定
if (localStorage.getItem(SUBMIT_FLAG) === "1") {
  msg.textContent = "你已经提交过了，感谢参与 ❤️";
  msg.className = "msg ok";
  form.querySelectorAll("input, textarea, button").forEach(el => el.disabled = true);
  btn.textContent = "已提交";
}

// ====== 进度条 ======
function updateProgress() {
  const required = [
    form.querySelector("#name"),
    form.querySelector("#impression"),
    form.querySelector('input[name="rating"]:checked'),
    form.querySelector("#duration"),
    form.querySelector("#future"),
    form.querySelector('input[name="wish"]:checked')
  ];
  const filled = required.filter(el => {
    if (!el) return false;
    if (el.type === "radio") return el.checked;
    return el.value.trim() !== "";
  }).length;
  const percent = Math.round((filled / required.length) * 100);
  progressBar.style.width = percent + "%";
}

form.addEventListener("input", updateProgress);
form.addEventListener("change", updateProgress);
updateProgress();

// ====== 提交 ======
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";
  msg.className = "msg";

  const name = form.name.value.trim();
  const qq = form.qq.value.trim();
  const impression = form.impression.value.trim();
  const ratingEl = form.querySelector('input[name="rating"]:checked');
  let rating = ratingEl ? ratingEl.value : "";
  const ratingOther = form.ratingOther.value.trim();
  const duration = form.duration.value.trim();
  const future = form.future.value.trim();
  const wishEl = form.querySelector('input[name="wish"]:checked');
  const wish = wishEl ? wishEl.value : "";

  if (rating === "其他" && ratingOther) rating = "其他：" + ratingOther;

  if (!name) { msg.textContent = "请填写姓名"; msg.className = "msg err"; return; }
  if (!impression) { msg.textContent = "第 1 题请作答"; msg.className = "msg err"; return; }
  if (!rating) { msg.textContent = "第 2 题请选择"; msg.className = "msg err"; return; }
  if (rating === "其他" && !ratingOther) { msg.textContent = "第 2 题选了“其他”，请填写具体内容"; msg.className = "msg err"; return; }
  if (!duration) { msg.textContent = "第 3 题请作答"; msg.className = "msg err"; return; }
  if (!future) { msg.textContent = "第 4 题请作答"; msg.className = "msg err"; return; }
  if (!wish) { msg.textContent = "第 5 题请选择"; msg.className = "msg err"; return; }

  btn.disabled = true;
  btn.textContent = "提交中……";

  try {
    const { error } = await db
      .from("mojun_survey")
      .insert([{ name, qq, impression, rating, duration, future, wish }]);

    if (error) throw error;

    localStorage.setItem(SUBMIT_FLAG, "1");
    msg.textContent = "提交成功，感谢你的反馈！";
    msg.className = "msg ok";
    form.querySelectorAll("input, textarea, button").forEach(el => el.disabled = true);
    btn.textContent = "已提交";
    progressBar.style.width = "100%";
  } catch (err) {
    console.error(err);
    msg.textContent = "提交失败：" + (err.message || "请稍后再试");
    msg.className = "msg err";
    btn.disabled = false;
    btn.textContent = "提交问卷";
  }
});
