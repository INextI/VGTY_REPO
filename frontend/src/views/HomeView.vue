<template>
  <div class="home-page">
    <img src="https://cchgeu.ru/upload/resize_cache/iblock/19c/5nzxpiukzw6wx11r2fira17rti9prvev/1200_1200_1/Fv2ykckoWd4.jpg" class="background" alt="">
    <div class="overlay"></div>
    <div class="content">
      <img class="hm-logo" src="https://cchgeu.ru/local/templates/vstu/img/vstu-logo.svg?v2" alt="">
      <h1>Электронная информационно-образовательная среда <strong>ВГТУ</strong></h1>
      <router-link to="/login" class="hm-button-link">Войти</router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style>
* {
    box-sizing: border-box;
}

html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    font-family: Arial, sans-serif;
}

.background {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(108, 110, 114, 0.35);
  z-index: 2;
}

.content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 900px;
  width: 90%;
  padding: 20px;
  color: #fff;
}

.hm-logo {
    height: 180px;
    margin-bottom: 80px;

    align-self: center;
    transform: translateY(-110px);

    filter: brightness(0) invert(1);
}

h1 {
    font-size: 2.8rem;
    font-weight: 700;
    line-height: 1.35;
    margin: 0 0 64px;
    max-width: 720px;

    text-shadow: 
        0 4px 16px rgba(0,0,0,0.35),
        0 6px 24px rgba(0,0,0,0.2);
    
}

/* button {
    padding: 18px 96px;
    border: none;
    border-radius: 22px;

    background: #6940EE;
    box-shadow: 0 12px 32px rgba(0,0,0,0.32);

    cursor: pointer;
    transition: background 0.2s ease, transform 0.15s ease;
}
button:hover {
    background: #4C2CB8;
    transform: translateY(-3px);
}

button a {
    color: #fff;
    text-decoration: none;
    font-size: 1.6rem;
    font-weight: 500;
    display: block;
}*/
.hm-button-link {
    padding: 18px 96px;
    border: none;
    border-radius: 22px;

    background: #6940EE;
    box-shadow: 0 12px 32px rgba(0,0,0,0.32);

    cursor: pointer;
    transition: background 0.2s ease, transform 0.15s ease;
}

.hm-button-link:hover {
    background: #4C2CB8;
    transform: translateY(-3px);
}

/* ===== Adaptive ===== */
@media (max-width: 1366px) {
    .hm-logo {
        height: 120px;
        transform: translateY(-90px);
        margin-bottom: 64px;
    }

    hm-h1 {
        font-size: 2.2rem;
        margin-bottom: 56px;
    }

    hm-button {
        padding: 16px 80px;
    }

    hm-button a {
        font-size: 1.4rem;
    }
}

@media (max-width: 1024px) {
    .hm-logo {
        height: 100px;
        transform: translateY(-70px);
        margin-bottom: 56px;
    }

    hm-h1 {
        font-size: 1.9rem;
        margin-bottom: 48px;
    }

    hm-button {
        padding: 14px 64px;
    }

    hm-button a {
        font-size: 1.25rem;
    }
}

@media (max-width: 768px) {
    .hm-logo {
        height: 80px;
        transform: translateY(-50px);
        margin-bottom: 48px;
    }

    hm-h1 {
        font-size: 1.6rem;
        margin-bottom: 40px;
    }

    hm-button {
        padding: 12px 52px;
    }

    hm-button a {
        font-size: 1.1rem;
    }
}

@media (max-width: 480px) {
    .hm-logo {
        height: 60px;
        transform: translateY(-40px);
        margin-bottom: 36px;
    }

    hm-h1 {
        font-size: 1.35rem;
        margin-bottom: 32px;
    }

    hm-button {
        padding: 10px 40px;
    }

    hm-button a {
        font-size: 1rem;
    }
}
</style>
