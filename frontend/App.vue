<template>
  <router-view />
</template>

<script setup>
</script>

<style>
/* global.css */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* ===== Reset ===== */
* {
    box-sizing: border-box;
}

body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: "Montserrat", Arial, sans-serif;
}

/* ===== CSS Variables ===== */
:root {
    --primary: #6940EE;
    --primary-hover: #4C2CB8;
    --success: #14C856;
    --danger: #FF4625;

    --bg-main: #FAFAFC;
    --bg-card: #FFFFFF;
    --bg-dark: #1D1D1D;
    --border-soft: #F5F5F5;

    --text-main: #1D1D1D;
    --text-muted: #6F6F7A;

    --radius-lg: 20px;
    --radius-md: 16px;

    --shadow-soft: 0 6px 24px rgba(0,0,0,0.08);
    --shadow-hover: 0 12px 36px rgba(105,64,238,0.18);
}

/* ===== Typography ===== */
a {
    text-decoration: none;
    color: var(--primary);
}

/* ===== Images ===== */
img {
    display: block;
    max-width: 100%;
}

/* ===== Header ===== */
header {
    background: #fff;
    border-bottom: 1px solid var(--border-soft);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.header-container {
    max-width: 1180px;
    margin: 0 auto;
    padding: 14px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left,
.header-right {
    display: flex;
    align-items: center;
}

.logo {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.logo img {
    filter: brightness(0) invert(1);
    width: 80%;
    height: 80%;
    object-fit: contain;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 14px;
}

.icon {
    background: none;
    border: none;
    font-size: 18px;
    color: var(--text-muted);
    cursor: pointer;
    transition: color 0.2s, transform 0.15s;
}

.icon:hover {
    color: var(--primary);
    transform: translateY(-1px);
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--border-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
}

/* ===== Background ===== */
.background {
    background:
        linear-gradient(to right, rgba(105,64,238,0.25), rgba(255,255,255,0.35)),
        url('https://cchgeu.ru/upload/resize_cache/iblock/19c/5nzxpiukzw6wx11r2fira17rti9prvev/1200_1200_1/Fv2ykckoWd4.jpg')
        center / cover no-repeat;
    position: fixed;
    inset: 0;
    z-index: -1;
}

/* ===== Container ===== */
.container {
    max-width: 1180px;
    margin: 0 auto;
    padding: 36px 32px 48px;
}

/* ===== Dashboard ===== */
.dashboard {
    background: var(--bg-card);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-soft);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: var(--shadow-soft);
}

/* ===== Forms ===== */
.input-group {
    display: flex;
    align-items: center;
    border-radius: 14px;
    background: #f4f5f8;
    padding: 0 14px;
    margin-bottom: 18px;
    transition: box-shadow 0.2s, background 0.2s;
}

.input-group:focus-within {
    background: #fff;
    box-shadow: 0 0 0 2px rgba(105,64,238,0.35);
}

.input-group input {
    border: none;
    outline: none;
    padding: 15px 6px;
    font-size: 16px;
    flex: 1;
    background: none;
}

.input-icon {
    font-size: 18px;
    color: #a5a5a5;
    cursor: pointer;
}

/* ===== Buttons ===== */
button[type="submit"] {
    background: #6940EE;
    border: none;
    border-radius: 18px;
    padding: 14px 0;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 8px 22px rgba(105,64,238,0.35);
}

button[type="submit"]:hover {
    background: #4C2CB8;
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(105,64,238,0.45);
}

button[type="submit"] a {
    color: #fff;
    text-decoration: none;
    display: block;
}

/* ===== Footer ===== */
footer {
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    background: #232A3F;
    color: #ffd374;
    padding: 18px 16px;
}

.footer-content {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 18px;
}

.footer-logo {
    width: 40px;
}

.footer-text {
    font-size: 14px;
    line-height: 1.3;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-align: center;
}

.footer-icons span {
    background: #39405b;
    padding: 9px 14px;
    border-radius: 10px;
    font-size: 18px;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.15s;
}

.footer-icons span:hover {
    background: #4C2CB8;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(76,44,184,0.45);
}

/* ===== Adaptive ===== */
@media (max-width: 900px) {
    .container {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 600px) {
    .container {
        padding: 24px 5vw 40px;
    }

    .header-right span {
        display: none;
    }

    .courses-overview-header {
        flex-direction: column;
        align-items: stretch;
    }
}

@media (max-width: 480px) {
    .login-box {
        min-width: 100%;
        padding: 36px 28px;
        border-radius: 22px;
    }

    .logo {
        width: 64px;
    }

    button[type="submit"] {
        font-size: 16px;
    }

    .footer-text {
        font-size: 13px;
    }
}

</style>

