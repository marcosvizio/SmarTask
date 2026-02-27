const menuItems = document.querySelectorAll(".funciones, .soluciones, .guia");

menuItems.forEach(item => {
  item.addEventListener("click", (e) => {

    // Evita que el click burbujee
    e.stopPropagation();

    const dropdown = item.querySelector(".dropdown-menu");

    // Cerrar todos primero
    document.querySelectorAll(".dropdown-menu").forEach(menu => {
      if (menu !== dropdown) {
        menu.classList.remove("show");
      }
    });

    // Toggle del actual
    dropdown.classList.toggle("show");
  });
});

// Cerrar si se hace click fuera
document.addEventListener("click", () => {
  document.querySelectorAll(".dropdown-menu").forEach(menu => {
    menu.classList.remove("show");
  });
});