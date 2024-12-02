// popup.js

document.getElementById("save").addEventListener("click", () => {
  const topic = document.getElementById("topic").value.trim();
  if (topic) {
    chrome.storage.sync.set({ topic: topic }, () => {
      alert("Topic saved! YouTube recommendations will be updated shortly.");
    });
  } else {
    alert("Please enter a topic.");
  }
});

(() => {
  "use strict";

  let storage = chrome.storage.sync || chrome.storage.local;

  // Get settings and set values on load
  function getSettings(callback) {
    storage.get(null, (settings) => {
      if (chrome.runtime.lastError) {
        storage = chrome.storage.local;
        storage.get(null, callback);
      } else {
        callback(settings);
      }
    });
  }

  // Save settings to storage
  function saveSettings(newSettings) {
    storage.set(newSettings, () => {
      if (chrome.runtime.lastError) {
        storage = chrome.storage.local;
        storage.set(newSettings);
      }
    });
  }

  // Apply settings
  function applySettings(settings) {
    const ytOnCheckbox = document.getElementById("yt_on");
    ytOnCheckbox.checked = settings.yt_on ?? true;

    document.getElementById("hide_comments").checked =
      settings.hide_comments ?? false;
    document.getElementById("hide_sidebar").checked =
      settings.hide_sidebar ?? false;
    document.getElementById("hide_shorts").checked =
      settings.hide_shorts ?? false;

    document.documentElement.setAttribute("yt_on", settings.yt_on);
  }

  // Toggle YouTube On/Off
  function toggleYouTubeOn() {
    const ytOnCheckbox = document.getElementById("yt_on");
    const ytOn = ytOnCheckbox.checked;
    saveSettings({ yt_on: ytOn });
    document.documentElement.setAttribute("yt_on", ytOn);
  }

  // Event listeners for checkboxes
  document.addEventListener("DOMContentLoaded", () => {
    getSettings(applySettings);

    document
      .getElementById("yt_on")
      .addEventListener("change", toggleYouTubeOn);
    document
      .getElementById("hide_comments")
      .addEventListener("change", function () {
        saveSettings({ hide_comments: this.checked });
      });
    document
      .getElementById("hide_sidebar")
      .addEventListener("change", function () {
        saveSettings({ hide_sidebar: this.checked });
      });
    document
      .getElementById("hide_shorts")
      .addEventListener("change", function () {
        saveSettings({ hide_shorts: this.checked });
      });

    // On/Off button functionality
    // document.getElementById("off").addEventListener("click", function () {
    //   document.getElementById("yt_on").click();
    // });
  });
})();