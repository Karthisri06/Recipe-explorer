document
  .querySelector("#signup-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    // Collect form data
    const email = document.querySelector("input[name='email']").value;
    const password = document.querySelector("input[name='password']").value;
    const confirmPassword = document.querySelector("input[name='confirmPassword']").value;

    // Check if passwords match
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Prepare data for the backend API (no need to send confirmPassword)
    const userData = {
      email,
      password,
    };

    // Log the data to the console before sending it
    console.log('Sending to backend:', userData);

    // Send data to the backend API (sign up)
    fetch("http://localhost:3001/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => response.json()) // Parse the JSON response
      .then((data) => {
        if (data.error) {
          alert(data.error); // Show error message if signup failed
        } else {
          alert("Sign-up successful!");
          window.location.href = "index.html"; // Redirect to login page if successful
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Something went wrong. Please try again.");
      });
  });



