document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const profileImageInput = document.getElementById('profileImage');
  const togglePasswordBtn = document.getElementById('togglePassword');

  togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const file = profileImageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function() {
        const userData = {
          firstName: firstNameInput.value,
          lastName: lastNameInput.value,
          email: emailInput.value,
          password: passwordInput.value,
          profileImage: reader.result
        };
        console.log(userData,"user data")
        localStorage.setItem('userData', JSON.stringify(userData));
        alert('Data saved to localStorage!');
        form.reset();
      };
      reader.readAsDataURL(file);
    } else {
      const userData = {
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
        profileImage: null
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      alert('Data saved to localStorage!');
      window.location.href="../index.html"

      
    }
  });
});