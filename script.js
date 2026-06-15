function validateAndSend() {
  const form = document.getElementById("contactForm");
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  // Validation
  if (name.length < 2) {
    document.querySelector(".valid-name").classList.remove("hidden");
    setTimeout(closeName, 3000);
    return;
  }

  if (!validateEmail(email)) {
    document.querySelector(".valid-Mail").classList.remove("hidden");
    setTimeout(closeMail, 3000);
    return;
  }

  if (message.length < 10 || message.length > 500) {
    document.querySelector(".valid-Message").classList.remove("hidden");
    setTimeout(closeMessage, 3000);
    return;
  }

  // Si tout est valide, envoyer les données au serveur
  sendEmailToServer(name, email, message);
}

async function sendEmailToServer(name, email, message) {
  const submitButton = document.querySelector(
    'button[onclick="validateAndSend()"]'
  );
  const originalText = submitButton.innerHTML;

  // Désactiver le bouton et afficher un loader
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="truncate">Envoi en cours...</span>';

  try {
    // Préparer les données du formulaire
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("message", message);

    // Envoyer la requête au serveur PHP
    const response = await fetch("send-email.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      // Succès : afficher la popup de confirmation
      popupSend();
      // Réinitialiser le formulaire
      document.getElementById("contactForm").reset();
      document.getElementById("charCount").textContent = "0";
    } else {
      // Erreur : afficher un message d'erreur
      showError(result.message || "Erreur lors de l'envoi du message");
    }
  } catch (error) {
    console.error("Erreur:", error);
    showError("Erreur de connexion au serveur. Veuillez réessayer.");
  } finally {
    // Réactiver le bouton
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  }
}

function showError(message) {
  // Créer et afficher un message d'erreur temporaire
  const errorDiv = document.createElement("div");
  errorDiv.className =
    "max-w-[448px] flex flex-col bg-[#db2019]/25 rounded-lg border-2 border-[#db2019] justify-center overflow-hidden p-4 m-4";
  errorDiv.innerHTML = `<p class="text-[#db2019] text-sm font-normal leading-normal">${message}</p>`;

  const formContainer = document.querySelector(".layout-content-container");
  formContainer.insertBefore(errorDiv, formContainer.firstChild);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function updateCharCount() {
  const textarea = document.getElementById("messageBox");
  document.getElementById("charCount").textContent = textarea.value.length;
}

function popupSend() {
  document.querySelector(".message-send").classList.remove("hidden");
  setTimeout(closePopup, 3000);
}
function closePopup() {
  document.querySelector(".message-send").classList.add("hidden");
}
function closeName() {
  document.querySelector(".valid-name").classList.add("hidden");
}
function closeMail() {
  document.querySelector(".valid-Mail").classList.add("hidden");
}
function closeMessage() {
  document.querySelector(".valid-Message").classList.add("hidden");
}
