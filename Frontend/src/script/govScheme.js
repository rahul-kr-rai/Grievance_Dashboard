// --- 1. GOVERNMENT SCHEMES LOGIC (GovSchame.html) ---

function toggleDetails(schemeId) {
    const details = document.getElementById(schemeId);
    if (details) {
        details.style.display = (details.style.display === "block") ? "none" : "block";
    }
}