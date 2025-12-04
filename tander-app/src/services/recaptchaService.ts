/**
 * reCAPTCHA v3 Service for React Native
 * Uses WebView to execute Google reCAPTCHA and retrieve tokens
 */

// Google's test site key (for development)
// In production, replace with your actual reCAPTCHA v3 site key
export const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

/**
 * Generates HTML content for reCAPTCHA WebView
 * @param siteKey - reCAPTCHA site key
 * @param action - Action name for this token (e.g., 'verify_id')
 * @returns HTML string to load in WebView
 */
export const generateRecaptchaHTML = (siteKey: string, action: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://www.google.com/recaptcha/api.js?render=${siteKey}"></script>
</head>
<body>
    <script>
        grecaptcha.ready(function() {
            grecaptcha.execute('${siteKey}', { action: '${action}' })
                .then(function(token) {
                    // Send token back to React Native
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'recaptcha_token',
                        token: token
                    }));
                })
                .catch(function(error) {
                    // Send error back to React Native
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'recaptcha_error',
                        error: error.message || 'Failed to generate reCAPTCHA token'
                    }));
                });
        });
    </script>
</body>
</html>
  `;
};

/**
 * Generate a reCAPTCHA token for a specific action
 * @param action - Action name (e.g., 'verify_id', 'login', 'register')
 * @returns Promise that resolves to the reCAPTCHA token
 */
export const generateRecaptchaToken = async (action: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // For React Native, we need to use the RecaptchaWebView component
    // This function serves as a placeholder and documentation
    // The actual implementation is in RecaptchaWebView component

    console.log(`📝 [recaptchaService] Token generation requested for action: ${action}`);

    // This will be called by the RecaptchaWebView component
    // The component will handle the WebView and token generation
    reject(new Error('Use RecaptchaWebView component to generate tokens'));
  });
};

export default {
  RECAPTCHA_SITE_KEY,
  generateRecaptchaHTML,
  generateRecaptchaToken,
};
