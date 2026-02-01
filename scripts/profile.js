// I hardcoded this for now to be the same as the logged in user
// Basically, if this is changed, the edit button will not be displayed
const loggedInUserID = "12345678";

const profileUserID = document.querySelector("main").dataset.profileid;

const profileDetails = document.querySelector(".profile-details");
const block = document.querySelector(".block1");    
const formActions = document.querySelector(".form-actions");
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const changePhotoBtn = document.getElementById("changePhotoBtn");
const photoInput = document.getElementById("photoInput");
const profileImage = document.getElementById("profileImage");

const inputs = document.querySelectorAll(".profile-form input");

if (loggedInUserID === profileUserID) {
    editBtn.style.display = "block";
    formActions.style.display = "flex"; 
};

editBtn.addEventListener("click", () => {
    inputs.forEach(input => input.removeAttribute("disabled"));
    block.style.gridTemplateColumns = "auto 45rem";
    profileDetails.style.display = "flex";
    saveBtn.style.display = "block";
    cancelBtn.style.display = "block";
    changePhotoBtn.style.display = "block";
    editBtn.style.display = "none";
});

cancelBtn.addEventListener("click", () => {
    inputs.forEach(input => input.setAttribute("disabled", "true"));
    block.style.gridTemplateColumns = "auto";
    profileDetails.style.display = "none";
    saveBtn.style.display = "none";
    cancelBtn.style.display = "none";
    changePhotoBtn.style.display = "none";
    editBtn.style.display = "block";
});

// Imma switch this later, I think there must be something better
saveBtn.addEventListener("click", (e) => {
    e.preventDefault();

    var isComplete = true;

    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].value.trim() === "") {
            isComplete = false;
            break;
        }
    }

    if (!isComplete) {
        alert("Please fill in all fields before saving.");
        return;
    }

    inputs.forEach(input => {
        switch (input.placeholder) {
            case "First Name":
                document.getElementById("firstName").textContent = input.value;
                break;
            case "Last Name":
                document.getElementById("lastName").textContent = input.value;
                break;
            case "Enter your email":
                document.getElementById("email").textContent = input.value;
                break;
            case "Enter your student ID":
                document.getElementById("studentID").textContent = input.value;
                break;
            case "Enter your address":
                document.getElementById("address").textContent = input.value;
                break;
            case "Enter your contact number":
                document.getElementById("contactNumber").textContent = input.value;
                break;
        }
    });

    block.style.gridTemplateColumns = "auto";
    profileDetails.style.display = "none";
    saveBtn.style.display = "none";
    cancelBtn.style.display = "none";
    changePhotoBtn.style.display = "none";
    editBtn.style.display = "block";
});

changePhotoBtn.addEventListener("click", () => {
    photoInput.click();
});

photoInput.addEventListener("change", (event) => {
    const file = photoInput.files[0]
    if (file) {
        const reader = new FileReader();        
        reader.onload = function(e) {
            profileImage.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});