// content.js

const apiKey = 'AIzaSyBY1REpf7o80LPoA7n83lCcynfRe5gdIqY';

// Function to hide all recommended videos
function hideRecommendedVideos() {
  const elements = document.querySelectorAll('ytd-rich-grid-media, ytd-compact-video-renderer, ytd-video-renderer');
  elements.forEach(element => {
    element.style.display = 'none';
  });
}

// Function to create and display filtered content
function displayFilteredContent(videos) {
  const container = document.querySelector('ytd-rich-grid-renderer');
  if (container) {
    const videoList = document.createElement('div');
    videoList.style.display = 'grid';
    videoList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))'; // Responsive grid layout
    videoList.style.gap = '16px'; // Space between items
    videoList.style.padding = '16px'; // Padding around the grid
    videoList.style.boxSizing = 'border-box'; // Include padding in width/height calculations

    videos.forEach(video => {
      const videoElement = document.createElement('div');
      videoElement.style.backgroundColor = '#fff'; // White background for video element
      videoElement.style.borderRadius = '8px'; // Rounded corners
      videoElement.style.overflow = 'hidden'; // Clip overflow
      videoElement.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'; // Subtle shadow effect
      videoElement.style.cursor = 'pointer'; // Cursor changes to pointer on hover
      videoElement.style.transition = 'transform 0.2s'; // Smooth transition for hover effect

      videoElement.innerHTML = `
        <a href="${video.url}" style="text-decoration: none; color: inherit;">
          <img src="${video.thumbnail}" alt="${video.title}" style="width: 100%; height: auto; border-bottom: 1px solid #e0e0e0;" />
          <div style="padding: 8px;">
            <h4 style="margin: 0; font-size: 14px; line-height: 1.2;">${video.title}</h4>
          </div>
        </a>`;
      
      // Hover effect for video elements
      videoElement.addEventListener('mouseenter', () => {
        videoElement.style.transform = 'scale(1.02)'; // Slightly enlarge video on hover
      });
      videoElement.addEventListener('mouseleave', () => {
        videoElement.style.transform = 'scale(1)'; // Reset scale on mouse leave
      });

      videoList.appendChild(videoElement);
    });

    // Clear the container and append the new video list
    container.innerHTML = '';
    container.appendChild(videoList);
  }
}



// Function to fetch video details to check duration
function fetchVideoDetails(videoId) {
  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`;
  
  return fetch(detailsUrl)
    .then(response => response.json())
    .then(data => {
      if (data.items.length > 0) {
        const duration = data.items[0].contentDetails.duration; // Get the duration
        return duration;
      }
      return null; // Return null if no data found
    });
}

// Modify the main fetch function to include duration check
async function fetchVideosByTopic(topic) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic)}&key=${apiKey}&type=video&maxResults=30`;

  const response = await fetch(url);
  const data = await response.json();
  
  // Fetch all video details for duration filtering
  const videoDetailsPromises = data.items.map(async (item) => {
    const videoId = item.id.videoId;
    const duration = await fetchVideoDetails(videoId);
    return {
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail: item.snippet.thumbnails.medium.url,
      description: item.snippet.description,
      duration: duration // Store the duration
    };
  });

  const videos = await Promise.all(videoDetailsPromises);

  // Filter out Shorts and those under 60 seconds
  const filteredVideos = videos.filter(video => 
    !video.url.includes('/shorts/') && // Exclude Shorts
    (video.title.toLowerCase().includes(topic.toLowerCase()) || 
     video.description.toLowerCase().includes(topic.toLowerCase())) &&
    !video.duration.includes("PT0") // Exclude videos under 1 minute
  );

  displayFilteredContent(filteredVideos);
}





// Listen for changes in storage and update the page accordingly
chrome.storage.onChanged.addListener((changes) => {
  if (changes.topic && changes.topic.newValue) {
    hideRecommendedVideos();
    fetchVideosByTopic(changes.topic.newValue);
  }
});

// Initial run to set up the page based on saved topic
chrome.storage.sync.get('topic', (data) => {
  if (data.topic) {
    hideRecommendedVideos();
    fetchVideosByTopic(data.topic);
  }
});



(() => {
  "use strict";
  (() => {
    let e,
      t = chrome;
    function n(n, o = null, r = []) {
      e.get(o, (c) => {
        t.runtime.lastError
          ? ((e = t.storage.local),
            e.get(o, (e) => {
              n(e, ...r);
            }))
          : n(c, ...r);
      });
    }
    const o =
        ("object" == typeof browser &&
          "object" == typeof browser.runtime &&
          (t = browser),
        (e = t.storage.local),
        "object" == typeof t.storage.sync && (e = t.storage.sync),
        t),
      r = document.documentElement;
    function c(e) {
      Object.keys(e).forEach((t) => {
        -1 !== t.indexOf("hide") && r.setAttribute(t, e[t]);
      });
    }
    function i(e) {
      !0 === e.yt_on && c(e),
        (function () {
          const e = document.createElement("script");
          (e.src = o.runtime.getURL("js/ydt.js")),
            (e.id = "ydt"),
            r.appendChild(e);
        })();
    }
    function u(e) {
      Object.keys(e).forEach((e) => {
        -1 !== e.indexOf("hide") && r.removeAttribute(e);
      });
    }
    function s() {
      n(i),
        o.storage.onChanged.addListener((e) => {
          Object.prototype.hasOwnProperty.call(e, "yt_on")
            ? e.yt_on.newValue
              ? n(c)
              : n(u)
            : Object.keys(e).forEach((t) => {
                -1 !== t.indexOf("hide") && r.setAttribute(t, e[t].newValue);
              });
        });
    }
    document.unhookRunning ||
      ((document.unhookRunning = !0),
      window === window.parent
        ? s()
        : window.addEventListener("DOMContentLoaded", () => {
            document.getElementById("player") && s();
          }));
  })();
})();
