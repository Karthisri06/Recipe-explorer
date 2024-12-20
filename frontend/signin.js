// Handle the form submission
const handleSignIn = async (event) => {
    event.preventDefault(); // Prevent the default form submission
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    // Send the email and password to the backend API
    try {
      const response = await fetch('http://localhost:3001/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (data.message) {
        if (response.status === 404) {
          // Show the "Email doesn't exist" error
          document.getElementById('errorMessage').textContent = 'Email does not exist';
          document.getElementById('errorMessage').classList.remove('hidden');
        } else if (response.status === 401) {
          // Show the "Incorrect password" error
          document.getElementById('errorMessage').textContent = 'Incorrect password';
          document.getElementById('errorMessage').classList.remove('hidden');
        } else {
          // Show other errors or success messages
          document.getElementById('errorMessage').textContent = data.message || 'Something went wrong';
          document.getElementById('errorMessage').classList.remove('hidden');
        }
      }
  
      if (response.ok) {
        // If sign-in is successful, redirect to the dashboard or other page
        window.location.href = '/third.html';  // Modify according to your redirect URL
      }
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('errorMessage').textContent = 'Something went wrong';
      document.getElementById('errorMessage').classList.remove('hidden');
    }
  };
  
  // Attach the event listener to the form
  document.getElementById('signInForm').addEventListener('submit', handleSignIn);
  



