// youtube.js

/**
 * Renders a list of YouTube video items to the DOM.
 * This function is used for both real API data and mock fallback data.
 * @param {Array} videos - An array of video objects.
 */
const renderVideos = (videos) => {
    const videoListContainer = document.getElementById('youtube-videos-list');
    if (!videoListContainer) {
        console.error('The element with id "youtube-videos-list" was not found.');
        return;
    }

    videoListContainer.innerHTML = ''; // Clear previous content

    if (videos.length === 0) {
        videoListContainer.innerHTML = '<p>No YouTube videos found.</p>';
        return;
    }

    videos.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';

        const thumbnail = document.createElement('img');
        // The thumbnail URL is often nested in the YouTube API response
        const thumbnailUrl = video.snippet.thumbnails.high.url;
        thumbnail.src = thumbnailUrl;
        thumbnail.alt = video.snippet.title;

        // Add an onerror handler for fallback images
        thumbnail.onerror = function() {
            console.warn(`Failed to load thumbnail for video: ${video.id.videoId}`);
            this.onerror = null; // Prevents infinite loops
            this.src = '/path/to/your/fallback-thumbnail.jpg'; // Use a local placeholder image
        };

        const videoLink = document.createElement('a');
        videoLink.href = `https://www.youtube.com/watch?v=${video.id.videoId}`;
        videoLink.target = '_blank'; // Open in a new tab
        videoLink.appendChild(thumbnail);

        const title = document.createElement('h4');
        title.textContent = video.snippet.title;

        videoItem.appendChild(videoLink);
        videoItem.appendChild(title);
        videoListContainer.appendChild(videoItem);
    });
};

/**
 * Generates and returns a list of mock video data to use as a fallback.
 * @returns {Array} An array of mock video objects.
 */
const getMockVideos = () => {
    const fallbackThumbnail = '/path/to/your/fallback-thumbnail.jpg';
    return [
        {
            id: { videoId: 'mock-video-1' },
            snippet: {
                title: 'Mock Video 1: Placeholder Content',
                thumbnails: { high: { url: fallbackThumbnail } }
            }
        },
        {
            id: { videoId: 'mock-video-2' },
            snippet: {
                title: 'Mock Video 2: Example Loading Failure',
                thumbnails: { high: { url: fallbackThumbnail } }
            }
        },
        {
            id: { videoId: 'mock-video-3' },
            snippet: {
                title: 'Mock Video 3: API Unavailable',
                thumbnails: { high: { url: fallbackThumbnail } }
            }
        }
    ];
};

/**
 * Fetches YouTube videos from the API and renders them.
 * Displays mock videos if the fetch fails.
 * @param {string} query - The search query for the videos.
 */
export const fetchYouTubeVideos = async (query) => {
    const videoListContainer = document.getElementById('youtube-videos-list');
    videoListContainer.innerHTML = 'Loading videos...'; // Show loading message

    try {
        const response = await fetch(`/api/youtube-videos?q=${encodeURIComponent(query)}&maxResults=3`);
       
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch YouTube videos');
        }

        const data = await response.json();
       
        if (data.items && data.items.length > 0) {
            renderVideos(data.items);
        } else {
            // No videos found from the API, use mocks
            renderVideos(getMockVideos());
        }

    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        // On any fetch failure, render the mock videos.
        renderVideos(getMockVideos());
        // Optional: Add a user-facing error message
        videoListContainer.insertAdjacentHTML('afterbegin', `<p style="color: red;">⚠️ Error loading videos. Displaying mock content.</p>`);
    }
};

// Example usage when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchYouTubeVideos('COVID-19 WHO update');
});
