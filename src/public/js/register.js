import { register, setToken } from '/js/api.js';

const form = document.querySelector('form');
const msg  = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const first_name = form.first_name.value.trim();
  const last_name = form.last_name.value.trim();
  const birthday = form.birthday.value;
  const email = form.email.value.trim().toLowerCase();
  const phone_number = form.phone_number.value;
  const password = form.password.value;

  try {
    const data = await register(first_name, last_name, birthday, email, phone_number, password);
    setToken(data.token);
    location.href = '/home';
  } catch (err) {
    msg.textContent = err;
  }
});