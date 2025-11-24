<template>
  <header>
    <nav>
      <div class="logo"  > เที่ยวไหนดี</div>
      <ul class="nav-links">
        <li><a href="#contact">เข้าสู่ระบบ</a></li>
      </ul>
    </nav>
  </header>
</template>

<style>

header {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.logo {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.nav-links {
  display: flex;
  gap: 30px;
  list-style: none;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #667eea;
}


</style>