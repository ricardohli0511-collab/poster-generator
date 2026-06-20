const SESSION_COOKIE = "__poster_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;
const LOGIN_PATH = "/__auth/login";
const LOGOUT_PATH = "/__auth/logout";

async function hmacSign(secret, data) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacVerify(secret, data, expectedHex) {
  const actual = await hmacSign(secret, data);
  if (actual.length !== expectedHex.length) return false;
  let mismatch = 0;
  for (let i = 0; i < actual.length; i++) {
    mismatch |= actual.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  }
  return mismatch === 0;
}

function parseCookies(header) {
  const cookies = {};
  (header || "").split(";").forEach((pair) => {
    const [name, ...rest] = pair.trim().split("=");
    if (name) cookies[name.trim()] = rest.join("=").trim();
  });
  return cookies;
}

async function createSessionToken(username, secret) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = `${username}|${expires}`;
  const sig = await hmacSign(secret, payload);
  return `${payload}|${sig}`;
}

async function validateSessionToken(token, secret) {
  if (!token) return false;
  const parts = token.split("|");
  if (parts.length !== 3) return false;
  const [username, expiresStr, sig] = parts;
  const expires = parseInt(expiresStr, 10);
  if (isNaN(expires) || expires < Math.floor(Date.now() / 1000)) return false;
  return hmacVerify(secret, `${username}|${expiresStr}`, sig);
}

function getLoginPageHtml(errorMessage) {
  const errorBlock = errorMessage
    ? `<p style="color:#c43d45;background:rgba(196,61,69,0.1);padding:10px 16px;border-radius:10px;margin:0 0 16px;font-size:14px">${errorMessage}</p>`
    : "";
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>登录 - 海报生成器</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#020b24 0%,#071d5c 40%,#0a2a7a 70%,#041240 100%);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#ffffff}
.login-card{width:min(400px,calc(100% - 40px));padding:40px 36px;border-radius:24px;background:linear-gradient(180deg,rgba(12,52,138,0.7) 0%,rgba(4,26,74,0.85) 100%);border:1.5px solid rgba(212,169,78,0.3);box-shadow:0 24px 64px rgba(0,0,0,0.5)}
.login-card h1{text-align:center;font-size:28px;font-weight:800;background:linear-gradient(180deg,#fffbe6 0%,#e3c280 60%,#b68934 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px}
.login-card p.sub{text-align:center;color:rgba(255,255,255,0.6);font-size:14px;margin-bottom:28px}
label{display:block;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);margin-bottom:6px}
input{display:block;width:100%;padding:12px 16px;border-radius:12px;border:1.5px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;font-size:15px;outline:none;transition:border-color 0.2s}
input:focus{border-color:rgba(212,169,78,0.6)}
input::placeholder{color:rgba(255,255,255,0.3)}
.field{margin-bottom:18px}
button{display:block;width:100%;padding:14px;border:none;border-radius:14px;background:linear-gradient(135deg,#d4a94e 0%,#b68934 50%,#d4a94e 100%);color:#041240;font-size:16px;font-weight:800;letter-spacing:1px;cursor:pointer;transition:opacity 0.2s}
button:hover{opacity:0.9}
button:active{opacity:0.8}
</style>
</head>
<body>
<div class="login-card">
<h1>海报生成器</h1>
<p class="sub">请登录以继续使用</p>
${errorBlock}
<form method="POST" action="${LOGIN_PATH}">
<div class="field">
<label for="username">账号</label>
<input id="username" name="username" type="text" placeholder="请输入账号" required autocomplete="username">
</div>
<div class="field">
<label for="password">密码</label>
<input id="password" name="password" type="password" placeholder="请输入密码" required autocomplete="current-password">
</div>
<button type="submit">登 录</button>
</form>
</div>
</body>
</html>`;
}

function htmlResponse(html, status = 200, extraHeaders = {}) {
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html;charset=UTF-8", ...extraHeaders },
  });
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const authUsername = env.AUTH_USERNAME;
  const authPassword = env.AUTH_PASSWORD;
  const authSecret = env.AUTH_SECRET || "poster-tool-default-secret-change-me";

  if (!authUsername || !authPassword) {
    return next();
  }

  const url = new URL(request.url);

  if (url.pathname === LOGOUT_PATH) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  }

  if (url.pathname === LOGIN_PATH && request.method === "POST") {
    try {
      const formData = await request.formData();
      const username = (formData.get("username") || "").toString().trim();
      const password = (formData.get("password") || "").toString();

      if (username === authUsername && password === authPassword) {
        const token = await createSessionToken(username, authSecret);
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/",
            "Set-Cookie": `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
          },
        });
      }
      return htmlResponse(getLoginPageHtml("账号或密码错误，请重试。"), 401);
    } catch {
      return htmlResponse(getLoginPageHtml("登录请求处理失败，请重试。"), 500);
    }
  }

  const cookies = parseCookies(request.headers.get("Cookie"));
  const sessionToken = cookies[SESSION_COOKIE];
  const valid = await validateSessionToken(sessionToken, authSecret);

  if (valid) {
    return next();
  }

  return htmlResponse(getLoginPageHtml(""));
}
