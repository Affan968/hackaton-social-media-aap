document.addEventListener('DOMContentLoaded', () => {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const loginBtn = document.getElementById('loginBtn');

  // Toggle password visibility
  togglePasswordBtn.addEventListener('click', () => {
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
  });

  // On login button click
  loginBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Get stored signup data from localStorage
    const signupData = JSON.parse(localStorage.getItem('userData'));

    console.log("Signup Data => ", signupData);

    if (!signupData) {
      alert("No account found! Please create an account first.");
      return;
    }

    const enteredEmail = emailInput.value.trim();
    const enteredPassword = passwordInput.value.trim();

    // Validate empty fields
    if (!enteredEmail || !enteredPassword) {
      alert("Please enter both email and password.");
      return;
    }

    // Compare login with signup data
    if (
      enteredEmail === signupData.email &&
      enteredPassword === signupData.password
    ) {
      alert(`Login successful! Welcome back, ${signupData.firstName}`);

      // Save login data
      const loginData = { email: enteredEmail, password: enteredPassword };
      localStorage.setItem('loginData', JSON.stringify(loginData));
      window.location.href="../../index.html";

    } else {
      alert("Incorrect email or password!");
    }
  });
});